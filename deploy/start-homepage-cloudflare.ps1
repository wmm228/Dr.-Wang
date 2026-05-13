param(
    [int]$Port = 8000,
    [switch]$SkipDns
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $PSScriptRoot "cloudflare-homepage.yml"
$origincert = Join-Path $HOME ".cloudflared\\cert.pem"
$tunnelId = "1180950d-718c-48cc-9b84-8c00d5dba880"
$hostnames = @("wmumu.uno", "www.wmumu.uno")
$cloudflared = "C:\Users\wmummu\AppData\Local\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe"

if (-not (Test-Path $configPath)) {
    throw "Cloudflare config not found: $configPath"
}

if (-not (Test-Path $cloudflared)) {
    throw "cloudflared not found: $cloudflared"
}

$python = (Get-Command python -ErrorAction Stop).Source

Set-Location $projectRoot

Write-Host "Starting homepage on http://127.0.0.1:$Port ..."
$server = Start-Process -FilePath $python -ArgumentList "-u", "server.py" -WorkingDirectory $projectRoot -PassThru

try {
    Start-Sleep -Seconds 2
    Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$Port" | Out-Null
    Write-Host "Homepage is running locally."

    if (-not $SkipDns) {
        foreach ($hostname in $hostnames) {
            Write-Host "Ensuring DNS route for $hostname ..."
            & $cloudflared --origincert $origincert tunnel route dns $tunnelId $hostname
        }
    }

    Write-Host "Starting Cloudflare tunnel for $($hostnames -join ', ') ..."
    & $cloudflared tunnel --config $configPath run $tunnelId
}
finally {
    if ($server -and -not $server.HasExited) {
        Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
    }
}
