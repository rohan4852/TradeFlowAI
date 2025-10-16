# Quick Installation Guide

## Current Issue: Missing setuptools

You're getting the error because `setuptools` is not installed. Here's how to fix it:

## Step 1: Install Dependencies

Run this command first to install all required dependencies:

```cmd
python install_dependencies.py
```

If that doesn't work, install manually:

```cmd
python -m pip install --upgrade pip
python -m pip install setuptools wheel numpy cython psutil
```

## Step 2: Compile Cython Extensions

After dependencies are installed:

```cmd
python setup.py build_ext --inplace
```

## Step 3: Test Installation

```cmd
python test_core.py
```

## Alternative: Use the Batch Installer

If you prefer, run the automated installer:

```cmd
install_windows.bat
```

## Troubleshooting

### If pip is not recognized:
```cmd
python -m pip install --upgrade pip
```

### If you get permission errors:
- Run Command Prompt as Administrator
- Or use: `python -m pip install --user setuptools wheel numpy cython psutil`

### If Visual C++ errors occur:
1. Install Visual Studio Community with C++ tools
2. Or install "Microsoft C++ Build Tools"
3. Restart command prompt after installation

## Quick Test

After installation, test that everything works:

```cmd
python -c "import numpy; print('NumPy OK')"
python -c "import cython; print('Cython OK')"  
python -c "import setuptools; print('Setuptools OK')"
```

## Next Steps

Once dependencies are installed successfully:

1. Compile: `python setup.py build_ext --inplace`
2. Test: `python test_core.py`
3. Use: `from backend.app.core import LockFreeSPSCQueue`