$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot '.env'
$seedPath = Join-Path $PSScriptRoot 'seed.local.sql'
if (-not (Test-Path -LiteralPath $envPath)) {
  throw 'Không tìm thấy .env ở thư mục gốc. Hãy tạo .env từ .env.example trước.'
}

$settings = @{}
Get-Content -LiteralPath $envPath | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$' -and -not $Matches[1].StartsWith('#')) {
    $settings[$Matches[1]] = $Matches[2].Trim('"', "'")
  }
}

foreach ($name in @('DB_USERNAME', 'DB_PASSWORD', 'DB_NAME')) {
  if (-not $settings.ContainsKey($name) -or [string]::IsNullOrWhiteSpace($settings[$name])) {
    throw "Thiếu $name trong .env."
  }
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
  $dockerPath = $docker.Source
} else {
  $dockerPath = Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\resources\bin\docker.exe'
  if (-not (Test-Path -LiteralPath $dockerPath)) { throw 'Không tìm thấy Docker CLI.' }
}

Push-Location $repoRoot
try {
  & $dockerPath compose cp $seedPath 'mysql:/tmp/seed.local.sql'
  if ($LASTEXITCODE -ne 0) { throw 'Không chép được file seed vào container MySQL.' }

  & $dockerPath compose exec -T -e "MYSQL_PWD=$($settings['DB_PASSWORD'])" mysql mysql "-u$($settings['DB_USERNAME'])" $settings['DB_NAME'] -e 'source /tmp/seed.local.sql'
  if ($LASTEXITCODE -ne 0) { throw 'Nạp seed thất bại. Kiểm tra lỗi SQL phía trên.' }

  & $dockerPath compose exec -T -e "MYSQL_PWD=$($settings['DB_PASSWORD'])" mysql mysql "-u$($settings['DB_USERNAME'])" $settings['DB_NAME'] -e 'SELECT COUNT(*) AS seed_users FROM users WHERE id BETWEEN 900001 AND 900006; SELECT COUNT(*) AS seed_products FROM products WHERE id BETWEEN 960001 AND 960003; SELECT COUNT(*) AS seed_orders FROM orders WHERE id=990001;'
  if ($LASTEXITCODE -ne 0) { throw 'Không đọc được số lượng dữ liệu seed.' }
  Write-Host 'Đã nạp dữ liệu local. Chạy lại script sẽ cập nhật các bản ghi seed có ID cố định.'
} finally {
  Pop-Location
}
