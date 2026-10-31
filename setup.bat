@echo off
REM ============================================================
REM  RetroRevive - One-time Setup (Windows)
REM  Checks Python 3.14, creates a virtual environment, and
REM  installs pygame-ce. Skips work already done.
REM ============================================================
setlocal

echo [RetroRevive Setup]
echo.

REM --- 1. Locate Python 3.14 ---
set "PY=python"
python --version >nul 2>&1
if %errorlevel% neq 0 goto :nopython
for /f "tokens=2" %%v in ('python --version 2^>^&1') do set "PYVER=%%v"
echo Found Python %PYVER%
echo %PYVER% | findstr /b "3.14." >nul
if %errorlevel% equ 0 goto :have314
echo.
echo [WARN] Python 3.14.x not found as default 'python' (found %PYVER%).
echo        Trying py launcher for 3.14...
py -3.14 --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PY=py -3.14"
    echo [OK] Using py -3.14
    goto :have314
)
echo [WARN] Python 3.14 not found; proceeding with %PYVER% anyway.
echo        The engines require Python 3.10+; pygame-ce wheels exist for 3.10-3.15.
:have314
echo.

REM --- 2. Create virtual environment if missing ---
if exist ".venv\Scripts\python.exe" (
    echo [OK] Virtual environment already exists (.venv).
) else (
    echo Creating virtual environment .venv ...
    %PY% -m venv .venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        goto :fail
    )
    echo [OK] Virtual environment created.
)
set "VPY=.venv\Scripts\python.exe"

REM --- 3. Install dependencies (skips if already satisfied) ---
echo Installing dependencies from requirements-ui.txt ...
%VPY% -m pip install -r requirements-ui.txt --upgrade-strategy only-if-needed
if %errorlevel% neq 0 (
    echo [ERROR] Dependency installation failed.
    echo         If pygame was previously installed in this venv, delete .venv
    echo         and run this script again (pygame and pygame-ce conflict).
    goto :fail
)

REM --- 4. Verify pygame-ce (not legacy pygame) ---
echo Verifying pygame-ce installation ...
%VPY% -c "import pygame; print('pygame', pygame.version.ver, 'IS_CE=', getattr(pygame, 'IS_CE', 0))"
if %errorlevel% neq 0 goto :fail
%VPY% -c "import sys; sys.exit(0 if getattr(__import__('pygame'), 'IS_CE', 0) == 1 else 1)"
if %errorlevel% neq 0 (
    echo [ERROR] Legacy pygame is installed instead of pygame-ce.
    echo         Fix: delete .venv and run this script again.
    goto :fail
)
echo [OK] pygame-ce verified.

echo.
echo ============================
echo  Setup complete!
echo  Double-click RUN_RETROREVIVE.bat to play.
echo ============================
pause
exit /b 0

:nopython
echo [ERROR] Python was not found on PATH.
echo         Install Python 3.14 from python.org and re-run this script.
goto :fail

:fail
echo.
echo Setup FAILED. See messages above.
pause
exit /b 1
