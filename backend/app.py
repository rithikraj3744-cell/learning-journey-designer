"""
Flask API for Learning Journey Designer
Includes: Learning Path Generation + AI Services (Gemini)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os
import uuid
from path_generator import LearningPathGenerator

# Import AI service
from app.services.ai_service import AIService

# Import graph routes
from graph_routes import graph_bp, init_graph_routes

# Import analytics routes
from analytics_routes import analytics_bp, init_analytics_routes

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize AI Service
ai_service = AIService()

# Initialize Firebase
try:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✓ Firebase initialized")
except Exception as e:
    print(f"✗ Firebase init failed: {e}")
    db = None

# Register blueprints
if db:
    # Graph routes
    init_graph_routes(db)
    app.register_blueprint(graph_bp)

    # Analytics routes
    init_analytics_routes(db)
    app.register_blueprint(analytics_bp)
    print("✓ Analytics routes registered")

def load_competencies_from_firestore():
    """Load all competencies from Firestore"""
    if not db:
        return {}

    try:
        competencies_ref = db.collection('competencies')
        docs = competencies_ref.stream()

        competencies = {}
        for doc in docs:
            competencies[doc.id] = doc.to_dict()

        return competencies
    except Exception as e:
        print(f"Error loading competencies: {e}")
        return {}

def load_resources_from_firestore():
    """Load all resources from Firestore"""
    if not db:
        return {}

    try:
        resources_ref = db.collection('resources')
        docs = resources_ref.stream()

        resources = {}
        for doc in docs:
            resources[doc.id] = doc.to_dict()

        return resources
    except Exception as e:
        print(f"Error loading resources: {e}")
        return {}

def load_user_competencies(user_id):
    """Load user's current competency scores"""
    if not db:
        return {}

    try:
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            return user_data.get('competencies', {})

        return {}
    except Exception as e:
        print(f"Error loading user competencies: {e}")
        return {}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'firebase': 'connected' if db else 'disconnected',
        'ai_service': 'configured' if ai_service.model else 'not configured'
    }), 200

# ============================================================================
# AI SERVICE ENDPOINTS
# ============================================================================

