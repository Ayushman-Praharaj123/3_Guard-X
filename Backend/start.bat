@echo off
echo ======================================================================
echo Guard-X AI Drone Surveillance System - Quick Start
echo ======================================================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt --quiet
echo.

REM Create models directory if it doesn't exist
if not exist "models\" (
    echo Creating models directory...
    mkdir models
    echo.
)

REM Start server
echo ======================================================================
echo Starting Guard-X Backend Server...
echo ======================================================================
echo.
python server.py

pause

