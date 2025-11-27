@echo off
echo 🚀 Starting AI Trading Backend (Direct Method)...

REM Install dependencies directly
echo 📦 Installing dependencies...
py -m pip install fastapi uvicorn yfinance pandas numpy requests python-multipart python-jose[cryptography] passlib[bcrypt] google-auth google-auth-oauthlib google-auth-httplib2

REM Change to backend directory
cd backend

echo 🔥 Starting FastAPI server...
echo 📡 Server: http://localhost:8000
echo 📖 Docs: http://localhost:8000/docs
echo.

py main.py