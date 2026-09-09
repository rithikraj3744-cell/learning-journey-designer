from flask import Blueprint, request, jsonify
from app.services.ai_service import AIService
import os

bp = Blueprint('ai', __name__, url_prefix='/api/ai')
ai_service = AIService()

@bp.route('/explain', methods=['POST'])
def explain_concept():
    """Generate personalized explanation for a competency"""
    try:
        data = request.json
        competency_name = data.get('competency_name')
        user_level = data.get('user_level', 'beginner')
        user_background = data.get('user_background', '')

        if not competency_name:
            return jsonify({"error": "competency_name is required"}), 400

        explanation = ai_service.generate_explanation(
            competency_name, user_level, user_background
        )

        return jsonify({
            "explanation": explanation,
            "competency": competency_name,
            "level": user_level
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/summarize', methods=['POST'])
def summarize_resource():
    """Generate summary of a learning resource"""
    try:
        data = request.json
        content = data.get('content')
        resource_title = data.get('title', 'Resource')

        if not content:
            return jsonify({"error": "content is required"}), 400

        summary = ai_service.generate_summary(content, resource_title)

        return jsonify({
            "summary": summary,
            "title": resource_title
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/quiz', methods=['POST'])
def generate_quiz():
    """Generate practice questions for a competency"""
    try:
        data = request.json
        competency_name = data.get('competency_name')
        difficulty = data.get('difficulty', 'intermediate')
        num_questions = data.get('num_questions', 3)

        if not competency_name:
            return jsonify({"error": "competency_name is required"}), 400

        questions = ai_service.generate_quiz(
            competency_name, difficulty, num_questions
        )

        return jsonify({
            "questions": questions,
            "competency": competency_name,
            "difficulty": difficulty
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/recommendations', methods=['POST'])
def get_recommendations():
    """Get personalized learning recommendations"""
    try:
        data = request.json
        user_competencies = data.get('user_competencies', [])
        target_competencies = data.get('target_competencies', [])

        recommendations = ai_service.generate_recommendations(
            user_competencies, target_competencies
        )

        return jsonify({
            "recommendations": recommendations
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
