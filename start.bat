@echo off
echo 🚀 Starting AI Trading Platform...

REM Check if we're in the right directory
if not exist "backend\app\main.py" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

echo 📦 Installing backend dependencies...
cd backend
pip install -r requirements.txt

echo 🔥 Starting backend server...
start "Backend API" uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 📦 Installing frontend dependencies...
cd ..\frontend\vite-project
call npm install

echo 🎨 Starting frontend server...
start "Frontend" npm run dev

cd ..\..

echo.
echo 🎉 AI Trading Platform is starting!
echo ================================
echo.
echo 📊 Services:
echo   Backend API:     http://localhost:8000
echo   API Docs:        http://localhost:8000/docs
echo   Frontend:        http://localhost:5173
echo.
echo Press any key to exit...
pause > nul