@echo off
echo ========================================
echo  Backend Server Test
echo ========================================
echo.

echo Testing connection to http://localhost:5000/health
echo.

curl -s http://localhost:5000/health 2>nul
if errorlevel 1 (
    echo.
    echo ❌ Backend server is NOT running!
    echo.
    echo To fix this:
    echo 1. Go to the backend folder
    echo 2. Double-click START_BACKEND.bat
    echo 3. Wait for the server to start
    echo 4. Run this test again
) else (
    echo.
    echo ✅ Backend server is running!
    echo Your AI features should work now.
)

echo.
pause
