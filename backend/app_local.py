"""
Backend with Local Mock Resources - No Firebase Required
This replaces Firestore with local JSON data for resources
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from graph_service_local import LocalGraphService
from mock_quiz_generator import mock_quiz_generator

# Try to import optional AI dependencies
try:
    from dotenv import load_dotenv
    import google.generativeai as genai
    load_dotenv()
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    print("⚠ Warning: AI dependencies not installed. Using mock quiz generator.")

app = Flask(__name__)
CORS(app)

# Load resources from JSON file
def load_local_resources():
    """Load resources from learning-resources.json"""
    try:
        json_path = os.path.join(os.path.dirname(__file__), '..', '..', 'learning-resources.json')
        with open(json_path, 'r') as f:
            data = json.load(f)
            resources = data.get('resources', [])
            return {r['id']: r for r in resources}
    except Exception as e:
        print(f"Error loading resources: {e}")
        return {}

def load_local_competencies():
    """Load competencies from competency-taxonomy.json"""
    try:
        json_path = os.path.join(os.path.dirname(__file__), '..', '..', 'competency-taxonomy.json')
        with open(json_path, 'r') as f:
            data = json.load(f)
            competencies = data.get('competencies', [])
            return {c['id']: c for c in competencies}
    except Exception as e:
        print(f"Error loading competencies: {e}")
        return {}

# Load data on startup
RESOURCES = load_local_resources()
COMPETENCIES = load_local_competencies()

# Initialize graph service
graph_service = LocalGraphService(COMPETENCIES)

# Initialize AI service (Google Gemini)
ai_model = None
if AI_AVAILABLE:
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key:
        try:
            genai.configure(api_key=api_key)
            ai_model = genai.GenerativeModel('gemini-1.5-flash')
            print(f"✓ AI service initialized with Gemini API")
        except Exception as e:
            print(f"⚠ Warning: Failed to initialize Gemini AI: {e}")
            print(f"✓ Using mock quiz generator as fallback")
            ai_model = None
    else:
        print(f"⚠ Warning: GEMINI_API_KEY not set.")
        print(f"✓ Using mock quiz generator as fallback")
else:
    print(f"✓ Using mock quiz generator (AI dependencies not installed)")

print(f"✓ Loaded {len(RESOURCES)} resources from JSON")
print(f"✓ Loaded {len(COMPETENCIES)} competencies from JSON")
print(f"✓ Initialized knowledge graph service")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'firebase': 'local-mode',
        'resources_count': len(RESOURCES),
        'competencies_count': len(COMPETENCIES)
    }), 200

@app.route('/api/resources', methods=['GET'])
def get_resources():
    """Get all resources with optional filtering"""
    try:
        # Get query parameters
        competency = request.args.get('competency')
        resource_type = request.args.get('type')
        difficulty = request.args.get('difficulty')
        search = request.args.get('search', '').lower()

        # Start with all resources
        resources = list(RESOURCES.values())

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
                resources = [r for r in resources if r.get('difficulty') == target_diff]

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
        resource = RESOURCES.get(resource_id)

        if not resource:
            return jsonify({'success': False, 'error': 'Resource not found'}), 404

        return jsonify({
            'success': True,
            'resource': resource
        }), 200

    except Exception as e:
        print(f"Error fetching resource detail: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/competencies', methods=['GET'])
def get_competencies():
    """Get all available competencies"""
    try:
        return jsonify({
            'success': True,
            'competencies': COMPETENCIES
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Placeholder endpoints for paths (will return empty for now)
@app.route('/api/paths/<user_id>', methods=['GET'])
def get_user_paths(user_id):
    """Get user's learning paths"""
    return jsonify({'success': True, 'paths': []}), 200

@app.route('/api/path/<path_id>', methods=['GET'])
def get_path(path_id):
    """Get specific path"""
    return jsonify({'success': False, 'error': 'Path not found'}), 404

# ============================================================================
# KNOWLEDGE GRAPH ENDPOINTS
# ============================================================================

