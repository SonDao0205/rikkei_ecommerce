$ErrorActionPreference = 'Stop'
$base = if ($env:API_BASE_URL) { $env:API_BASE_URL.TrimEnd('/') } else { 'http://localhost:8080' }

function Invoke-Api {
  param(
    [Parameter(Mandatory)][string]$Method,
    [Parameter(Mandatory)][string]$Path,
    [object]$Body,
    [System.Net.CookieContainer]$Cookies,
    [string]$Bearer
  )

  $uri = [uri]($script:base + $Path)
  $request = [System.Net.HttpWebRequest]::Create($uri)
  $request.Method = $Method
  $request.Timeout = 15000
  if ($Cookies) { $request.CookieContainer = $Cookies }
  if ($Bearer) { $request.Headers['Authorization'] = "Bearer $Bearer" }
  if ($null -ne $Body) {
    $request.ContentType = 'application/json'
    $payload = [Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Compress))
    $request.ContentLength = $payload.Length
    $stream = $request.GetRequestStream()
    $stream.Write($payload, 0, $payload.Length)
    $stream.Close()
  }

  try { $response = $request.GetResponse() }
  catch [System.Net.WebException] {
    if (-not $_.Exception.Response) { throw }
    $response = $_.Exception.Response
  }
  $setCookie = $response.Headers['Set-Cookie']
  $reader = New-Object IO.StreamReader($response.GetResponseStream())
  $text = $reader.ReadToEnd()
  $reader.Close()
  $status = [int]$response.StatusCode
  $response.Close()
  $json = if ($text) { $text | ConvertFrom-Json } else { $null }
  return [pscustomobject]@{ Status = $status; Json = $json; SetCookie = $setCookie }
}

function Set-RefreshCookie {
  param([System.Net.CookieContainer]$Cookies, [string]$SetCookie)
  if (-not $SetCookie -or $SetCookie -notmatch '^refresh_token=([^;]+)') {
    throw 'Response did not set the refresh cookie'
  }
  $cookie = [System.Net.Cookie]::new('refresh_token', $Matches[1])
  $cookie.Path = '/api/v1/auth/refresh'
  $Cookies.Add([uri]"$base/api/v1/auth/refresh", $cookie)
  return $Matches[1]
}

$email = "smoke-$([guid]::NewGuid().ToString('N'))@example.test"
$phone = "+84$(([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() % 1000000000).ToString('D9'))"
$password = 'SmokeTest12345'
$null = Invoke-Api GET '/healthz'
$categories = Invoke-Api GET '/api/v1/categories'
if ($categories.Status -ne 200 -or $categories.Json.data[0].id -ne 0) { throw 'Public category API did not return the all-categories entry' }
$catalog = Invoke-Api GET '/api/v1/products?page=1&limit=10&sort=best_selling'
if ($catalog.Status -ne 200 -or $catalog.Json.data.total -lt 0) { throw "Public catalog API failed with HTTP $($catalog.Status)" }
$filteredCatalog = Invoke-Api GET '/api/v1/products?q=cotton&category_id=930002&brand_id=940001&min_price=100000&max_price=300000&min_rating=4.5&sort=price_asc&page=1&limit=10'
if ($filteredCatalog.Status -ne 200 -or $filteredCatalog.Json.data.products.Count -lt 1 -or $filteredCatalog.Json.data.products[0].id -ne 960001) {
  throw 'Catalog search/filter/sort did not return the expected seeded product'
}
$invalidCatalogPage = Invoke-Api GET '/api/v1/products?page=0'
if ($invalidCatalogPage.Status -ne 400) { throw "Invalid catalog page returned HTTP $($invalidCatalogPage.Status), expected 400" }
$invalidCatalogFilter = Invoke-Api GET '/api/v1/products?min_price=500&max_price=100'
if ($invalidCatalogFilter.Status -ne 400) { throw "Invalid catalog filter returned HTTP $($invalidCatalogFilter.Status), expected 400" }
$productDetail = Invoke-Api GET '/api/v1/products/960001'
if ($productDetail.Status -ne 200 -or $productDetail.Json.data.variants.Count -lt 1 -or $productDetail.Json.data.shop.id -ne 920001) {
  throw 'Product detail did not include its active variants and public shop'
}
$hiddenProductDetail = Invoke-Api GET '/api/v1/products/960003'
if ($hiddenProductDetail.Status -ne 404) { throw 'Unapproved product detail was publicly accessible' }
$shopDetail = Invoke-Api GET '/api/v1/shops/920001'
if ($shopDetail.Status -ne 200 -or $shopDetail.Json.data.shop.id -ne 920001 -or $shopDetail.Json.data.shop.PSObject.Properties.Name -contains 'warehouse_address') {
  throw 'Public shop detail is missing expected data or exposes the warehouse address'
}
$shopProducts = Invoke-Api GET '/api/v1/shops/920001/products?page=1&limit=10'
if ($shopProducts.Status -ne 200 -or $shopProducts.Json.data.products.Count -lt 1) { throw 'Shop product list failed' }
$registration = Invoke-Api POST '/api/v1/auth/register' @{ email = $email; password = $password; full_name = 'Smoke Test'; phone = $phone }
if ($registration.Status -ne 201) { throw "Registration failed with HTTP $($registration.Status)" }

