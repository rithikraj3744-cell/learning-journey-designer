#!/usr/bin/env python3
"""
Simple Backend Test Script
Tests if backend is running and AI is working
"""

import requests
import json
import sys

def print_section(title):
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)

def test_backend_health():
    """Test if backend is running"""
    print_section("TEST 1: Backend Health Check")

    try:
        response = requests.get("http://localhost:5000/health", timeout=5)

        if response.status_code == 200:
            data = response.json()
            print("✅ Backend is RUNNING")
            print(f"   Status: {data.get('status')}")
            print(f"   Firebase: {data.get('firebase')}")
            print(f"   AI Service: {data.get('ai_service')}")

            if data.get('ai_service') == 'configured':
                print("\n✅ AI Service is CONFIGURED correctly")
                return True
            else:
                print("\n❌ AI Service is NOT configured")
                print("   → Check if GEMINI_API_KEY is in backend/.env")
                return False
        else:
            print(f"❌ Backend returned HTTP {response.status_code}")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend")
        print("   → Make sure backend is running: START_BACKEND.bat")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_ai_quiz():
    """Test AI quiz generation"""
    print_section("TEST 2: AI Quiz Generation")

    try:
        payload = {
            "competency_name": "SQL & Databases",
            "difficulty": "intermediate",
            "num_questions": 1
        }

        print(f"Requesting 1 question about: SQL & Databases")
        print("Please wait 5-10 seconds...")

        response = requests.post(
            "http://localhost:5000/api/ai/quiz",
            json=payload,
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            questions = data.get('questions', [])

            if questions and len(questions) > 0:
                q = questions[0]
                question_text = q.get('question', '')

                # Check if it's a mock question
                if "Sample question" in question_text or "sample question" in question_text.lower():
                    print("❌ AI is returning MOCK questions")
                    print(f"   Question: {question_text}")
                    print("\n   Reasons:")
                    print("   1. GEMINI_API_KEY might be missing or invalid")
                    print("   2. No internet connection")
                    print("   3. Gemini API rate limit exceeded")
                    return False
                else:
                    print("✅ AI is generating REAL questions!")
                    print(f"\n   Question: {question_text[:100]}...")
                    print(f"   Options: {len(q.get('options', []))} provided")
                    print(f"   Has explanation: {'Yes' if q.get('explanation') else 'No'}")
                    return True
            else:
                print("❌ No questions returned")
                return False
        else:
            print(f"❌ HTTP {response.status_code}")
            try:
                error = response.json()
                print(f"   Error: {error.get('error', 'Unknown error')}")
            except:
                print(f"   Response: {response.text[:200]}")
            return False

    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("\n" + "█" * 60)
    print("   BACKEND TEST - Gemini AI Integration Check")
    print("█" * 60)

    # Test 1: Backend Health
    backend_ok = test_backend_health()

    if not backend_ok:
        print_section("RESULT: BACKEND NOT READY")
        print("\n❌ Backend is not running or not configured properly")
        print("\nNext steps:")
        print("1. Make sure backend is running: START_BACKEND.bat")
        print("2. Check backend/.env has: GEMINI_API_KEY=your_key")
        print("3. Get free API key: https://aistudio.google.com/app/apikey")
        return 1

    # Test 2: AI Generation
    ai_ok = test_ai_quiz()

    print_section("FINAL RESULT")

    if backend_ok and ai_ok:
        print("\n✅ ✅ ✅  ALL TESTS PASSED  ✅ ✅ ✅")
        print("\nYour Gemini AI integration is working correctly!")
        print("You can now use the assessment feature in the app.")
        print("\nNext step: Open http://localhost:5173/assessment")
        return 0
    else:
        print("\n❌ TESTS FAILED")
        print("\nWhat to check:")

        if not ai_ok:
            print("\n1. Verify your .env file:")
            print("   cd backend")
            print("   type .env")
            print("   Should show: GEMINI_API_KEY=AIza...")

            print("\n2. Get a valid API key:")
            print("   https://aistudio.google.com/app/apikey")

            print("\n3. Restart backend after fixing .env:")
            print("   Press Ctrl+C in backend window")
            print("   Run START_BACKEND.bat again")

            print("\n4. Check internet connection (Gemini API needs it)")

        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
