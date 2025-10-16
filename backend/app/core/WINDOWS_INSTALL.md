# Windows Installation Guide for VVP Core Components

This guide provides step-by-step instructions for installing the VVP Core Components on Windows systems.

## Prerequisites

### 1. Python 3.8+
Download and install Python from [python.org](https://python.org):
- Make sure to check "Add Python to PATH" during installation
- Verify installation: `python --version`

### 2. Microsoft Visual C++ Build Tools
For Cython compilation, you need Visual C++ build tools:

**Option A: Visual Studio Community (Recommended)**
- Download from [Visual Studio Community](https://visualstudio.microsoft.com/vs/community/)
- During installation, select "Desktop development with C++"

**Option B: Build Tools Only**
- Download "Microsoft C++ Build Tools" from Microsoft
- Install with C++ build tools workload

### 3. Git (Optional)
- Download from [git-scm.com](https://git-scm.com/download/win)

## Installation Steps

### Method 1: Automated Installation (Recommended)

1. **Open Command Prompt as Administrator**
   - Press `Win + X` and select "Command Prompt (Admin)" or "PowerShell (Admin)"

2. **Navigate to the core directory**
   ```cmd
   cd path\to\ai-trading-llm\backend\app\core
   ```

3. **Run the automated installer**
   ```cmd
   install_windows.bat
   ```

### Method 2: Manual Installation

1. **Install Python dependencies**
   ```cmd
   pip install numpy cython psutil setuptools wheel
   ```

2. **Compile Cython extensions**
   ```cmd
   python setup.py build_ext --inplace
   ```

3. **Run tests**
   ```cmd
   python test_core.py
   ```

## Troubleshooting

### Common Issues

#### 1. "Microsoft Visual C++ 14.0 is required"
**Solution:** Install Visual Studio Build Tools (see Prerequisites)

#### 2. "uvloop does not support Windows"
**Solution:** This is expected. The system automatically falls back to standard asyncio on Windows.

#### 3. "error: Microsoft Visual C++ 14.0 is required"
**Solutions:**
- Install Visual Studio Community with C++ tools
- Or install "Microsoft C++ Build Tools"
- Restart command prompt after installation

#### 4. "Failed to build wheel for numpy"
**Solutions:**
- Update pip: `python -m pip install --upgrade pip`
- Install pre-compiled numpy: `pip install --only-binary=all numpy`

#### 5. Cython compilation fails
**Solutions:**
- Try the Windows-specific setup: `python setup_windows.py build_ext --inplace`
- Check that Visual C++ build tools are installed
- Try installing with conda: `conda install cython numpy`

#### 6. "Permission denied" errors
**Solutions:**
- Run Command Prompt as Administrator
- Check antivirus software isn't blocking compilation
- Temporarily disable Windows Defender real-time protection during installation

### Performance Notes for Windows

1. **Windows Defender**: May slow down compilation and execution
   - Add project folder to Windows Defender exclusions
   - Go to: Settings > Update & Security > Windows Security > Virus & threat protection > Exclusions

2. **Power Settings**: Set to "High Performance" for best results
   - Go to: Control Panel > Power Options > High Performance

3. **Process Priority**: Run Python with high priority for trading applications
   ```cmd
   start /high python your_trading_script.py
   ```

## Verification

After installation, verify everything works:

```cmd
python -c "from backend.app.core import LockFreeSPSCQueue; print('Lock-free structures: OK')"
python -c "from backend.app.core import AdvancedMemoryManager; print('Memory manager: OK')"
python -c "from backend.app.core import FastOrderBook; print('Fast order book: OK')"
```

If any imports fail, check the error messages and refer to the troubleshooting section.

## Performance Testing

Run the performance tests to ensure everything is working optimally:

```cmd
python test_core.py
```

Expected results:
- Lock-free queue: > 100K operations/second
- Object pool: > 50K operations/second  
- Order book: > 10K orders/second (if compiled successfully)

## Windows-Specific Limitations

1. **No uvloop**: Windows uses standard asyncio (still very fast)
2. **Shared Memory**: Falls back to memory-mapped files (transparent to user)
3. **Process Priority**: May need manual adjustment for optimal performance

## Getting Help

If you encounter issues:

1. Check the error message carefully
2. Ensure all prerequisites are installed
3. Try the alternative setup methods
4. Check Windows Event Viewer for system-level errors
5. Run with verbose output: `python setup.py build_ext --inplace --verbose`

## Next Steps

Once installed successfully:

1. Read the main [README.md](README.md) for usage examples
2. Run the performance benchmarks
3. Integrate with your trading applications
4. Consider running on Linux for maximum performance in production