# Login by email, then exercise refresh rotation and replay detection.
$emailCookies = New-Object System.Net.CookieContainer
$emailLogin = Invoke-Api POST '/api/v1/auth/login' @{ identifier = $email; password = $password } $emailCookies
if ($emailLogin.Status -ne 200) { throw "Email login failed with HTTP $($emailLogin.Status)" }
$oldRefresh = Set-RefreshCookie $emailCookies $emailLogin.SetCookie
$token = $emailLogin.Json.data.access_token
$me = Invoke-Api GET '/api/v1/auth/me' $null $null $token
if ($me.Status -ne 200 -or $me.Json.data.email -ne $email) { throw 'Email login or /me failed' }
$followState = Invoke-Api GET '/api/v1/shops/920001/follow' $null $emailCookies $token
if ($followState.Status -ne 200 -or $followState.Json.data.following -ne $false) { throw 'Initial shop follow state is incorrect' }
$followed = Invoke-Api POST '/api/v1/shops/920001/follow' $null $emailCookies $token
if ($followed.Status -ne 200 -or $followed.Json.data.following -ne $true) { throw 'Following a shop failed' }
$followedAgain = Invoke-Api POST '/api/v1/shops/920001/follow' $null $emailCookies $token
if ($followedAgain.Status -ne 200 -or $followedAgain.Json.data.follower_count -ne $followed.Json.data.follower_count) {
  throw 'Repeated follow changed the follower count'
}
$unfollowed = Invoke-Api DELETE '/api/v1/shops/920001/follow' $null $emailCookies $token
if ($unfollowed.Status -ne 200 -or $unfollowed.Json.data.following -ne $false) { throw 'Unfollowing a shop failed' }
$unfollowedAgain = Invoke-Api DELETE '/api/v1/shops/920001/follow' $null $emailCookies $token
if ($unfollowedAgain.Status -ne 200 -or $unfollowedAgain.Json.data.follower_count -ne $unfollowed.Json.data.follower_count) {
  throw 'Repeated unfollow changed the follower count'
}

$refresh = Invoke-Api POST '/api/v1/auth/refresh' $null $emailCookies
if ($refresh.Status -ne 200 -or -not $refresh.Json.data.access_token) { throw "Refresh did not issue a new access token (HTTP $($refresh.Status))" }
$null = Set-RefreshCookie $emailCookies $refresh.SetCookie
$token = $refresh.Json.data.access_token

$staleCookies = New-Object System.Net.CookieContainer
$staleCookie = [System.Net.Cookie]::new('refresh_token', $oldRefresh)
$staleCookie.Path = '/api/v1/auth/refresh'
$staleCookies.Add([uri]"$base/api/v1/auth/refresh", $staleCookie)
$replay = Invoke-Api POST '/api/v1/auth/refresh' $null $staleCookies
if ($replay.Status -ne 401) { throw "Reused refresh token returned HTTP $($replay.Status), expected 401" }
$afterReplay = Invoke-Api GET '/api/v1/auth/me' $null $null $token
if ($afterReplay.Status -ne 401) { throw 'Refresh-token replay did not revoke the session' }

