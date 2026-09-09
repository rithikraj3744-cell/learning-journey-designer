"""
Simple Gemini API Test - Run this to see what's wrong
"""
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

print("="*60)
print("GEMINI API DIAGNOSTIC TEST")
print("="*60)
print()

api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("❌ ERROR: No API key found in .env file")
    print("\nMake sure backend/.env has:")
    print("GEMINI_API_KEY=your_key_here")
    input("\nPress Enter to exit...")
    exit(1)

print(f"API Key: {api_key[:20]}...{api_key[-10:]}")
print()

try:
    genai.configure(api_key=api_key)
    print("✓ API configured successfully")
    print()

    # Try to list models
    print("Attempting to list available models...")
    print("-"*60)

    try:
        models = list(genai.list_models())

        if not models:
            print("⚠️  No models returned (API key may be invalid)")
        else:
            print(f"Found {len(models)} total models")
            print()

            generate_content_models = []
            for m in models:
                if 'generateContent' in m.supported_generation_methods:
                    generate_content_models.append(m.name)
                    print(f"✓ {m.name}")
                    print(f"   Methods: {', '.join(m.supported_generation_methods)}")

            print()
            print("="*60)

            if generate_content_models:
                print(f"\n✓ Found {len(generate_content_models)} usable models")

                # Try to use the first one
                test_model_name = generate_content_models[0]
                print(f"\nTesting: {test_model_name}")

                try:
                    model = genai.GenerativeModel(test_model_name)
                    response = model.generate_content("Say hello")
                    print(f"✓ SUCCESS! Response: {response.text[:50]}")

                    print()
                    print("="*60)
                    print("YOUR API KEY IS WORKING!")
                    print(f"Use this model in your code: {test_model_name}")
                    print("="*60)

                except Exception as e:
                    print(f"✗ Test failed: {e}")
            else:
                print("\n✗ No models support generateContent")

    except Exception as e:
        print(f"✗ Could not list models: {e}")
        print()
        print("Trying direct model access...")

        # Try common model names directly
        test_names = [
            'gemini-pro',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'models/gemini-pro',
            'models/gemini-1.5-flash',
        ]

        for name in test_names:
            try:
                print(f"\nTrying: {name}")
                model = genai.GenerativeModel(name)
                response = model.generate_content("Hello")
                print(f"  ✓ WORKS! Response: {response.text[:30]}")
                print()
                print("="*60)
                print(f"SUCCESS! Use this model: {name}")
                print("="*60)
                break
            except Exception as e:
                print(f"  ✗ Failed: {str(e)[:80]}")

except Exception as e:
    print(f"❌ FATAL ERROR: {e}")
    print()
    print("Your API key is likely invalid or expired.")
    print()
    print("To fix:")
    print("1. Go to: https://aistudio.google.com/app/apikey")
    print("2. Delete the old key and create a NEW one")
    print("3. Update backend/.env with the new key")
    print("4. Run this test again")

print()
input("\nPress Enter to exit...")
