@echo off
title AI Smart Civic Services - Full Stack Hackathon Platform
color 0B

echo =====================================================================
echo                AI SMART CIVIC SERVICES PLATFORM
echo          FastAPI Backend + Next.js App Router + shadcn UI
echo =====================================================================
echo.

echo [1/4] Starting FastAPI Machine Learning Backend (Port 8000)...
start "FastAPI Backend" cmd /c "cd /d "%~dp0\server" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/4] Waiting 2 seconds for backend initialization...
timeout /t 2 /nobreak >nul

echo [3/4] Starting Next.js shadcn UI Frontend (Port 3000)...
start "Next.js Frontend" cmd /c "cd /d "%~dp0\frontend" && npm run dev"

echo [4/4] Opening Application in Web Browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo =====================================================================
echo   Next.js Frontend: http://localhost:3000
echo   FastAPI Backend:  http://localhost:8000
echo   OpenAPI Docs:     http://localhost:8000/docs
echo =====================================================================
echo.
pause
