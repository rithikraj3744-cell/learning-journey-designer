@echo off
echo ============================================
echo FRONTEND STARTER
echo ============================================
echo.

cd /d "%~dp0frontend"

echo Starting Frontend Development Server...
echo.
echo Frontend will run on http://localhost:5173
echo Keep this window open while using the app
echo Press Ctrl+C to stop
echo.
pause

npm run dev
