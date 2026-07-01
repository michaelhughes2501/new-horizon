Set-Location 'C:\FeloniousApps\1main\new-horizon-original\NewHorizon'
$json = Get-Content package.json -Raw | ConvertFrom-Json
Write-Output 'VALID_JSON'
Write-Output ('supabase: ' + $json.dependencies.'@supabase/supabase-js')
Write-Output ('expo: ' + $json.dependencies.expo)
