#!/bin/bash

echo "🚀 Starting AI Trading Platform..."

# Check if we're in the right directory
if [ ! -f "backend/app/main.py" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "🔥 Starting backend server..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 5

echo "📦 Installing frontend dependencies..."
cd ../frontend/vite-project
npm install

echo "🎨 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

cd ../..

echo ""
echo "🎉 AI Trading Platform is running!"
echo "================================"
echo ""
echo "📊 Services:"
echo "  Backend API:     http://localhost:8000"
echo "  API Docs:        http://localhost:8000/docs"
echo "  Frontend:        http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for services
wait