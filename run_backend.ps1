#!/usr/bin/env pwsh
Write-Host "🚀 Starting AI Trading Backend..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "backend/main.py")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
py -m pip install fastapi uvicorn yfinance pandas numpy requests python-multipart python-jose[cryptography] passlib[bcrypt] google-auth google-auth-oauthlib google-auth-httplib2

# Change to backend directory
Set-Location backend

Write-Host "🔥 Starting FastAPI server..." -ForegroundColor Green
Write-Host "📡 Server: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📖 Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

# Start the server
py main.py