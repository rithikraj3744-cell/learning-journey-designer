@echo off
echo ================================================
echo   CLEANUP PROJECT FOR DEPLOYMENT
echo ================================================
echo.
echo This will remove ALL temporary and test files
echo to prepare your project for deployment.
echo.
echo Press Ctrl+C to cancel, or
pause

cd /d "%~dp0"

echo.
echo ================================================
echo   PHASE 1: Removing Test Scripts
echo ================================================
echo.

del /F /Q "add_slides_4_6.py" 2>nul && echo ✓ Removed add_slides_4_6.py
del /F /Q "check_backend_status.py" 2>nul && echo ✓ Removed check_backend_status.py
del /F /Q "CHECK_FIRESTORE.py" 2>nul && echo ✓ Removed CHECK_FIRESTORE.py
del /F /Q "create_presentation.py" 2>nul && echo ✓ Removed create_presentation.py
del /F /Q "create_presentation_final.py" 2>nul && echo ✓ Removed create_presentation_final.py
del /F /Q "create_presentation_part2.py" 2>nul && echo ✓ Removed create_presentation_part2.py
del /F /Q "fix_presentation.py" 2>nul && echo ✓ Removed fix_presentation.py
del /F /Q "import_competencies.py" 2>nul && echo ✓ Removed import_competencies.py
del /F /Q "import_resources.py" 2>nul && echo ✓ Removed import_resources.py

echo.
echo ================================================
echo   PHASE 2: Removing Batch Files (Keep Essential)
echo ================================================
echo.

del /F /Q "CHECK_FIRESTORE.bat" 2>nul && echo ✓ Removed CHECK_FIRESTORE.bat
del /F /Q "IMPORT_COMPETENCIES.bat" 2>nul && echo ✓ Removed IMPORT_COMPETENCIES.bat
del /F /Q "IMPORT_RESOURCES.bat" 2>nul && echo ✓ Removed IMPORT_RESOURCES.bat
del /F /Q "INSTALL_AND_RUN.bat" 2>nul && echo ✓ Removed INSTALL_AND_RUN.bat
del /F /Q "RUN_TEST.bat" 2>nul && echo ✓ Removed RUN_TEST.bat
del /F /Q "START_BACKEND.bat" 2>nul && echo ✓ Removed START_BACKEND.bat
del /F /Q "CLEANUP_PROJECT.bat" 2>nul && echo ✓ Removed CLEANUP_PROJECT.bat

echo.
echo ================================================
echo   PHASE 3: Removing Config Files
echo ================================================
echo.

del /F /Q "firebase.json" 2>nul && echo ✓ Removed firebase.json
del /F /Q "firestore.indexes.json" 2>nul && echo ✓ Removed firestore.indexes.json
del /F /Q "firestore.rules" 2>nul && echo ✓ Removed firestore.rules

echo.
echo ================================================
echo   PHASE 4: Removing PowerPoint Files
echo ================================================
echo.

del /F /Q "*.pptx" 2>nul && echo ✓ Removed PowerPoint files

echo.
echo ================================================
echo   PHASE 5: Removing MD Documentation Files
echo ================================================
echo.

