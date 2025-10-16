#!/usr/bin/env python3
"""
Bootstrap installer for VVP Core Components

This script can be run on a fresh Python installation to set up everything needed.
It only uses standard library modules to avoid dependency issues.
"""

import subprocess
import sys
import os
import platform

def print_header():
    """Print installation header"""
    print("=" * 60)
    print("VVP Core Components - Bootstrap Installer")
    print("=" * 60)
    print(f"Platform: {platform.system()} {platform.release()}")
    print(f"Python: {sys.version}")
    print("=" * 60)

def run_command(cmd, description):
    """Run a command and return success status"""
    print(f"\n🔄 {description}...")
    print(f"Running: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(f"Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        print(f"Error: {e.stderr.strip()}")
        return False
    except FileNotFoundError:
        print(f"❌ Command not found: {cmd[0]}")
        return False

def check_python():
    """Check Python version"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 3.8+ required, found {version.major}.{version.minor}")
        return False
    
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_pip_packages():
    """Install packages step by step"""
    packages = [
        ("pip", "Latest pip"),
        ("setuptools>=60.0.0", "Build tools - setuptools"),
        ("wheel>=0.37.0", "Build tools - wheel"), 
        ("numpy>=1.21.0", "NumPy"),
        ("cython>=0.29.0", "Cython"),
        ("psutil>=5.8.0", "Process utilities")
    ]
    
    # Add uvloop for non-Windows
    if platform.system() != 'Windows':
        packages.append(("uvloop>=0.17.0", "uvloop (performance boost)"))
    
    for package, description in packages:
        if package == "pip":
            cmd = [sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip']
        else:
            cmd = [sys.executable, '-m', 'pip', 'install', package]
        
        if not run_command(cmd, f"Installing {description}"):
            if package in ["setuptools>=60.0.0", "wheel>=0.37.0", "numpy>=1.21.0", "cython>=0.29.0"]:
                print(f"❌ Critical package {package} failed to install")
                return False
            else:
                print(f"⚠️ Optional package {package} failed to install, continuing...")
    
    return True

def verify_installation():
    """Verify critical packages are available"""
    critical_imports = [
        ("numpy", "NumPy"),
        ("cython", "Cython"),
        ("setuptools", "Setuptools")
    ]
    
    print("\n🔍 Verifying installation...")
    
    for module, name in critical_imports:
        try:
            __import__(module)
            print(f"✅ {name} is available")
        except ImportError:
            print(f"❌ {name} is not available")
            return False
    
    return True

def compile_extensions():
    """Compile Cython extensions"""
    print("\n🔨 Compiling Cython extensions...")
    
    # Check if setup.py exists in current directory
    if os.path.exists("setup.py"):
        cmd = [sys.executable, "setup.py", "build_ext", "--inplace"]
        return run_command(cmd, "Compiling Cython extensions")
    
    # Check if we need to change to core directory
    core_paths = [
        "backend/app/core/setup.py",
        "../setup.py",
        "./setup.py"
    ]
    
    for path in core_paths:
        if os.path.exists(path):
            setup_dir = os.path.dirname(path)
            if setup_dir:
                print(f"Changing to directory: {setup_dir}")
                original_dir = os.getcwd()
                os.chdir(setup_dir)
                
                cmd = [sys.executable, "setup.py", "build_ext", "--inplace"]
                result = run_command(cmd, "Compiling Cython extensions")
                
                os.chdir(original_dir)
                return result
            else:
                cmd = [sys.executable, path, "build_ext", "--inplace"]
                return run_command(cmd, "Compiling Cython extensions")
    
    print("⚠️ setup.py not found, skipping Cython compilation")
    return True

def run_tests():
    """Run basic tests"""
    print("\n🧪 Running tests...")
    
    if not os.path.exists("test_core.py"):
        print("⚠️ test_core.py not found, skipping tests")
        return True
    
    cmd = [sys.executable, "test_core.py"]
    return run_command(cmd, "Running tests")

def main():
    """Main bootstrap process"""
    print_header()
    
    # Step 1: Check Python
    if not check_python():
        return False
    
    # Step 2: Install packages
    if not install_pip_packages():
        print("\n❌ Package installation failed")
        return False
    
    # Step 3: Verify installation
    if not verify_installation():
        print("\n❌ Installation verification failed")
        return False
    
    # Step 4: Compile extensions
    if not compile_extensions():
        print("\n⚠️ Cython compilation failed, but core components may still work")
    
    # Step 5: Run tests
    if not run_tests():
        print("\n⚠️ Some tests failed, but installation may still be usable")
    
    print("\n" + "=" * 60)
    print("🎉 Bootstrap installation completed!")
    print("=" * 60)
    print("\nYou can now use the VVP Core Components:")
    print("  from backend.app.core import LockFreeSPSCQueue")
    print("  from backend.app.core import AdvancedMemoryManager")
    print("  from backend.app.core import FastOrderBook  # If compilation succeeded")
    print("\nFor more information, see README.md")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Installation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)