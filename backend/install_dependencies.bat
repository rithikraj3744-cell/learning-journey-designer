@echo off
echo ========================================
echo Installing Backend Dependencies
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing required packages...
echo.

pip install flask==3.0.3
pip install flask-cors==4.0.1
pip install google-generativeai==0.7.2
pip install huggingface-hub==0.24.5
pip install python-dotenv==1.0.1
pip install requests==2.32.3
pip install firebase-admin==6.5.0

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure you have a GEMINI_API_KEY in backend/.env
echo 2. Run: python app.py
echo.
pause
