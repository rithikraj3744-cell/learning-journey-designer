from flask import Blueprint, request, jsonify
from app.services.path_service import PathService

bp = Blueprint('path', __name__, url_prefix='/api/path')
path_service = PathService()

@bp.route('/generate', methods=['POST'])
def generate_path():
    """Generate personalized learning path"""
    try:
        data = request.json
        user_id = data.get('user_id')
        current_competencies = data.get('current_competencies', {})
        target_competencies = data.get('target_competencies', [])
        available_time = data.get('available_time', 10)  # hours per week
        preferences = data.get('preferences', {})

        if not user_id or not target_competencies:
            return jsonify({"error": "user_id and target_competencies are required"}), 400

        path = path_service.generate_learning_path(
            user_id,
            current_competencies,
            target_competencies,
            available_time,
            preferences
        )

        return jsonify(path), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<path_id>', methods=['GET'])
def get_path(path_id):
    """Get learning path by ID"""
    try:
        path = path_service.get_path(path_id)
        if not path:
            return jsonify({"error": "Path not found"}), 404
        return jsonify(path), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<path_id>/progress', methods=['PUT'])
def update_progress(path_id):
    """Update progress on a learning path"""
    try:
        data = request.json
        step_id = data.get('step_id')
        completed = data.get('completed', False)

        result = path_service.update_progress(path_id, step_id, completed)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