@app.route('/api/graph/full', methods=['GET'])
def get_full_graph():
    """Get complete knowledge graph with all competencies and relationships"""
    try:
        include_roles = request.args.get('include_roles', 'true').lower() == 'true'

        graph_data = graph_service.build_graph_data(
            competency_ids=None,
            include_roles=include_roles
        )

        return jsonify({
            'success': True,
            'graph': graph_data
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/competency/<competency_id>', methods=['GET'])
def get_competency_graph(competency_id):
    """Get graph centered around a specific competency"""
    try:
        depth = int(request.args.get('depth', 2))

        graph_data = graph_service.get_competency_graph(
            competency_id=competency_id,
            depth=depth
        )

        return jsonify({
            'success': True,
            'graph': graph_data,
            'center_competency': competency_id
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/competency/<competency_id>/relationships', methods=['GET'])
def get_competency_relationships(competency_id):
    """Get all relationships for a specific competency"""
    try:
        rel_type = request.args.get('type')

        relationships = graph_service.get_relationships(
            competency_id=competency_id,
            relationship_type=rel_type
        )

        return jsonify({
            'success': True,
            'competency_id': competency_id,
            'relationships': relationships,
            'count': len(relationships)
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/category/<category>', methods=['GET'])
def get_category_graph(category):
    """Get graph for a specific competency category"""
    try:
        # Get all competencies in this category
        competency_ids = [
            comp_id for comp_id, comp in COMPETENCIES.items()
            if comp.get('category') == category
        ]

        if not competency_ids:
            return jsonify({
                'success': False,
                'error': f'No competencies found in category: {category}'
            }), 404

        graph_data = graph_service.build_graph_data(
            competency_ids=competency_ids,
            include_roles=True
        )

        return jsonify({
            'success': True,
            'category': category,
            'graph': graph_data
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/roles', methods=['GET'])
def get_all_roles():
    """Get all available career roles"""
    try:
        roles = graph_service.get_all_roles()

        return jsonify({
            'success': True,
            'roles': roles,
            'count': len(roles)
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/roles/<role_id>', methods=['GET'])
def get_role_details(role_id):
    """Get role details and required competencies"""
    try:
        if role_id not in graph_service.roles:
            return jsonify({
                'success': False,
                'error': 'Role not found'
            }), 404

        role_data = graph_service.roles[role_id].copy()
        role_data['id'] = role_id

        requirements = graph_service.get_role_requirements(role_id)

        return jsonify({
            'success': True,
            'role': role_data,
            'requirements': requirements
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/roles/<role_id>/graph', methods=['GET'])
def get_role_graph(role_id):
    """Get graph showing all competencies leading to a role"""
    try:
        requirements = graph_service.get_role_requirements(role_id)

        if 'error' in requirements:
            return jsonify({
                'success': False,
                'error': requirements['error']
            }), 500

        competency_ids = [c['id'] for c in requirements['competencies']]

        graph_data = graph_service.build_graph_data(
            competency_ids=competency_ids,
            include_roles=True
        )

        return jsonify({
            'success': True,
            'role_id': role_id,
            'graph': graph_data
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/path-to-role', methods=['POST'])
def find_path_to_role():
    """Find learning path from user's current competencies to target role"""
    try:
        data = request.json
        role_id = data.get('role_id')
        user_competencies = data.get('user_competencies', {})

        if not role_id:
            return jsonify({
                'success': False,
                'error': 'role_id is required'
            }), 400

        path_data = graph_service.find_learning_path_to_role(
            role_id=role_id,
            user_competencies=user_competencies
        )

        return jsonify({
            'success': True,
            'path': path_data
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/relationships', methods=['POST'])
def add_relationship():
    """Add a new relationship between competencies"""
    try:
        data = request.json

        source_id = data.get('source_id')
        target_id = data.get('target_id')
        rel_type = data.get('type')
        strength = data.get('strength', 1.0)
        metadata = data.get('metadata', {})

        if not all([source_id, target_id, rel_type]):
            return jsonify({
                'success': False,
                'error': 'source_id, target_id, and type are required'
            }), 400

        result = graph_service.add_relationship(
            source_id=source_id,
            target_id=target_id,
            relationship_type=rel_type,
            strength=strength,
            metadata=metadata
        )

        return jsonify(result), 201 if result.get('success') else 400

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/relationships/<relationship_id>', methods=['DELETE'])
def delete_relationship(relationship_id):
    """Delete a relationship"""
    try:
        result = graph_service.delete_relationship(relationship_id)
        return jsonify(result), 200 if result.get('success') else 400

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/statistics', methods=['GET'])
def get_graph_statistics():
    """Get graph statistics"""
    try:
        stats = graph_service.get_statistics()

        return jsonify({
            'success': True,
            'statistics': stats
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/users/<user_id>/competencies', methods=['GET'])
def get_user_competencies(user_id):
    """Get user's competency levels"""
    try:
        # For demo purposes, return empty competencies
        # In a real app, this would load from a database
        return jsonify({
            'success': True,
            'competencies': {}
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# AI ENDPOINTS
# ============================================================================

@app.route('/api/ai/explain', methods=['POST'])
def explain_concept():
    """Generate personalized explanation for a competency"""
    try:
        data = request.json
        competency_name = data.get('competency_name')
        user_level = data.get('user_level', 'beginner')
        user_background = data.get('user_background', '')

        if not competency_name:
            return jsonify({"error": "competency_name is required"}), 400

        # Try AI model first, fall back to mock generator
        if ai_model:
            try:
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

                response = ai_model.generate_content(prompt)

                return jsonify({
                    "explanation": response.text,
                    "competency": competency_name,
                    "level": user_level
                }), 200

            except Exception as e:
                print(f"AI explanation failed: {e}, falling back to mock generator")

        # Use mock generator as fallback
        explanation = mock_quiz_generator.generate_explanation(competency_name, user_level)

        return jsonify({
            "explanation": explanation,
            "competency": competency_name,
            "level": user_level
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/summarize', methods=['POST'])
def summarize_resource():
    """Generate summary of a learning resource"""
    try:
        data = request.json
        content = data.get('content')
        resource_title = data.get('title', 'Resource')

        if not content:
            return jsonify({"error": "content is required"}), 400

        if not ai_model:
            return jsonify({
                "summary": "AI service not configured. Please set GEMINI_API_KEY environment variable.",
                "title": resource_title
            }), 200

        prompt = f"""
Summarize the following learning resource titled "{resource_title}".

Content:
{content[:3000]}

Provide:
1. Main topics covered (3-5 bullet points)
2. Key takeaways (2-3 sentences)
3. Who should use this resource
4. Estimated time to complete

Keep the summary concise and actionable (under 200 words).
"""

        response = ai_model.generate_content(prompt)

        return jsonify({
            "summary": response.text,
            "title": resource_title
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/quiz', methods=['POST'])
def generate_quiz():
    """Generate practice questions for a competency"""
    try:
        data = request.json
        competency_name = data.get('competency_name')
        difficulty = data.get('difficulty', 'intermediate')
        num_questions = data.get('num_questions', 3)

        if not competency_name:
            return jsonify({"error": "competency_name is required"}), 400

        # Try to use AI model first, fall back to mock generator
        if ai_model:
            try:
                prompt = f"""
Generate {num_questions} multiple choice questions to assess knowledge of {competency_name}.
Difficulty level: {difficulty}

For each question, provide:
- question: The question text
- options: Array of 4 options (A, B, C, D)
- correct_answer: Index of correct option (0-3)
- explanation: Brief explanation of the correct answer

Return ONLY valid JSON in this exact format:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Explanation here"
  }}
]

Make questions practical and test real understanding, not just memorization.
"""

                response = ai_model.generate_content(prompt)

                # Parse JSON from response
                text = response.text.strip()
                # Remove markdown code blocks if present
                if text.startswith('```'):
                    text = text.split('```')[1]
                    if text.startswith('json'):
                        text = text[4:]
                    text = text.strip()

                questions = json.loads(text)

                return jsonify({
                    "questions": questions,
                    "competency": competency_name,
                    "difficulty": difficulty
                }), 200

            except Exception as e:
                print(f"AI quiz generation failed: {e}, falling back to mock generator")

        # Use mock quiz generator as fallback
        questions = mock_quiz_generator.generate_quiz(
            competency_name,
            difficulty,
            num_questions
        )

        return jsonify({
            "questions": questions,
            "competency": competency_name,
            "difficulty": difficulty
        }), 200

    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({
            "questions": [{
                "question": f"Error generating quiz: {str(e)}",
                "options": ["Error", "Error", "Error", "Error"],
                "correct_answer": 0,
                "explanation": "Failed to generate questions. Please try again."
            }],
            "competency": competency_name,
            "difficulty": difficulty
        }), 200

@app.route('/api/ai/recommendations', methods=['POST'])
def get_recommendations():
    """Get personalized learning recommendations"""
    try:
        data = request.json
        user_competencies = data.get('user_competencies', [])
        target_competencies = data.get('target_competencies', [])

        if not ai_model:
            return jsonify({
                "recommendations": "AI service not configured. Please set GEMINI_API_KEY environment variable."
            }), 200

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

        response = ai_model.generate_content(prompt)

        return jsonify({
            "recommendations": response.text
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("STARTING LOCAL BACKEND (NO FIREBASE)")
    print("=" * 60)
    print(f"Resources: {len(RESOURCES)}")
    print(f"Competencies: {len(COMPETENCIES)}")
    print(f"Roles: {len(graph_service.roles)}")
    print(f"Relationships: {len(graph_service.relationships)}")
    print("Server: http://localhost:5000")
    print("=" * 60 + "\n")

    app.run(host='0.0.0.0', port=5000, debug=True)
