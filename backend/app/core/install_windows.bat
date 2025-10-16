@echo off
REM Windows installation script for VVP Core Components

echo Installing VVP Core Components on Windows...

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo Python found, checking version...
python -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)"
if errorlevel 1 (
    echo Error: Python 3.8+ is required
    pause
    exit /b 1
)

echo Installing dependencies...
python install_dependencies.py

if errorlevel 1 (
    echo Error: Dependency installation failed
    echo Trying manual installation...
    pip install --upgrade pip setuptools wheel
    pip install numpy cython psutil
)

echo Compiling Cython extensions...
python setup.py build_ext --inplace

if errorlevel 1 (
    echo Error: Compilation failed
    echo Trying alternative setup...
    python setup_windows.py build_ext --inplace
)

echo Running tests...
python test_core.py

if errorlevel 1 (
    echo Warning: Some tests failed, but installation may still work
) else (
    echo All tests passed!
)

echo.
echo VVP Core Components installation complete!
echo You can now import the components in Python:
echo   from backend.app.core import FastOrderBook, LockFreeSPSCQueue
echo.
pause