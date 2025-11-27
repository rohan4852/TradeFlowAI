@echo off
echo 🚀 Starting AI Trading Backend...

REM Go to project root
cd ..

REM Check and activate virtual environment
if exist ".venv\Scripts\activate.bat" (
    echo 🐍 Activating virtual environment...
    call .venv\Scripts\activate.bat
) else (
    echo ⚠️  No virtual environment found. Creating one...
    py -m venv .venv
    call .venv\Scripts\activate.bat
    echo 📦 Installing dependencies...
    pip install -r backend\requirements.txt
)

REM Go back to backend directory
cd backend

echo 🔥 Starting FastAPI server...
echo 📡 Server will be available at: http://localhost:8000
echo 📖 API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

py main.py