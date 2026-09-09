import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        # Initialize Google Gemini API
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)

            # Based on your API test, these models work with standard API keys
            # Gemini 3.6 requires OAuth, so we'll use models that support API keys
            self.model = None
            models_to_try = [
                'models/gemini-3.1-flash-tts-preview',
                'models/gemini-robotics-er-2-preview',
                'models/gemini-2.5-computer-use-preview-10-2025',
                'models/antigravity-preview-05-2026',
                'models/deep-research-max-preview-04-2026',
                'models/deep-research-preview-04-2026',
                'models/deep-research-pro-preview-12-2025',
            ]

            for model_name in models_to_try:
                try:
                    self.model = genai.GenerativeModel(model_name)
                    # Test if it actually works
                    test_response = self.model.generate_content("Hello")
                    print(f"✓ Successfully loaded and tested: {model_name}")
                    break
                except Exception as e:
                    print(f"✗ {model_name}: {str(e)[:80]}")
                    continue

            if not self.model:
                print("ERROR: Could not load any compatible Gemini model.")
                print("Your API key works but may not have access to content generation models.")
        else:
            self.model = None
            print("Warning: GEMINI_API_KEY not set. AI features will be limited.")

    def generate_explanation(self, competency_name, user_level='beginner', user_background=''):
        """Generate personalized explanation for a competency"""
        if not self.model:
            return "AI service not configured. Please set GEMINI_API_KEY."

        prompt = f"""
You are an expert educator explaining technical concepts in a personalized way.
Adapt your explanation based on the learner's background and level.
Use analogies, examples, and clear language.

Explain {competency_name} to someone with the following background:
- Experience level: {user_level}
- Related knowledge: {user_background if user_background else 'General audience'}

Provide:
1. A clear, concise definition (2-3 sentences)
2. Why it's important and where it's used
3. Key concepts broken down simply
4. A relatable analogy
5. Recommended first steps to learn it

Keep it under 300 words, engaging and encouraging.
"""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating explanation: {str(e)}"

    def generate_summary(self, content, title='Resource'):
        """Generate summary of learning resource content"""
        if not self.model:
            return "AI service not configured. Please set GEMINI_API_KEY."

        prompt = f"""
Summarize the following learning resource titled "{title}".

Content:
{content[:3000]}  # Limit content length

Provide:
1. Main topics covered (3-5 bullet points)
2. Key takeaways (2-3 sentences)
3. Who should use this resource
4. Estimated time to complete

Keep the summary concise and actionable (under 200 words).
"""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating summary: {str(e)}"

    def generate_quiz(self, competency_name, difficulty='intermediate', num_questions=3):
        """Generate practice questions for a competency"""
        if not self.model:
            return [{"error": "AI service not configured"}]

        prompt = f"""
Generate {num_questions} multiple choice questions to assess knowledge of {competency_name}.
Difficulty level: {difficulty}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no extra text.

Format (escape all quotes properly):
[
  {{
    "question": "What is {competency_name}?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Brief explanation"
  }}
]

Make questions practical and test real understanding.
"""

        try:
            response = self.model.generate_content(prompt)
            import json
            import re

            text = response.text.strip()

            # Remove markdown code blocks
            text = re.sub(r'```json\s*', '', text)
            text = re.sub(r'```\s*', '', text)
            text = text.strip()

            # Try to find JSON array in the response
            json_match = re.search(r'\[.*\]', text, re.DOTALL)
            if json_match:
                text = json_match.group(0)

            # Parse JSON
            questions = json.loads(text)

            # Validate structure
            if not isinstance(questions, list):
                raise ValueError("Response is not a list")

            for q in questions:
                if not all(k in q for k in ['question', 'options', 'correct_answer', 'explanation']):
                    raise ValueError("Invalid question structure")

            return questions

        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {e}")
            print(f"Response text: {response.text[:200]}")
            return [{
                "question": f"JSON parsing failed. Please try again.",
                "options": ["A", "B", "C", "D"],
                "correct_answer": 0,
                "explanation": "The AI response could not be parsed."
            }]
        except Exception as e:
            print(f"Quiz generation error: {e}")
            return [{
                "question": f"Error: {str(e)}",
                "options": ["Error", "Error", "Error", "Error"],
                "correct_answer": 0,
                "explanation": "Failed to generate questions"
            }]

    def generate_recommendations(self, user_competencies, target_competencies):
        """Generate personalized learning recommendations"""
        if not self.model:
            return "AI service not configured. Please set GEMINI_API_KEY."

        prompt = f"""
Based on a learner's current and target competencies, provide personalized recommendations.

Current competencies: {', '.join(user_competencies) if user_competencies else 'None'}
Target competencies: {', '.join(target_competencies) if target_competencies else 'Not specified'}

Provide:
1. Recommended next steps (3-5 specific actions)
2. Skills to prioritize (ordered by importance)
3. Potential challenges to watch out for
4. Estimated timeline to reach goals
5. Motivational advice

Keep it actionable and encouraging (under 250 words).
"""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating recommendations: {str(e)}"
