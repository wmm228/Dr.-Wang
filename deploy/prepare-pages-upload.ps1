param(
    [string]$OutputDir = "F:\Dr. wang\homepage-main\deploy\pages-dist",
    [switch]$Zip
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot

$includePaths = @(
    "about.html",
    "article.html",
    "blogs.html",
    "gallery.html",
    "index.html",
    "lab.html",
    "resources.html",
    "tags.html",
    "blog",
    "pdf",
    "posts",
    "resume",
    "static",
    "tags"
)

if (Test-Path $OutputDir) {
    Remove-Item -LiteralPath $OutputDir -Recurse -Force
}

New-Item -ItemType Directory -Path $OutputDir | Out-Null

foreach ($item in $includePaths) {
    $source = Join-Path $projectRoot $item
    if (-not (Test-Path $source)) {
        throw "Missing required path: $source"
    }

    Copy-Item -LiteralPath $source -Destination $OutputDir -Recurse -Force
}

$fileCount = (Get-ChildItem -LiteralPath $OutputDir -Recurse -File | Measure-Object).Count
$totalBytes = (Get-ChildItem -LiteralPath $OutputDir -Recurse -File | Measure-Object -Property Length -Sum).Sum

Write-Host "Pages upload directory ready: $OutputDir"
Write-Host "Files: $fileCount"
Write-Host "Bytes: $totalBytes"

if ($Zip) {
    $zipPath = Join-Path $PSScriptRoot "homepage-pages-upload.zip"
    if (Test-Path $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }

    Compress-Archive -Path (Join-Path $OutputDir "*") -DestinationPath $zipPath -Force
    Write-Host "Zip ready: $zipPath"
}
