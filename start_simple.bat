@echo off
echo 🚀 Starting AI Trading Backend (Simple Mode)...

REM Install basic dependencies
py -m pip install fastapi uvicorn --quiet

echo 🔥 Starting simplified backend...
cd backend
py simple_main.py