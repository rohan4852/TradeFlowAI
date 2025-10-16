#!/usr/bin/env python3
"""
Dependency installer for VVP Core Components

This script installs all required dependencies step by step,
handling Windows-specific issues and providing clear feedback.
"""

import subprocess
import sys
import platform
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_pip_install(packages, description="packages"):
    """Install packages using pip with error handling"""
    logger.info(f"Installing {description}...")
    
    for package in packages:
        try:
            logger.info(f"Installing {package}...")
            result = subprocess.run([
                sys.executable, '-m', 'pip', 'install', package
            ], capture_output=True, text=True, check=True)
            
            logger.info(f"✓ {package} installed successfully")
            
        except subprocess.CalledProcessError as e:
            logger.error(f"✗ Failed to install {package}")
            logger.error(f"Error: {e.stderr}")
            return False
    
    return True

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        logger.error(f"Python 3.8+ required, found {version.major}.{version.minor}")
        return False
    
    logger.info(f"✓ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def upgrade_pip():
    """Upgrade pip to latest version"""
    logger.info("Upgrading pip...")
    try:
        subprocess.run([
            sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip'
        ], check=True, capture_output=True)
        logger.info("✓ pip upgraded successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.warning(f"Failed to upgrade pip: {e}")
        return False

def install_build_tools():
    """Install essential build tools"""
    build_tools = [
        'setuptools>=60.0.0',
        'wheel>=0.37.0',
        'pip>=21.0.0'
    ]
    
    return run_pip_install(build_tools, "build tools")

def install_core_dependencies():
    """Install core dependencies"""
    core_deps = [
        'numpy>=1.21.0',
        'cython>=0.29.0',
        'psutil>=5.8.0'
    ]
    
    return run_pip_install(core_deps, "core dependencies")

def install_optional_dependencies():
    """Install optional dependencies based on platform"""
    optional_deps = []
    
    # Add uvloop for non-Windows systems
    if platform.system() != 'Windows':
        optional_deps.append('uvloop>=0.17.0')
        logger.info("Adding uvloop for enhanced performance")
    else:
        logger.info("Skipping uvloop on Windows (not supported)")
    
    if optional_deps:
        return run_pip_install(optional_deps, "optional dependencies")
    
    return True

def install_development_tools():
    """Install development and testing tools"""
    dev_tools = [
        'pytest>=6.0.0',
        'pytest-benchmark>=3.4.0'
    ]
    
    # Try to install memory-profiler, but don't fail if it doesn't work
    try:
        subprocess.run([
            sys.executable, '-m', 'pip', 'install', 'memory-profiler>=0.60.0'
        ], check=True, capture_output=True)
        logger.info("✓ memory-profiler installed")
    except subprocess.CalledProcessError:
        logger.warning("⚠ memory-profiler installation failed (optional)")
    
    return run_pip_install(dev_tools, "development tools")

def verify_installation():
    """Verify that all critical packages are installed"""
    critical_packages = [
        'numpy',
        'cython', 
        'setuptools',
        'wheel'
    ]
    
    logger.info("Verifying installation...")
    
    for package in critical_packages:
        try:
            __import__(package)
            logger.info(f"✓ {package} is available")
        except ImportError:
            logger.error(f"✗ {package} is not available")
            return False
    
    # Check optional packages
    optional_packages = ['psutil', 'pytest']
    for package in optional_packages:
        try:
            __import__(package)
            logger.info(f"✓ {package} is available")
        except ImportError:
            logger.warning(f"⚠ {package} is not available (optional)")
    
    return True

def main():
    """Main installation process"""
    logger.info("Starting VVP Core Dependencies installation...")
    logger.info(f"Platform: {platform.system()} {platform.release()}")
    logger.info(f"Python: {sys.version}")
    
    # Step 1: Check Python version
    if not check_python_version():
        logger.error("Python version check failed")
        return False
    
    # Step 2: Upgrade pip
    upgrade_pip()
    
    # Step 3: Install build tools first
    if not install_build_tools():
        logger.error("Failed to install build tools")
        return False
    
    # Step 4: Install core dependencies
    if not install_core_dependencies():
        logger.error("Failed to install core dependencies")
        return False
    
    # Step 5: Install optional dependencies
    if not install_optional_dependencies():
        logger.warning("Some optional dependencies failed to install")
    
    # Step 6: Install development tools
    if not install_development_tools():
        logger.warning("Some development tools failed to install")
    
    # Step 7: Verify installation
    if not verify_installation():
        logger.error("Installation verification failed")
        return False
    
    logger.info("🎉 All dependencies installed successfully!")
    logger.info("You can now run: python setup.py build_ext --inplace")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        logger.error("❌ Installation failed. Please check the errors above.")
        sys.exit(1)
    else:
        logger.info("✅ Installation completed successfully!")
        sys.exit(0)