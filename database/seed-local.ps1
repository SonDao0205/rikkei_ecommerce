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

if ($settings['APP_ENV'] -ne 'development') {
  throw 'Seed chỉ được phép chạy khi APP_ENV=development.'
}
if ($settings['DB_NAME'] -ne 'rikkei_ecommerce') {
  throw 'Seed chỉ được phép chạy với DB_NAME=rikkei_ecommerce.'
}
$confirmation = Read-Host 'Seed sẽ upsert các fixture ID cố định trong database local rikkei_ecommerce. Nhập SEED LOCAL để tiếp tục'
if ($confirmation -cne 'SEED LOCAL') { throw 'Đã hủy seed.' }

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

  & $dockerPath compose exec -T -e "MYSQL_PWD=$($settings['DB_PASSWORD'])" mysql mysql "-u$($settings['DB_USERNAME'])" $settings['DB_NAME'] -e 'SELECT COUNT(*) AS seed_users FROM users WHERE id BETWEEN 900001 AND 900007; SELECT COUNT(*) AS seed_categories FROM categories WHERE id BETWEEN 930001 AND 930012; SELECT COUNT(*) AS seed_products FROM products WHERE id BETWEEN 960001 AND 960036; SELECT COUNT(*) AS public_products FROM products p JOIN shops s ON s.id=p.shop_id WHERE p.id BETWEEN 960001 AND 960036 AND p.status=''ACTIVE'' AND p.is_deleted=0 AND s.status=''ACTIVE''; SELECT COUNT(*) AS stock_movement_mismatches FROM product_variants v WHERE v.id BETWEEN 961001 AND 961042 AND v.stock<>COALESCE((SELECT SUM(sm.change_qty) FROM stock_movements sm WHERE sm.variant_id=v.id),0); SELECT COUNT(*) AS seed_orders FROM orders WHERE id=990001; SELECT o.total_amount AS order_total, SUM(so.total_amount) AS shop_order_total, SUM(oi.line_total) AS item_subtotal FROM orders o JOIN shop_orders so ON so.order_id=o.id JOIN order_items oi ON oi.shop_order_id=so.id WHERE o.id=990001 GROUP BY o.id;'
  if ($LASTEXITCODE -ne 0) { throw 'Không đọc được số lượng dữ liệu seed.' }
  Write-Host 'Đã nạp dữ liệu local. Chạy lại script sẽ cập nhật các bản ghi seed có ID cố định.'
} finally {
  Pop-Location
}
