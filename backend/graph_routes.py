"""
Graph API Routes
Endpoints for knowledge graph visualization and relationship management
"""

from flask import Blueprint, request, jsonify
from graph_service import GraphService
from firebase_admin import firestore

# Create blueprint
graph_bp = Blueprint('graph', __name__, url_prefix='/api/graph')

# Initialize service (will be set when registering blueprint)
graph_service = None

def init_graph_routes(db):
    """Initialize graph service with database connection"""
    global graph_service
    graph_service = GraphService(db)

# ============================================================================
# GRAPH VISUALIZATION ENDPOINTS
# ============================================================================

@graph_bp.route('/full', methods=['GET'])
def get_full_graph():
    """
    Get complete knowledge graph with all competencies and relationships

    Query params:
    - include_roles: bool (default: true)
    """
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

@graph_bp.route('/competency/<competency_id>', methods=['GET'])
def get_competency_graph(competency_id):
    """
    Get graph centered around a specific competency

    Query params:
    - depth: int (default: 2) - how many levels to traverse
    """
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

@graph_bp.route('/competency/<competency_id>/relationships', methods=['GET'])
def get_competency_relationships(competency_id):
    """
    Get all relationships for a specific competency

    Query params:
    - type: str (optional) - filter by relationship type
    """
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

@graph_bp.route('/category/<category>', methods=['GET'])
def get_category_graph(category):
    """Get graph for a specific competency category"""
    try:
        # Get all competencies in this category
        db = graph_service.db
        comp_query = db.collection('competencies').where('category', '==', category)

        competency_ids = [doc.id for doc in comp_query.stream()]

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

# ============================================================================
# ROLE & PATH ENDPOINTS
# ============================================================================

@graph_bp.route('/roles', methods=['GET'])
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

@graph_bp.route('/roles/<role_id>', methods=['GET'])
def get_role_details(role_id):
    """Get role details and required competencies"""
    try:
        db = graph_service.db
        role_doc = db.collection('roles').document(role_id).get()

        if not role_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Role not found'
            }), 404

        role_data = role_doc.to_dict()
        role_data['id'] = role_id

        # Get requirements
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

@graph_bp.route('/roles/<role_id>/graph', methods=['GET'])
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

@graph_bp.route('/path-to-role', methods=['POST'])
def find_path_to_role():
    """
    Find learning path from user's current competencies to target role

    POST body:
    {
        "role_id": "full-stack-developer",
        "user_competencies": {"comp1": 2.5, "comp2": 1.0}
    }
    """
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

# ============================================================================
# RELATIONSHIP MANAGEMENT ENDPOINTS
# ============================================================================

@graph_bp.route('/relationships', methods=['POST'])
def add_relationship():
    """
    Add a new relationship between competencies or competency-to-role

    POST body:
    {
        "source_id": "javascript",
        "target_id": "react",
        "type": "PREREQUISITE_OF",
        "strength": 0.8,
        "metadata": {}
    }
    """
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

@graph_bp.route('/relationships/<relationship_id>', methods=['DELETE'])
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

@graph_bp.route('/roles', methods=['POST'])
def add_role():
    """
    Add a new role

    POST body:
    {
        "role_id": "full-stack-developer",
        "name": "Full Stack Developer",
        "description": "...",
        "metadata": {"salary_range": "$80k-$150k"}
    }
    """
    try:
        data = request.json

        role_id = data.get('role_id')
        name = data.get('name')
        description = data.get('description')
        metadata = data.get('metadata', {})

        if not all([role_id, name, description]):
            return jsonify({
                'success': False,
                'error': 'role_id, name, and description are required'
            }), 400

        result = graph_service.add_role(
            role_id=role_id,
            name=name,
            description=description,
            metadata=metadata
        )

        return jsonify(result), 201 if result.get('success') else 400

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# STATISTICS
# ============================================================================

@graph_bp.route('/statistics', methods=['GET'])
def get_statistics():
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