@app.route('/api/ai/explain', methods=['POST'])
def ai_explain_concept():
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
        print(f"Error in ai_explain: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/summarize', methods=['POST'])
def ai_summarize_resource():
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
        print(f"Error in ai_summarize: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/quiz', methods=['POST'])
def ai_generate_quiz():
    """Generate practice questions for a competency"""
    try:
        data = request.json
        competency_name = data.get('competency_name')
        difficulty = data.get('difficulty', 'intermediate')
        num_questions = data.get('num_questions', 5)

        if not competency_name:
            return jsonify({"error": "competency_name is required"}), 400

        print(f"Generating quiz: {competency_name}, difficulty: {difficulty}, questions: {num_questions}")

        questions = ai_service.generate_quiz(
            competency_name, difficulty, num_questions
        )

        return jsonify({
            "questions": questions,
            "competency": competency_name,
            "difficulty": difficulty
        }), 200

    except Exception as e:
        print(f"Error in ai_quiz: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/recommendations', methods=['POST'])
def ai_get_recommendations():
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
        print(f"Error in ai_recommendations: {e}")
        return jsonify({"error": str(e)}), 500

# ============================================================================
# LEARNING PATH ENDPOINTS
# ============================================================================

@app.route('/api/competencies', methods=['GET'])
def get_competencies():
    """Get all available competencies"""
    try:
        competencies = load_competencies_from_firestore()
        return jsonify({'success': True, 'competencies': competencies}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/generate-path', methods=['POST'])
def generate_learning_path():
    """Generate personalized learning path"""
    try:
        data = request.get_json()

        # Extract parameters
        user_id = data.get('userId', 'demo-user')
        target_competencies = data.get('targetCompetencies', [])
        time_available = data.get('timeAvailable', 10)
        preferences = data.get('preferences', {})

        # Validate input
        if not target_competencies:
            return jsonify({
                'success': False,
                'error': 'Target competencies are required'
            }), 400

        # Load data
        competencies = load_competencies_from_firestore()
        resources = load_resources_from_firestore()
        current_competencies = load_user_competencies(user_id)

        # Initialize generator
        generator = LearningPathGenerator(competencies, resources)

        # Generate path
        result = generator.generate_path(
            user_id=user_id,
            current_competencies=current_competencies,
            target_competencies=target_competencies,
            time_available=time_available,
            preferences=preferences
        )

        if not result.get('success'):
            return jsonify(result), 200

        # Save to Firestore
        path_id = str(uuid.uuid4())
        path_data = result['path']
        path_data['id'] = path_id

        if db:
            db.collection('learningPaths').document(path_id).set(path_data)

        return jsonify({
            'success': True,
            'pathId': path_id,
            'path': path_data
        }), 201

    except Exception as e:
        print(f"Error generating path: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/paths/<user_id>', methods=['GET'])
def get_user_paths(user_id):
    """Get all learning paths for a user"""
    try:
        if not db:
            return jsonify({'success': False, 'error': 'Database not connected'}), 500

        paths_ref = db.collection('learningPaths').where('userId', '==', user_id)
        docs = paths_ref.stream()

        paths = []
        for doc in docs:
            path_data = doc.to_dict()
            path_data['id'] = doc.id
            paths.append(path_data)

        # Sort by creation date (most recent first)
        paths.sort(key=lambda x: x.get('createdAt', ''), reverse=True)

        return jsonify({'success': True, 'paths': paths}), 200

    except Exception as e:
        print(f"Error fetching user paths: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/path/<path_id>', methods=['GET'])
def get_path(path_id):
    """Get a specific learning path"""
    try:
        if not db:
            return jsonify({'success': False, 'error': 'Database not connected'}), 500

        path_ref = db.collection('learningPaths').document(path_id)
        path_doc = path_ref.get()

        if not path_doc.exists:
            return jsonify({'success': False, 'error': 'Path not found'}), 404

        path_data = path_doc.to_dict()
        path_data['id'] = path_doc.id

        return jsonify({'success': True, 'path': path_data}), 200

    except Exception as e:
        print(f"Error fetching path: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/paths/<path_id>/progress', methods=['PUT'])
def update_path_progress(path_id):
    """Update progress for a learning path step"""
    try:
        if not db:
            return jsonify({'success': False, 'error': 'Database not connected'}), 500

        data = request.get_json()
        step_number = data.get('stepNumber')
        status = data.get('status')
        progress = data.get('progress', 0)

        # Get current path
        path_ref = db.collection('learningPaths').document(path_id)
        path_doc = path_ref.get()

        if not path_doc.exists:
            return jsonify({'success': False, 'error': 'Path not found'}), 404

        path_data = path_doc.to_dict()
        steps = path_data.get('steps', [])

        # Update the specific step
        for step in steps:
            if step.get('stepNumber') == step_number:
                step['status'] = status
                step['progress'] = progress
                break

        # Calculate overall progress
        completed_steps = sum(1 for step in steps if step.get('status') == 'completed')
        overall_progress = (completed_steps / len(steps) * 100) if steps else 0

        # Update status based on progress
        if overall_progress == 100:
            path_status = 'completed'
        elif overall_progress > 0:
            path_status = 'active'
        else:
            path_status = path_data.get('status', 'active')

        # Update Firestore
        path_ref.update({
            'steps': steps,
            'progress': overall_progress,
            'status': path_status,
            'updatedAt': datetime.now().isoformat()
        })

        return jsonify({
            'success': True,
            'progress': overall_progress,
            'status': path_status
        }), 200

    except Exception as e:
        print(f"Error updating progress: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/paths/<path_id>', methods=['DELETE'])
def delete_path(path_id):
    """Delete a learning path"""
    try:
        if not db:
            return jsonify({'success': False, 'error': 'Database not connected'}), 500

        path_ref = db.collection('learningPaths').document(path_id)
        path_ref.delete()

        return jsonify({'success': True, 'message': 'Path deleted'}), 200

    except Exception as e:
        print(f"Error deleting path: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/resources', methods=['GET'])
def get_resources():
    """Get all resources with optional filtering"""
    try:
        if not db:
            return jsonify({'success': False, 'error': 'Database not connected'}), 500

        # Get query parameters
        competency = request.args.get('competency')
        resource_type = request.args.get('type')
        difficulty = request.args.get('difficulty')
        search = request.args.get('search', '').lower()

        # Load all resources
        resources_ref = db.collection('resources')
        docs = resources_ref.stream()

        resources = []
        for doc in docs:
            resource = doc.to_dict()
            resource['id'] = doc.id
            resources.append(resource)

        # Apply filters
        if competency:
            resources = [r for r in resources if competency in r.get('competencies', [])]

        if resource_type:
            resources = [r for r in resources if r.get('type') == resource_type]

        if difficulty:
            # Handle numeric difficulty (1=beginner, 2=intermediate, 3=advanced)
            diff_map = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
            target_diff = diff_map.get(difficulty.lower())
            if target_diff:
                resources = [r for r in resources if r.get('difficulty') == target_diff or r.get('difficulty') == difficulty]

        # Apply search
        if search:
            resources = [
                r for r in resources
                if search in r.get('title', '').lower() or
                   search in r.get('description', '').lower()
            ]

        return jsonify({
            'success': True,
            'resources': resources,
            'count': len(resources)
        }), 200

    except Exception as e:
        print(f"Error fetching resources: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/resources/<resource_id>', methods=['GET'])
def get_resource_detail(resource_id):
    """Get detailed information about a specific resource"""
    try:
        if not db:
            return jsonify({'success': False, 'error': 'Database not connected'}), 500

        resource_ref = db.collection('resources').document(resource_id)
        resource_doc = resource_ref.get()

        if not resource_doc.exists:
            return jsonify({'success': False, 'error': 'Resource not found'}), 404

        resource = resource_doc.to_dict()
        resource['id'] = resource_doc.id

        return jsonify({
            'success': True,
            'resource': resource
        }), 200

    except Exception as e:
        print(f"Error fetching resource detail: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"")
    print(f"🚀 Learning Journey Designer API")
    print(f"📡 Server running on: http://localhost:{port}")
    print(f"🔥 Firebase: {'✓ Connected' if db else '✗ Not Connected'}")
    print(f"🤖 AI Service: {'✓ Configured' if ai_service.model else '✗ Not Configured'}")
    print(f"")
    app.run(host='0.0.0.0', port=port, debug=True)
