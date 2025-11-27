#!/usr/bin/env python3
"""
Start the backend with proper error handling and logging
"""
import os
import sys
import logging
import subprocess
from pathlib import Path

def check_virtual_environment():
    """Check if we're running in the correct virtual environment"""
    project_root = Path(__file__).parent
    venv_path = project_root / ".venv"
    
    if sys.platform == "win32":
        venv_python = venv_path / "Scripts" / "python.exe"
    else:
        venv_python = venv_path / "bin" / "python"
    
    # If virtual environment exists but we're not using it, restart with correct Python
    if venv_python.exists() and sys.executable != str(venv_python):
        print(f"🔄 Restarting with virtual environment Python: {venv_python}")
        subprocess.run([str(venv_python), __file__] + sys.argv[1:])
        sys.exit(0)
    
    # If no virtual environment, warn but continue
    if not venv_python.exists():
        print("⚠️  No virtual environment found at .venv")
        print("   Consider creating one: python -m venv .venv")
        print("   Then install dependencies: pip install -r backend/requirements.txt")

def main():
    # Check and handle virtual environment
    check_virtual_environment()
    
    # Add backend to path
    backend_path = Path(__file__).parent / "backend"
    sys.path.insert(0, str(backend_path))

    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Suppress noisy loggers
    logging.getLogger('yfinance').setLevel(logging.ERROR)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('asyncio').setLevel(logging.WARNING)

    os.chdir("backend")
    
    # Import and run
    try:
        import uvicorn
        
        print("🚀 Starting AI Trading Backend...")
        print("📊 Live data fetching: ENABLED")
        print("🔐 Authentication: ENABLED")
        print("🌐 CORS: ENABLED for frontend")
        print("📡 Server: http://localhost:8000")
        print("📖 Docs: http://localhost:8000/docs")
        
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=False  # Reduce log noise
        )
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Try installing dependencies: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()