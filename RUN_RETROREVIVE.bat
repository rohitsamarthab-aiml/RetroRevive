@echo off
REM ============================================================
REM  RetroRevive - Launch (Windows)
REM  Activates the virtual environment and starts the game.
REM  Run setup.bat first if you have not yet.
REM ============================================================
setlocal

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found.
    echo         Run setup.bat first, then try again.
    pause
    exit /b 1
)

echo [RetroRevive] Starting the game library...
.venv\Scripts\python.exe main.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] The game exited with an error (code %errorlevel%).
    echo         Common fixes:
    echo           1. Run setup.bat to (re)install dependencies.
    echo           2. If pygame/pygame-ce conflict is suspected:
    echo              delete the .venv folder and run setup.bat again.
    echo.
    pause
)
exit /b %errorlevel%
