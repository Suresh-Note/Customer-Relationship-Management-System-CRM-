@echo off
echo Starting CRM App...

cd /d %~dp0

:: Start Backend
start cmd /k "cd backend && node server.js"

:: Wait 3 seconds
timeout /t 3 > nul

:: Start Frontend
start cmd /k "cd frontend && npm run dev"

:: Wait 5 seconds
timeout /t 5 > nul

:: Open browser
start http://localhost:5173/login
