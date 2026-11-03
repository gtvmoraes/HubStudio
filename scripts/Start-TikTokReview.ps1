$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path $PSScriptRoot -Parent)
$env:VITE_API_URL = 'http://localhost:8080'
Write-Host 'Abra http://localhost:3000/dev/tiktok/review'
& npm.cmd run dev -- --host 127.0.0.1 --port 3000 --strictPort
