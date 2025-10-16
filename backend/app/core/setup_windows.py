"""
Windows-specific setup script for VVP Core Components

This script handles Windows-specific compilation and setup requirements.
"""

from setuptools import setup, Extension
from Cython.Build import cythonize
import numpy as np
import platform
import sys

def get_windows_compile_args():
    """Get Windows-specific compilation arguments"""
    if platform.system() == 'Windows':
        return [
            "/O2",  # Maximum optimization
            "/favor:INTEL64",  # Optimize for Intel 64-bit
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

def get_windows_link_args():
    """Get Windows-specific linking arguments"""
    if platform.system() == 'Windows':
        return ["/O2"]
    else:
        return ["-O3"]

# Define extensions
extensions = [
    Extension(
        "fast_orderbook",
        ["fast_orderbook.pyx"],
        include_dirs=[np.get_include()],
        extra_compile_args=get_windows_compile_args(),
        extra_link_args=get_windows_link_args(),
        language="c"
    )
]

setup(
    name="VVP Fast OrderBook (Windows)",
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