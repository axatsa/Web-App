@echo off
title Optimizer Demo Launcher
echo ===================================================
echo       OPTIMIZER DEMO LAUNCHER
echo ===================================================
echo.
echo 1. Starting Backend API (Port 8000)...
start "Backend API" cmd /k "python api.py"

echo 2. Starting Telegram Bot...
start "Telegram Bot" cmd /k "python main.py"

echo 3. Starting Frontend (Port 5173)...
start "Frontend" cmd /k "npm run dev & timeout /t 5 & start http://localhost:5173"

echo.
echo ===================================================
echo       ALL SYSTEMS GO!
echo ===================================================
echo.
echo Please do not close the opened windows.
echo You can minimize them.
echo.
pause
