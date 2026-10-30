$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$collectionPath = Join-Path $PSScriptRoot 'rikkei-ecommerce.postman_collection.json'
$environmentPath = Join-Path $PSScriptRoot 'local.postman_environment.json'
$environmentConfig = Get-Content -LiteralPath $environmentPath -Raw | ConvertFrom-Json
$baseUrl = ($environmentConfig.values | Where-Object { $_.key -eq 'baseUrl' } | Select-Object -First 1).value
$temporaryEnvironment = Join-Path $env:TEMP ("rikkei-postman-" + [guid]::NewGuid().ToString('N') + '.json')

if ([string]::IsNullOrWhiteSpace($baseUrl)) {
  throw 'Set baseUrl in the local Postman environment before running the collection.'
}
$apiUri = $null
if (-not [uri]::TryCreate($baseUrl, [System.UriKind]::Absolute, [ref]$apiUri) -or -not $apiUri.IsLoopback) {
  throw 'This destructive test collection may only target localhost or a loopback IP.'
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw 'Docker CLI is required. Start Docker Desktop and install the Docker CLI.'
}
if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Get-Command npx.cmd -ErrorAction SilentlyContinue)) {
  throw 'Node.js and npm/npx are required to run the Postman collection with Newman.'
}

Push-Location $repoRoot
try {
  $backendEnvironment = & docker compose exec -T backend printenv APP_ENV
  if ($LASTEXITCODE -ne 0 -or ($backendEnvironment -join '').Trim() -ne 'development') {
    throw 'The local backend must run with APP_ENV=development to run this test collection.'
  }

  try {
    $health = Invoke-RestMethod ($baseUrl.TrimEnd('/') + '/healthz') -TimeoutSec 5
    if ($health.data.status -ne 'ok') { throw 'Backend health check did not report ok.' }
  } catch {
    throw "Local backend is unavailable at $baseUrl. Start the Docker Compose stack or correct baseUrl in the Postman environment."
  }

  & npx.cmd --yes newman run $collectionPath --environment $environmentPath --export-environment $temporaryEnvironment --reporters cli --bail
  if ($LASTEXITCODE -ne 0) { throw 'The main Postman collection run failed.' }

  $environment = Get-Content -LiteralPath $temporaryEnvironment -Raw | ConvertFrom-Json
  $testEmail = ($environment.values | Where-Object { $_.key -eq 'testEmail' } | Select-Object -First 1).value
  if ([string]::IsNullOrWhiteSpace($testEmail)) {
    throw 'Newman did not export the disposable test account email; cannot run the valid OTP flow.'
  }

  $otp = $null
  $logs = & docker compose logs backend --no-color
  if ($LASTEXITCODE -eq 0) {
    $pattern = 'DEV password reset code for ' + [regex]::Escape($testEmail) + ': (\d{6})'
    foreach ($line in $logs) {
      if ($line -match $pattern) { $otp = $Matches[1] }
    }
  }

  if ([string]::IsNullOrWhiteSpace($otp)) {
    Write-Warning 'The backend did not expose a development OTP in its logs. The valid OTP requests were not run; use the manual instructions in postman/README.md.'
    return
  }

  $resetVariable = $environment.values | Where-Object { $_.key -eq 'resetOtp' } | Select-Object -First 1
  if ($null -eq $resetVariable) {
    $environment.values += [pscustomobject]@{
      key = 'resetOtp'
      value = $otp
      type = 'secret'
      enabled = $true
    }
  } else {
    $resetVariable.value = $otp
  }

  $json = ConvertTo-Json -InputObject $environment -Depth 20
  [System.IO.File]::WriteAllText($temporaryEnvironment, $json, (New-Object System.Text.UTF8Encoding($false)))

  & npx.cmd --yes newman run $collectionPath --environment $temporaryEnvironment --folder 'Manual Password Reset (requires OTP)' --reporters cli --bail
  if ($LASTEXITCODE -ne 0) { throw 'The valid OTP verification/password reset collection run failed.' }
} finally {
  if (Test-Path -LiteralPath $temporaryEnvironment) {
    Remove-Item -LiteralPath $temporaryEnvironment -Force
  }
  Pop-Location
}
