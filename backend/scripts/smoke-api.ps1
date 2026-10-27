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

Write-Host 'API smoke checks passed: health, register, email/phone login, refresh rotation/replay, RBAC, logout, password change, and malformed OTP rejection.'
