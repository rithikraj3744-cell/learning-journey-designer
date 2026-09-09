@echo off
REM ========================================
REM Quick Build Script - Frontend Only
REM ========================================

echo Building frontend for production...
echo.

cd frontend

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        cd ..
        pause
        exit /b 1
    )
)

REM Build production bundle
echo.
echo Creating production build...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    cd ..
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Frontend built successfully!
echo Output directory: frontend/dist/
echo.
echo To deploy: firebase deploy --only hosting
echo To test locally: npm run preview

cd ..
pause
