"""
Test script to verify Gemini API key is working
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

def test_gemini_api():
    """Test if the Gemini API key works"""

    api_key = os.getenv('GEMINI_API_KEY')

    print("=" * 60)
    print("GEMINI API TEST")
    print("=" * 60)

    if not api_key:
        print("❌ ERROR: GEMINI_API_KEY not found in .env file")
        return False

    print(f"✓ API Key found: {api_key[:10]}...{api_key[-5:]}")
    print(f"✓ API Key length: {len(api_key)} characters")
    print()

    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        print("✓ API key configured successfully")

        # Try different model names
        model_names = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro',
            'gemini-flash'
        ]

        model = None
        for model_name in model_names:
            try:
                print(f"  Trying model: {model_name}...")
                model = genai.GenerativeModel(model_name)
                print(f"  ✓ Model '{model_name}' initialized successfully")
                break
            except Exception as e:
                print(f"  ✗ Model '{model_name}' failed: {str(e)[:50]}")

        if not model:
            print("❌ ERROR: Could not initialize any Gemini model")
            return False

        print()
        print("Testing quiz generation...")
        print("-" * 60)

        # Test quiz generation
        prompt = """
Generate 2 multiple choice questions to assess knowledge of Python basics.
Difficulty level: beginner

Return ONLY valid JSON in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Explanation here"
  }
]
"""

        response = model.generate_content(prompt)
        print("✓ API call successful!")
        print()
        print("Response preview:")
        print(response.text[:200] + "..." if len(response.text) > 200 else response.text)
        print()
        print("=" * 60)
        print("✅ SUCCESS! Your Gemini API key is working correctly!")
        print("=" * 60)
        return True

    except Exception as e:
        print()
        print("=" * 60)
        print(f"❌ ERROR: {str(e)}")
        print("=" * 60)
        print()
        print("Common issues:")
        print("1. Invalid API key - verify it's copied correctly from Google AI Studio")
        print("2. API key not activated - check Google AI Studio dashboard")
        print("3. Billing not enabled - some API keys require billing setup")
        print("4. Region restrictions - Gemini might not be available in your region")
        print()
        print("Get your API key from: https://makersuite.google.com/app/apikey")
        return False

if __name__ == '__main__':
    test_gemini_api()
