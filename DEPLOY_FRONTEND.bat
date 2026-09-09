@echo off
REM ========================================
REM Complete Deployment Script
REM ========================================

echo ========================================
echo Learning Journey Designer - Deployment
echo ========================================
echo.

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Firebase CLI not found!
    echo Please install: npm install -g firebase-tools
    pause
    exit /b 1
)

echo Step 1: Login to Firebase
echo ========================================
firebase login
if %errorlevel% neq 0 (
    echo [ERROR] Firebase login failed
    pause
    exit /b 1
)
echo [SUCCESS] Logged in to Firebase
echo.

echo Step 2: Deploy Firestore Security Rules
echo ========================================
firebase deploy --only firestore:rules,firestore:indexes
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy Firestore rules
    pause
    exit /b 1
)
echo [SUCCESS] Firestore rules deployed
echo.

echo Step 3: Deploy Storage Security Rules
echo ========================================
firebase deploy --only storage:rules
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy Storage rules
    pause
    exit /b 1
)
echo [SUCCESS] Storage rules deployed
echo.

echo Step 4: Build Frontend Production Bundle
echo ========================================
cd frontend
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Building production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed
    cd ..
    pause
    exit /b 1
)
echo [SUCCESS] Frontend built successfully
cd ..
echo.

echo Step 5: Deploy to Firebase Hosting
echo ========================================
firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy to Firebase Hosting
    pause
    exit /b 1
)
echo [SUCCESS] Frontend deployed to Firebase Hosting
echo.

echo ========================================
echo DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Your application is now live at:
echo https://learning-journey-designe-5335a.firebaseapp.com
echo.
echo NEXT STEPS:
echo 1. Deploy backend to Render.com or Railway.app
echo 2. Update frontend/.env.production with backend URL
echo 3. Rebuild and redeploy frontend: npm run build ^&^& firebase deploy --only hosting
echo 4. Test all features in production
echo.
echo See DEPLOYMENT_GUIDE.md for detailed instructions
echo ========================================

pause
