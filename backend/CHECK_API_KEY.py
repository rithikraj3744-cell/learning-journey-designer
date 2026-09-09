"""
Quick script to test your Gemini API key and see available models
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')

print("="*50)
print("GEMINI API KEY CHECKER")
print("="*50)
print()

if not api_key:
    print("❌ ERROR: No API key found in .env file")
    print()
    print("To fix:")
    print("1. Get a free API key from: https://makersuite.google.com/app/apikey")
    print("2. Add it to backend/.env file:")
    print("   GEMINI_API_KEY=your_actual_key_here")
    exit(1)

print(f"✓ API key found: {api_key[:20]}...")
print()

try:
    genai.configure(api_key=api_key)
    print("✓ API key configured successfully")
    print()
    print("Attempting to list available models...")
    print()

    # Try to list available models
    try:
        models = genai.list_models()
        print("Available models:")
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                print(f"  ✓ {model.name}")
    except Exception as e:
        print(f"Could not list models: {e}")
        print()

    # Try each common model name
    print()
    print("Testing individual models:")
    print("-" * 50)

    test_models = [
        'models/gemini-pro',
        'models/gemini-1.5-flash',
        'models/gemini-1.5-pro',
        'gemini-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
    ]

    for model_name in test_models:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Say 'Hello'")
            print(f"✓ {model_name} - WORKS!")
        except Exception as e:
            print(f"✗ {model_name} - FAILED: {str(e)[:60]}")

    print()
    print("="*50)

except Exception as e:
    print(f"❌ ERROR: API key is invalid or expired")
    print(f"   Error: {e}")
    print()
    print("To fix:")
    print("1. Go to: https://makersuite.google.com/app/apikey")
    print("2. Create a NEW API key")
    print("3. Update backend/.env file with the new key")
    print()

print()
print("Done!")
input("Press Enter to exit...")