del /F /Q "AI_AGENT_FIXES_APPLIED.md" 2>nul && echo ✓ Removed AI_AGENT_FIXES_APPLIED.md
del /F /Q "AI_AGENT_FIX_COMPLETE.md" 2>nul && echo ✓ Removed AI_AGENT_FIX_COMPLETE.md
del /F /Q "AI_FEATURES_COMPLETE.md" 2>nul && echo ✓ Removed AI_FEATURES_COMPLETE.md
del /F /Q "AI_FEATURES_SUMMARY.md" 2>nul && echo ✓ Removed AI_FEATURES_SUMMARY.md
del /F /Q "AI_INTEGRATION_COMPLETE.md" 2>nul && echo ✓ Removed AI_INTEGRATION_COMPLETE.md
del /F /Q "BACKEND_STEP_BY_STEP.md" 2>nul && echo ✓ Removed BACKEND_STEP_BY_STEP.md
del /F /Q "CLEANUP_GUIDE.md" 2>nul && echo ✓ Removed CLEANUP_GUIDE.md
del /F /Q "FRONTEND_BLANK_PAGE_FIX.md" 2>nul && echo ✓ Removed FRONTEND_BLANK_PAGE_FIX.md
del /F /Q "FRONTEND_DEBUG_GUIDE.md" 2>nul && echo ✓ Removed FRONTEND_DEBUG_GUIDE.md
del /F /Q "HOW_TO_USE_ASSESSMENT.md" 2>nul && echo ✓ Removed HOW_TO_USE_ASSESSMENT.md
del /F /Q "HOW_TO_USE_QUICK_SUMMARY.md" 2>nul && echo ✓ Removed HOW_TO_USE_QUICK_SUMMARY.md
del /F /Q "KNOWLEDGE_GRAPH_DOCS.md" 2>nul && echo ✓ Removed KNOWLEDGE_GRAPH_DOCS.md
del /F /Q "MISSING_RESOURCES_AND_FIXES.md" 2>nul && echo ✓ Removed MISSING_RESOURCES_AND_FIXES.md
del /F /Q "MVP_FINAL_FEATURES_COMPLETE.md" 2>nul && echo ✓ Removed MVP_FINAL_FEATURES_COMPLETE.md
del /F /Q "PROJECT_SUMMARY.md" 2>nul && echo ✓ Removed PROJECT_SUMMARY.md
del /F /Q "QUICK_START.md" 2>nul && echo ✓ Removed QUICK_START.md
del /F /Q "REMOVE_RESOURCE_LIBRARY.md" 2>nul && echo ✓ Removed REMOVE_RESOURCE_LIBRARY.md
del /F /Q "RESOURCES_VIEW_TROUBLESHOOTING.md" 2>nul && echo ✓ Removed RESOURCES_VIEW_TROUBLESHOOTING.md
del /F /Q "RESOURCE_DEBUG_STEPS.md" 2>nul && echo ✓ Removed RESOURCE_DEBUG_STEPS.md
del /F /Q "SETUP_GEMINI_FROM_SCRATCH.md" 2>nul && echo ✓ Removed SETUP_GEMINI_FROM_SCRATCH.md
del /F /Q "TROUBLESHOOTING_STEPS.md" 2>nul && echo ✓ Removed TROUBLESHOOTING_STEPS.md
del /F /Q "UI_UX_IMPROVEMENTS_SUMMARY.md" 2>nul && echo ✓ Removed UI_UX_IMPROVEMENTS_SUMMARY.md

echo.
echo ================================================
echo   PHASE 6: Removing Temporary Files
echo ================================================
echo.

del /F /Q "*.log" 2>nul && echo ✓ Removed log files
del /F /Q "*.tmp" 2>nul && echo ✓ Removed temp files
del /F /Q "*.bak" 2>nul && echo ✓ Removed backup files
del /F /Q ".DS_Store" 2>nul && echo ✓ Removed .DS_Store

echo.
echo ================================================
echo   PHASE 7: Cleaning Backend Directory
echo ================================================
echo.

cd backend 2>nul
if exist "*.pyc" del /F /Q "*.pyc" && echo ✓ Removed Python cache files
if exist "__pycache__" rd /S /Q "__pycache__" 2>nul && echo ✓ Removed __pycache__ directory
if exist "*.log" del /F /Q "*.log" && echo ✓ Removed backend log files
cd ..

echo.
echo ================================================
echo   PHASE 8: Cleaning Frontend Directory
echo ================================================
echo.

cd frontend 2>nul
if exist "dist" (
    echo Found dist folder - keeping it for deployment
) else (
    echo No dist folder found - you'll need to run "npm run build" before deployment
)
cd ..

echo.
echo ================================================
echo   ✅ CLEANUP COMPLETE!
echo ================================================
echo.
echo Files KEPT for deployment:
echo   ✓ README.md
echo   ✓ START_DEV_SERVER.bat
echo   ✓ docs/ folder
echo   ✓ frontend/ folder (all source code)
echo   ✓ backend/ folder (all source code)
echo   ✓ .gitignore
echo   ✓ All package.json files
echo   ✓ All configuration files
echo.
echo Files REMOVED:
echo   ✗ All test scripts (.py files)
echo   ✗ Temporary batch files
echo   ✗ Temporary documentation
echo   ✗ Firebase config files (root level)
echo   ✗ PowerPoint files
echo   ✗ Log and temp files
echo.
echo ================================================
echo   NEXT STEPS FOR DEPLOYMENT:
echo ================================================
echo.
echo 1. Build the frontend:
echo    cd frontend
echo    npm run build
echo.
echo 2. Configure environment variables:
echo    - Create .env file in backend/
echo    - Add Firebase credentials
echo    - Add Gemini API key
echo.
echo 3. Deploy:
echo    - Frontend: Upload 'frontend/dist' to hosting
echo    - Backend: Deploy Flask app to server
echo.
echo Your project is now clean and ready for deployment!
echo.
pause
