@echo off
echo 🚀 Starting AI Trading Backend (Clean Mode)...
echo.

REM Kill any existing Python processes that might be using port 8000
echo 🔄 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    echo Killing process %%a on port 8000
    taskkill /f /pid %%a >nul 2>&1
)

REM Wait a moment
timeout /t 2 /nobreak >nul

echo 📦 Installing minimal dependencies...
py -m pip install fastapi uvicorn --quiet

echo 🔥 Starting backend server...
echo 📡 Server will be available at: http://localhost:8000
echo 📖 API Documentation: http://localhost:8000/docs
echo 🧪 Test the server: py backend/test_server.py
echo.
echo Press Ctrl+C to stop the server
echo.

cd backend
py main.py