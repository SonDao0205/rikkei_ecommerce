$ErrorActionPreference = 'Stop'

# Destructively recreates only the local Compose database, then restores a small
# curated fixture set. A full dump is saved outside the repository first.
$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $repoRoot '.env'
$schemaFile = Join-Path $PSScriptRoot 'scriptDb.sql'
$seedFile = Join-Path $PSScriptRoot 'seed.local.sql'
if (-not (Test-Path -LiteralPath $envFile)) { throw 'Missing root .env.' }

$settings = @{}
Get-Content -LiteralPath $envFile | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z0-9_]+)\s*=(.*?)\s*$' -and -not $_.TrimStart().StartsWith('#')) {
    $settings[$Matches[1]] = $Matches[2].Trim('"', "'")
  }
}

if ($settings['APP_ENV'] -ne 'development' -or $settings['DB_NAME'] -ne 'rikkei_ecommerce' -or $settings['DB_HOST'] -ne 'mysql') {
  throw 'Safety check failed. Reset requires APP_ENV=development, DB_NAME=rikkei_ecommerce, and DB_HOST=mysql.'
}
if ([string]::IsNullOrWhiteSpace($settings['DB_USERNAME']) -or [string]::IsNullOrWhiteSpace($settings['DB_PASSWORD']) -or [string]::IsNullOrWhiteSpace($settings['MYSQL_ROOT_PASSWORD'])) {
  throw 'DB_USERNAME, DB_PASSWORD, and MYSQL_ROOT_PASSWORD must be set in root .env.'
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) { $dockerPath = $docker.Source }
else {
  $dockerPath = Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\resources\bin\docker.exe'
  if (-not (Test-Path -LiteralPath $dockerPath)) { throw 'Docker CLI was not found.' }
}

Push-Location $repoRoot
$databaseWasRecreated = $false
$backupPath = $null
try {
  & $dockerPath compose up -d mysql
  if ($LASTEXITCODE -ne 0) { throw 'Could not start the local MySQL Compose service.' }

  $backupDirectory = Join-Path $env:USERPROFILE 'Documents\RikkeiEcommerceBackups'
  New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
  $backupPath = Join-Path $backupDirectory ("rikkei_ecommerce-before-reset-{0}.sql" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
  $dumpErrorPath = "$backupPath.stderr"
  $dumpOutput = & $dockerPath compose exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump --single-transaction --routines --triggers --databases "$MYSQL_DATABASE" -uroot' 2> $dumpErrorPath
  $dumpExitCode = $LASTEXITCODE
  if ($dumpExitCode -ne 0) { throw 'Database backup failed; no data was deleted. Review the adjacent .stderr file.' }
  [System.IO.File]::WriteAllText($backupPath, (($dumpOutput -join [Environment]::NewLine) + [Environment]::NewLine), [System.Text.UTF8Encoding]::new($false))
  if ((Get-Item -LiteralPath $backupPath).Length -lt 1000) { throw 'Database backup is unexpectedly small; no data was deleted.' }
  if (Test-Path -LiteralPath $dumpErrorPath) { Remove-Item -LiteralPath $dumpErrorPath -Force }

  Write-Host "Database target: local Compose MySQL / rikkei_ecommerce"
  Write-Host "Backup created: $backupPath"
  $confirmation = Read-Host 'This will erase all current local app data and restore seed fixtures. Type RESET LOCAL to continue'
  if ($confirmation -cne 'RESET LOCAL') { throw 'Reset cancelled. The backup remains available.' }

  & $dockerPath compose stop backend
  if ($LASTEXITCODE -ne 0) { throw 'Could not stop the local backend.' }

  $resetSql = 'DROP DATABASE IF EXISTS rikkei_ecommerce; CREATE DATABASE rikkei_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
  # Mark before executing: even a partially failed DROP/CREATE must trigger restore.
  $databaseWasRecreated = $true
  $resetSql | & $dockerPath compose exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot'
  if ($LASTEXITCODE -ne 0) { throw 'Could not recreate the local database.' }

  & $dockerPath compose cp $schemaFile 'mysql:/tmp/rikkei-scriptDb.sql'
  if ($LASTEXITCODE -ne 0) { throw 'Could not copy the schema into MySQL.' }
  & $dockerPath compose exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot < /tmp/rikkei-scriptDb.sql'
  if ($LASTEXITCODE -ne 0) { throw 'Schema import failed. Restore from the backup path shown above.' }

  & $dockerPath compose up -d backend
  if ($LASTEXITCODE -ne 0) { throw 'Could not start backend to apply development migrations.' }

  $apiPort = if ($settings['BACKEND_HOST_PORT']) { $settings['BACKEND_HOST_PORT'] } else { '8080' }
  $healthy = $false
  for ($attempt = 0; $attempt -lt 36; $attempt++) {
    try {
      $health = Invoke-RestMethod -Uri "http://127.0.0.1:$apiPort/healthz" -TimeoutSec 3
      if ($health.success -and $health.data.status -eq 'ok') { $healthy = $true; break }
    } catch { Start-Sleep -Seconds 5 }
  }
  if (-not $healthy) { throw 'Backend migration/health check failed. Restore from the backup path shown above.' }

  & $dockerPath compose cp $seedFile 'mysql:/tmp/seed.local.sql'
  if ($LASTEXITCODE -ne 0) { throw 'Could not copy curated fixtures into MySQL.' }
  & $dockerPath compose exec -T -e "MYSQL_PWD=$($settings['DB_PASSWORD'])" mysql mysql "-u$($settings['DB_USERNAME'])" $settings['DB_NAME'] -e 'source /tmp/seed.local.sql'
  if ($LASTEXITCODE -ne 0) { throw 'Fixture import failed. Restore from the backup path shown above.' }

  & $dockerPath compose restart backend
  if ($LASTEXITCODE -ne 0) { throw 'Could not restart backend after fixture import.' }
  Write-Host 'Local reset completed. Users, catalog, orders, and other application data now match database/seed.local.sql.'
  Write-Host "Backup retained at: $backupPath"
} catch {
  $failure = $_.Exception.Message
  if ($databaseWasRecreated -and $backupPath -and (Test-Path -LiteralPath $backupPath)) {
    Write-Warning 'Reset failed after database recreation. Attempting to restore the pre-reset backup.'
    try {
      & $dockerPath compose stop backend | Out-Null
      & $dockerPath compose cp $backupPath 'mysql:/tmp/rikkei-before-reset.sql' | Out-Null
      & $dockerPath compose exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot < /tmp/rikkei-before-reset.sql'
      if ($LASTEXITCODE -ne 0) { throw 'Restore command failed.' }
      & $dockerPath compose up -d backend | Out-Null
      Write-Warning "Previous data was restored from $backupPath"
    } catch {
      Write-Error "Automatic restore failed. Backup is still available at $backupPath"
    }
  }
  throw $failure
} finally {
  Pop-Location
}
