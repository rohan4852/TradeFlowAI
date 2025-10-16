"""
Cross-platform setup script for compiling Cython extensions for ultra-fast order book

Run with: python setup.py build_ext --inplace
Make sure to run this from the backend/app/core directory!
"""

import os
import sys
import platform
from pathlib import Path

# Ensure we're in the right directory
script_dir = Path(__file__).parent
os.chdir(script_dir)

# Check if required files exist
if not Path("fast_orderbook.pyx").exists():
    print("Error: fast_orderbook.pyx not found!")
    print(f"Current directory: {os.getcwd()}")
    print("Please run this script from the backend/app/core directory")
    sys.exit(1)

try:
    from setuptools import setup, Extension
    from Cython.Build import cythonize
    import numpy as np
    CYTHON_AVAILABLE = True
except ImportError as e:
    print(f"Warning: {e}")
    print("Cython compilation not available. Installing Python-only version.")
    CYTHON_AVAILABLE = False

def get_compile_args():
    """Get platform-specific compilation arguments"""
    if platform.system() == 'Windows':
        return [
            "/O2",  # Maximum optimization
            "/DNPY_NO_DEPRECATED_API=NPY_1_7_API_VERSION"
        ]
    else:
        return [
            "-O3",  # Maximum optimization
            "-march=native",  # Optimize for current CPU
            "-ffast-math",  # Fast math operations
            "-funroll-loops",  # Loop unrolling
            "-DNPY_NO_DEPRECATED_API=NPY_1_7_API_VERSION"
        ]

def get_link_args():
    """Get platform-specific linking arguments"""
    if platform.system() == 'Windows':
        return ["/O2"]
    else:
        return ["-O3"]

def setup_with_cython():
    """Setup with Cython compilation"""
    print("Setting up with Cython compilation...")
    
    # Define extensions
    extensions = [
        Extension(
            "fast_orderbook",
            ["fast_orderbook.pyx"],
            include_dirs=[np.get_include()],
            extra_compile_args=get_compile_args(),
            extra_link_args=get_link_args(),
            language="c"
        )
    ]

    setup(
        name="VVP Fast OrderBook",
        ext_modules=cythonize(
            extensions,
            compiler_directives={
                "language_level": 3,
                "boundscheck": False,
                "wraparound": False,
                "cdivision": True,
                "profile": False,
                "linetrace": False
            }
        ),
        zip_safe=False,
        include_dirs=[np.get_include()]
    )

def setup_python_only():
    """Setup without Cython (Python-only version)"""
    print("Setting up Python-only version (no Cython compilation)...")
    
    setup(
        name="VVP Core Components",
        packages=[],
        py_modules=[
            'lockfree_structures',
            'memory_manager'
        ],
        zip_safe=False
    )

def main():
    """Main setup function"""
    print(f"Platform: {platform.system()}")
    print(f"Python: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    
    if CYTHON_AVAILABLE:
        try:
            setup_with_cython()
            print("✅ Cython compilation completed successfully!")
        except Exception as e:
            print(f"❌ Cython compilation failed: {e}")
            print("Falling back to Python-only setup...")
            setup_python_only()
    else:
        setup_python_only()
    
    print("\n🎉 Setup completed!")
    print("You can now import the core components:")
    print("  from backend.app.core import LockFreeSPSCQueue, AdvancedMemoryManager")
    
    if CYTHON_AVAILABLE:
        print("  from backend.app.core import FastOrderBook  # If compilation succeeded")

if __name__ == "__main__":
    main()