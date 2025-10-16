#!/usr/bin/env python3
"""
Install VVP Core Components from any directory

This script can be run from anywhere and will find and set up the core components.
"""

import os
import sys
import subprocess
from pathlib import Path

def find_core_directory():
    """Find the core directory from current location"""
    current = Path.cwd()
    
    # Common paths to check
    possible_paths = [
        current / "backend" / "app" / "core",
        current / "app" / "core", 
        current / "core",
        current,
        current.parent / "backend" / "app" / "core",
        current.parent / "app" / "core",
        current.parent / "core"
    ]
    
    for path in possible_paths:
        if (path / "setup.py").exists() and (path / "lockfree_structures.py").exists():
            return path
    
    return None

def main():
    """Main installation function"""
    print("🔍 Looking for VVP Core Components...")
    
    core_dir = find_core_directory()
    if not core_dir:
        print("❌ Could not find VVP Core directory")
        print("Please run this script from the project root or core directory")
        return False
    
    print(f"✅ Found core directory: {core_dir}")
    
    # Change to core directory
    original_dir = os.getcwd()
    os.chdir(core_dir)
    
    try:
        print("🚀 Starting installation...")
        
        # Run bootstrap script
        if (core_dir / "bootstrap.py").exists():
            result = subprocess.run([sys.executable, "bootstrap.py"], check=True)
            print("✅ Installation completed successfully!")
            return True
        else:
            print("❌ bootstrap.py not found in core directory")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Installation failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        os.chdir(original_dir)

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🎉 VVP Core Components are ready to use!")
        print("Try: from backend.app.core import LockFreeSPSCQueue")
    else:
        print("\n❌ Installation failed. Please check the errors above.")
    
    sys.exit(0 if success else 1)