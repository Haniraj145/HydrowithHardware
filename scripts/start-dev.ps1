$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$mlServicePath = Join-Path $repoRoot 'ml-service'
$backendPath = Join-Path $repoRoot 'backend'
$frontendPort = 3000
$mlPort = 8001
$backendPort = 8000

$frontendProcess = $null
$mlProcess = $null
$backendProcess = $null

function Stop-ProcessTree {
  param([System.Diagnostics.Process]$Process)

  if ($null -eq $Process -or $Process.HasExited) {
    return
  }

  try {
    Stop-Process -Id $Process.Id -Force
  } catch {
    # ignore
  }
}

try {
  Write-Host 'Starting Express backend server...' -ForegroundColor Cyan
  $backendProcess = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run dev' -WorkingDirectory $backendPath -PassThru

  Write-Host 'Starting ML service...' -ForegroundColor Cyan
  $mlProcess = Start-Process -FilePath (Join-Path $mlServicePath 'venv/Scripts/python.exe') -ArgumentList '-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', $mlPort -WorkingDirectory $mlServicePath -PassThru

  Write-Host 'Starting frontend dev server...' -ForegroundColor Cyan
  $frontendProcess = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run dev -- --host 0.0.0.0 --port 3000' -WorkingDirectory $repoRoot -PassThru

  Write-Host "Express backend: http://127.0.0.1:$backendPort" -ForegroundColor Green
  Write-Host "ML service: http://127.0.0.1:$mlPort" -ForegroundColor Green
  Write-Host "Frontend: http://127.0.0.1:$frontendPort" -ForegroundColor Green

  while ($true) {
    Start-Sleep -Seconds 5
  }
}
finally {
  if ($null -ne $frontendProcess) {
    Stop-ProcessTree $frontendProcess
  }
  if ($null -ne $mlProcess) {
    Stop-ProcessTree $mlProcess
  }
  if ($null -ne $backendProcess) {
    Stop-ProcessTree $backendProcess
  }
}
