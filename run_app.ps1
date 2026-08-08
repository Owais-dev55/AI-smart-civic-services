# AI Smart Civic Services - Full Stack Startup Script
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "               AI SMART CIVIC SERVICES PLATFORM" -ForegroundColor White
Write-Host "         FastAPI ML Backend + Next.js App Router + shadcn UI" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan

$baseDir = $PSScriptRoot
$serverDir = Join-Path $baseDir "server"
$frontendDir = Join-Path $baseDir "frontend"

Write-Host "`n[1/4] Starting FastAPI Machine Learning Backend on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$serverDir'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 2

Write-Host "`n[2/4] Starting Next.js shadcn UI Frontend on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "`n[3/4] Opening Next.js Web Application at http://localhost:3000 ..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`n[4/4] Full Stack Platform Online!" -ForegroundColor Cyan
Write-Host "  Next.js Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  FastAPI Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  OpenAPI Docs:     http://localhost:8000/docs" -ForegroundColor White
