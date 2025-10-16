# 📁 Project Structure

## 🧹 Cleaned Up Structure

```
TradeFlowAI/
├── 📁 .kiro/                    # Kiro IDE configuration
│   ├── specs/                   # Feature specifications
│   └── steering/                # AI steering rules
├── 📁 backend/                  # FastAPI backend
│   ├── app/                     # Main application
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   ├── database/            # Database models
│   │   └── main.py              # FastAPI app
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile               # Backend container
├── 📁 frontend/                 # React frontend
│   └── vite-project/            # Vite React app
│       ├── src/                 # Source code
│       │   ├── components/      # React components
│       │   ├── services/        # API services
│       │   └── design-system/   # Superior UI components
│       ├── package.json         # Node dependencies
│       └── vite.config.js       # Vite configuration
├── 📄 .env                      # Environment variables (your API keys)
├── 📄 .env.example              # Environment template
├── 📄 .gitignore                # Git ignore rules
├── 📄 docker-compose.yml        # Multi-service deployment
├── 📄 README.md                 # Project documentation
├── 📄 start.bat                 # Windows startup script
└── 📄 start.sh                  # Linux/Mac startup script
```

## 🗑️ Removed Directories

- ❌ `training/` - Not needed (using Gemini API)
- ❌ `data/` - Not needed (using direct API calls)
- ❌ `scripts/` - Replaced with simple start scripts
- ❌ `.vscode/` - Personal IDE settings
- ❌ `.venv/` - Virtual environment (recreatable)

## 🎯 Essential Files Only

The project now contains only the essential files needed for:
- ✅ Backend API (FastAPI)
- ✅ Frontend UI (React + Superior Design System)
- ✅ Configuration (.env, docker-compose)
- ✅ Documentation (README, this file)
- ✅ Easy startup (start.bat/start.sh)

## 🚀 Quick Start

1. **Configure API keys**: Edit `.env` file
2. **Start services**: Run `start.bat` (Windows) or `./start.sh` (Linux/Mac)
3. **Access app**: http://localhost:5173

That's it! Clean, simple, and focused on what matters.