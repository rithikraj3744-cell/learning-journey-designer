@echo off
echo ============================================
echo TESTING BACKEND CONNECTION
echo ============================================
echo.

echo Testing if backend is running...
curl http://localhost:5000/health
if errorlevel 1 (
    echo.
    echo ERROR: Backend is not responding
    echo Make sure backend is running with START_BACKEND.bat
) else (
    echo.
    echo ============================================
    echo Backend is responding!
    echo ============================================
)

echo.
echo.
echo Testing AI Quiz Generation...
echo.

curl -X POST http://localhost:5000/api/ai/quiz ^
  -H "Content-Type: application/json" ^
  -d "{\"competency_name\":\"SQL & Databases\",\"difficulty\":\"intermediate\",\"num_questions\":1}"

echo.
echo.
echo ============================================
echo If you see real question text above,
echo AI integration is working!
echo.
echo If you see "Sample question", check:
echo 1. Is GEMINI_API_KEY set in backend\.env?
echo 2. Is the API key valid?
echo 3. Do you have internet connection?
echo ============================================
pause
