@echo off
echo Starting Learning Journey Designer Development Server...
echo.

cd /d "%~dp0frontend"

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Installing/updating dependencies...
call npm install

echo.
echo Starting Vite development server on http://localhost:5173
echo.
echo ========================================
echo  Your app will open in a few seconds
echo  Press Ctrl+C to stop the server
echo ========================================
echo.

start http://localhost:5173

call npm run dev

pause
