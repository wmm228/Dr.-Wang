$ErrorActionPreference = "SilentlyContinue"

$projectRoot = Split-Path -Parent $PSScriptRoot
$tunnelId = "1180950d-718c-48cc-9b84-8c00d5dba880"

$processes = Get-CimInstance Win32_Process | Where-Object {
    ($_.Name -eq "python.exe" -and $_.CommandLine -like "*$projectRoot*server.py*") -or
    ($_.Name -eq "cloudflared.exe" -and $_.CommandLine -like "*$tunnelId*")
}

foreach ($proc in $processes) {
    Stop-Process -Id $proc.ProcessId -Force
    Write-Host "Stopped $($proc.Name) ($($proc.ProcessId))"
}