# Phone login should work independently; CLIENT must not reach admin routes.
$phoneCookies = New-Object System.Net.CookieContainer
$phoneLogin = Invoke-Api POST '/api/v1/auth/login' @{ identifier = $phone; password = $password } $phoneCookies
if ($phoneLogin.Status -ne 200) { throw "Phone login failed with HTTP $($phoneLogin.Status)" }
$phoneToken = $phoneLogin.Json.data.access_token
$admin = Invoke-Api GET '/api/v1/admin/users' $null $null $phoneToken
if ($admin.Status -ne 403) { throw "CLIENT admin access returned HTTP $($admin.Status), expected 403" }
$adminInventory = Invoke-Api GET '/api/v1/admin/products' $null $null $phoneToken
if ($adminInventory.Status -ne 403) { throw "CLIENT inventory access returned HTTP $($adminInventory.Status), expected 403" }
$adminLogin = Invoke-Api POST '/api/v1/auth/login' @{ identifier = 'seed-admin@local.test'; password = 'LocalTest123!' }
if ($adminLogin.Status -ne 200) { throw 'Admin login failed for local seeded account' }
$sortedInventory = Invoke-Api GET '/api/v1/admin/products?sort_by=stock_asc' $null $null $adminLogin.Json.data.access_token
if ($sortedInventory.Status -ne 200 -or $sortedInventory.Json.data.products.Count -lt 1) {
  throw 'Admin inventory stock sort failed'
}
$invalidInventoryFilter = Invoke-Api GET '/api/v1/admin/products?sort_by=unknown' $null $null $adminLogin.Json.data.access_token
if ($invalidInventoryFilter.Status -ne 400) { throw 'Invalid admin inventory sort was not rejected' }
$logout = Invoke-Api POST '/api/v1/auth/logout' $null $phoneCookies $phoneToken
if ($logout.Status -ne 200) { throw "Logout failed with HTTP $($logout.Status)" }
$afterLogout = Invoke-Api GET '/api/v1/auth/me' $null $null $phoneToken
if ($afterLogout.Status -ne 401) { throw 'Logged-out session still accessed /me' }

# Password change requires authentication and revokes all refresh sessions.
$unauthorizedChange = Invoke-Api PUT '/api/v1/auth/password' @{ current_password = $password; new_password = 'ChangedSmoke123'; confirm_password = 'ChangedSmoke123' }
if ($unauthorizedChange.Status -ne 401) { throw 'Password change unexpectedly allowed without authentication' }
$changeCookies = New-Object System.Net.CookieContainer
$changeLogin = Invoke-Api POST '/api/v1/auth/login' @{ identifier = $email; password = $password } $changeCookies
if ($changeLogin.Status -ne 200) { throw 'Could not log in before password change' }
$changeToken = $changeLogin.Json.data.access_token
$changed = Invoke-Api PUT '/api/v1/auth/password' @{ current_password = $password; new_password = 'ChangedSmoke123'; confirm_password = 'ChangedSmoke123' } $null $changeToken
if ($changed.Status -ne 200) { throw "Password change failed with HTTP $($changed.Status)" }
$oldPassword = Invoke-Api POST '/api/v1/auth/login' @{ identifier = $email; password = $password }
if ($oldPassword.Status -ne 401) { throw 'Old password remained valid after password change' }
$newPassword = Invoke-Api POST '/api/v1/auth/login' @{ identifier = $email; password = 'ChangedSmoke123' }
if ($newPassword.Status -ne 200) { throw 'New password did not work after password change' }
$invalidOTP = Invoke-Api POST '/api/v1/auth/verify-reset-otp' @{ identifier = $email; otp = 'abcdef' }
if ($invalidOTP.Status -ne 400) { throw 'Malformed OTP was not rejected' }

Write-Host 'API smoke checks passed: catalog filters, product/shop detail, shop follow, admin inventory, auth, refresh replay, RBAC, password change, and OTP validation.'
