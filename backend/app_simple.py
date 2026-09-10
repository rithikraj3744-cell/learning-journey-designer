"""
Simplified Flask API for AI Services
Works without Firebase - only provides AI features
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Import AI service
try:
    from app.services.ai_service import AIService
    ai_service = AIService()
    print("✓ AI Service initialized")
except Exception as e:
    print(f"✗ AI Service init failed: {e}")
    ai_service = None

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'AI Backend is running',
        'ai_available': ai_service is not None
    })

@app.route('/api/ai/quiz', methods=['POST'])
def generate_quiz():
    """Generate quiz questions"""
    if not ai_service:
        return jsonify({'error': 'AI service not available'}), 503

    try:
        data = request.get_json()

        competency_name = data.get('competency_name', '')
        num_questions = data.get('num_questions', 5)
        difficulty = data.get('difficulty', 'intermediate')
        context = data.get('context', '')

        if not competency_name:
            return jsonify({'error': 'competency_name is required'}), 400

        # Generate quiz using AI
        result = ai_service.generate_quiz(
            competency=competency_name,
            num_questions=num_questions,
            difficulty=difficulty,
            context=context
        )

        return jsonify({
            'questions': result['questions'],
            'cached': result.get('cached', False)
        })

    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/explain', methods=['POST'])
def explain_concept():
    """Explain a concept"""
    if not ai_service:
        return jsonify({'error': 'AI service not available'}), 503

    try:
        data = request.get_json()

        competency_name = data.get('competency_name', '')
        user_level = data.get('user_level', 'beginner')
        user_background = data.get('user_background', '')

        if not competency_name:
            return jsonify({'error': 'competency_name is required'}), 400

        # Explain concept using AI
        result = ai_service.explain_concept(
            concept=competency_name,
            user_level=user_level,
            context=user_background
        )

        return jsonify({
            'explanation': result['explanation'],
            'cached': result.get('cached', False)
        })

    except Exception as e:
        print(f"Error explaining concept: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/summarize', methods=['POST'])
def summarize_resource():
    """Summarize a resource"""
    if not ai_service:
        return jsonify({'error': 'AI service not available'}), 503

    try:
        data = request.get_json()

        content = data.get('content', '')
        title = data.get('title', 'Resource')

        if not content:
            return jsonify({'error': 'content is required'}), 400

        # Summarize using AI
        result = ai_service.summarize_content(
            content=content,
            title=title
        )

        return jsonify({
            'summary': result['summary'],
            'cached': result.get('cached', False)
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
    app.run(host='0.0.0.0', port=port, debug=False)
