"""
Standalone Flask API for AI Services
Works without Firebase and without app/ directory dependencies
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize Gemini AI
gemini_model = None
try:
    api_key = os.environ.get('GEMINI_API_KEY')
    if api_key:
        genai.configure(api_key=api_key)
        gemini_model = genai.GenerativeModel('gemini-3.6-flash')
        print("✓ Gemini AI initialized")
    else:
        print("✗ GEMINI_API_KEY not found")
except Exception as e:
    print(f"✗ Gemini init failed: {e}")

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'message': 'Learning Journey AI Backend',
        'status': 'running',
        'endpoints': [
            '/api/health',
            '/api/ai/quiz',
            '/api/ai/explain',
            '/api/ai/summarize'
        ]
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'AI Backend is running',
        'ai_available': gemini_model is not None
    })

@app.route('/api/ai/quiz', methods=['POST'])
def generate_quiz():
    """Generate quiz questions"""
    if not gemini_model:
        return jsonify({'error': 'AI service not available'}), 503

    try:
        data = request.get_json()
        competency_name = data.get('competency_name', '')
        num_questions = data.get('num_questions', 5)
        difficulty = data.get('difficulty', 'intermediate')

        if not competency_name:
            return jsonify({'error': 'competency_name is required'}), 400

        # Generate quiz prompt
        prompt = f"""Generate {num_questions} multiple-choice quiz questions about {competency_name}.
Difficulty level: {difficulty}

For each question, provide:
1. The question text
2. Four answer options
3. The correct answer index (0-3)
4. A brief explanation

Format the response as a JSON array of objects with this structure:
[{{
    "question": "question text",
    "options": ["option1", "option2", "option3", "option4"],
    "correct_answer": 0,
    "explanation": "why this is correct"
}}]

IMPORTANT:
- correct_answer must be a number from 0 to 3 (not a letter)
- options should be plain text without "A)", "B)", etc. prefixes

Return ONLY the JSON array, no additional text."""

        response = gemini_model.generate_content(prompt)
        result_text = response.text.strip()

        # Try to extract JSON from response
        import json
        import re

        # Remove markdown code blocks if present
        result_text = re.sub(r'```json\s*|\s*```', '', result_text)

        questions = json.loads(result_text)

        # Validate and fix correct_answer format
        for question in questions:
            # If correct_answer is a letter, convert to index
            if isinstance(question.get('correct_answer'), str):
                letter = question['correct_answer'].upper().strip()
                if letter in ['A', 'B', 'C', 'D']:
                    question['correct_answer'] = ord(letter) - ord('A')
                else:
                    question['correct_answer'] = 0  # Default to first option

            # Ensure correct_answer is an integer
            question['correct_answer'] = int(question['correct_answer'])

            # Remove A), B), C), D) prefixes from options if present
            question['options'] = [
                re.sub(r'^[A-D]\)\s*', '', opt) for opt in question['options']
            ]

        return jsonify({
            'questions': questions,
            'cached': False
        })

    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/explain', methods=['POST'])
def explain_concept():
    """Explain a concept"""
    if not gemini_model:
        return jsonify({'error': 'AI service not available'}), 503

    try:
        data = request.get_json()
        competency_name = data.get('competency_name', '')
        user_level = data.get('user_level', 'beginner')
        user_background = data.get('user_background', '')

        if not competency_name:
            return jsonify({'error': 'competency_name is required'}), 400

        # Generate explanation prompt
        prompt = f"""Explain the concept of "{competency_name}" for a {user_level} level learner.
{f'Background: {user_background}' if user_background else ''}

Provide a clear, concise explanation that:
1. Defines the concept simply
2. Explains why it's important
3. Gives practical examples
4. Suggests how to learn more

Keep the explanation under 300 words."""

        response = gemini_model.generate_content(prompt)
        explanation = response.text.strip()

        return jsonify({
            'explanation': explanation,
            'cached': False
        })

    except Exception as e:
        print(f"Error explaining concept: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/summarize', methods=['POST'])
def summarize_resource():
    """Summarize a resource"""
    if not gemini_model:
        return jsonify({'error': 'AI service not available'}), 503

    try:
        data = request.get_json()
        content = data.get('content', '')
        title = data.get('title', 'Resource')

        if not content:
            return jsonify({'error': 'content is required'}), 400

        # Generate summary prompt
        prompt = f"""Summarize this learning resource titled "{title}":

{content}

Provide a concise summary that:
1. Captures the main points
2. Highlights key takeaways
3. Notes the difficulty level

Keep the summary under 150 words."""

        response = gemini_model.generate_content(prompt)
        summary = response.text.strip()

        return jsonify({
            'summary': summary,
            'cached': False
        })

    except Exception as e:
        print(f"Error summarizing resource: {e}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting server on port {port}")
    print(f"AI Service available: {gemini_model is not None}")
    app.run(host='0.0.0.0', port=port, debug=False)
