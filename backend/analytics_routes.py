"""
Analytics API Routes
Endpoints for user learning analytics and progress tracking
"""

from flask import Blueprint, request, jsonify
from analytics_service import AnalyticsService

# Create blueprint
analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

# Analytics service will be initialized when registering blueprint
analytics_service = None

def init_analytics_routes(db):
    """Initialize analytics service with database connection"""
    global analytics_service
    analytics_service = AnalyticsService(db)

# ============================================================================
# ACTIVITY TRACKING
# ============================================================================

@analytics_bp.route('/track', methods=['POST'])
def track_activity():
    """
    Track user learning activity

    POST body:
    {
        "user_id": "user123",
        "activity_type": "competency_view",
        "data": {"competency_id": "javascript"},
        "duration_minutes": 15
    }
    """
    try:
        data = request.json

        user_id = data.get('user_id')
        activity_type = data.get('activity_type')
        activity_data = data.get('data', {})
        duration_minutes = data.get('duration_minutes', 0)

        if not all([user_id, activity_type]):
            return jsonify({
                'success': False,
                'error': 'user_id and activity_type are required'
            }), 400

        result = analytics_service.track_activity(
            user_id=user_id,
            activity_type=activity_type,
            data=activity_data,
            duration_minutes=duration_minutes
        )

        return jsonify(result), 200 if result.get('success') else 500

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# USER ANALYTICS
# ============================================================================

@analytics_bp.route('/user/<user_id>', methods=['GET'])
def get_user_analytics(user_id):
    """Get comprehensive user analytics"""
    try:
        analytics = analytics_service.get_user_analytics(user_id)
        return jsonify(analytics), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/user/<user_id>/summary', methods=['GET'])
def get_user_summary(user_id):
    """Get user analytics summary (quick overview)"""
    try:
        analytics = analytics_service.get_user_analytics(user_id)

        if not analytics.get('success'):
            return jsonify(analytics), 500

        return jsonify({
            'success': True,
            'summary': analytics.get('summary', {})
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/user/<user_id>/activities', methods=['GET'])
def get_user_activities(user_id):
    """Get user recent activities"""
    try:
        limit = int(request.args.get('limit', 20))
        analytics = analytics_service.get_user_analytics(user_id)

        return jsonify({
            'success': True,
            'activities': analytics.get('recent_activities', [])
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# LEARNING VELOCITY
# ============================================================================

@analytics_bp.route('/user/<user_id>/velocity', methods=['GET'])
def get_learning_velocity(user_id):
    """Get learning velocity (competencies per week)"""
    try:
        weeks = int(request.args.get('weeks', 4))
        velocity = analytics_service.calculate_learning_velocity(user_id, weeks)

        return jsonify(velocity), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# RECOMMENDATIONS
# ============================================================================

@analytics_bp.route('/user/<user_id>/recommendations', methods=['GET'])
def get_recommendations(user_id):
    """Get AI-powered learning recommendations"""
    try:
        recommendations = analytics_service.get_recommendations(user_id)

        return jsonify({
            'success': True,
            'recommendations': recommendations
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# LEARNING PATH PROGRESS
# ============================================================================

@analytics_bp.route('/path/<path_id>/progress', methods=['PUT'])
def update_path_progress(path_id):
    """
    Update learning path step progress

    PUT body:
    {
        "user_id": "user123",
        "step_number": 1,
        "status": "completed"
    }
    """
    try:
        data = request.json

        user_id = data.get('user_id')
        step_number = data.get('step_number')
        status = data.get('status')

        if not all([user_id, step_number, status]):
            return jsonify({
                'success': False,
                'error': 'user_id, step_number, and status are required'
            }), 400

        result = analytics_service.update_path_progress(
            user_id=user_id,
            path_id=path_id,
            step_number=step_number,
            status=status
        )

        return jsonify(result), 200 if result.get('success') else 500

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# DASHBOARD DATA
# ============================================================================

@analytics_bp.route('/user/<user_id>/dashboard', methods=['GET'])
def get_dashboard_data(user_id):
    """Get all data needed for user dashboard"""
    try:
        # Get comprehensive analytics
        analytics = analytics_service.get_user_analytics(user_id)

        if not analytics.get('success'):
            return jsonify(analytics), 500

        # Get recommendations
        recommendations = analytics_service.get_recommendations(user_id)

        # Get velocity
        velocity = analytics_service.calculate_learning_velocity(user_id, weeks=4)

        dashboard_data = {
            'success': True,
            'summary': analytics.get('summary', {}),
            'recent_activities': analytics.get('recent_activities', [])[:5],
            'learning_paths': analytics.get('learning_paths', []),
            'weekly_stats': analytics.get('weekly_stats', {}),
            'competency_mastery': analytics.get('competency_mastery', {}),
            'recommendations': recommendations,
            'velocity': velocity.get('average_velocity', 0)
        }

        return jsonify(dashboard_data), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# ANALYTICS PAGE DATA
# ============================================================================

@analytics_bp.route('/user/<user_id>/detailed', methods=['GET'])
def get_detailed_analytics(user_id):
    """Get detailed analytics for analytics page"""
    try:
        # Get analytics
        analytics = analytics_service.get_user_analytics(user_id)

        if not analytics.get('success'):
            return jsonify(analytics), 500

        # Get velocity over longer period
        velocity_12_weeks = analytics_service.calculate_learning_velocity(user_id, weeks=12)

        detailed_data = {
            'success': True,
            'summary': analytics.get('summary', {}),
            'learning_paths': analytics.get('learning_paths', []),
            'competency_mastery': analytics.get('competency_mastery', {}),
            'velocity': velocity_12_weeks,
            'weekly_stats': analytics.get('weekly_stats', {}),
            'recent_activities': analytics.get('recent_activities', [])
        }

        return jsonify(detailed_data), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
