"""
Analytics Service
Handles user learning analytics, progress tracking, and data aggregation
"""

from firebase_admin import firestore
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json

class AnalyticsService:
    """Service for managing user learning analytics"""

    def __init__(self, db):
        self.db = db

    # ========================================================================
    # PROGRESS TRACKING
    # ========================================================================

    def track_activity(self, user_id: str, activity_type: str,
                       data: Dict, duration_minutes: int = 0) -> Dict:
        """
        Track user learning activity

        Args:
            user_id: User ID
            activity_type: Type of activity (competency_view, resource_complete,
                          path_progress, assessment_take)
            data: Activity-specific data
            duration_minutes: Time spent in minutes
        """
        try:
            activity = {
                'user_id': user_id,
                'type': activity_type,
                'data': data,
                'duration_minutes': duration_minutes,
                'timestamp': datetime.now().isoformat()
            }

            # Add to activity log
            self.db.collection('users').document(user_id)\
                .collection('activities').add(activity)

            # Update user analytics
            self._update_analytics(user_id, activity_type, duration_minutes, data)

            return {'success': True, 'activity_id': activity}

        except Exception as e:
            print(f"Error tracking activity: {e}")
            return {'success': False, 'error': str(e)}

    def _update_analytics(self, user_id: str, activity_type: str,
                         duration_minutes: int, data: Dict):
        """Update aggregated analytics"""
        analytics_ref = self.db.collection('users').document(user_id)\
                               .collection('analytics').document('summary')

        analytics = analytics_ref.get()

        if analytics.exists:
            analytics_data = analytics.to_dict()
        else:
            analytics_data = {
                'total_time_minutes': 0,
                'total_activities': 0,
                'competencies_studied': set(),
                'resources_completed': 0,
                'paths_in_progress': 0,
                'last_activity': None,
                'streak_days': 0,
                'created_at': datetime.now().isoformat()
            }

        # Update metrics
        analytics_data['total_time_minutes'] += duration_minutes
        analytics_data['total_activities'] += 1
        analytics_data['updated_at'] = datetime.now().isoformat()

        # Update streak
        last_activity = analytics_data.get('last_activity')
        analytics_data['streak_days'] = self._calculate_streak(
            last_activity,
            analytics_data.get('streak_days', 0)
        )
        analytics_data['last_activity'] = datetime.now().isoformat()

        # Activity-specific updates
        if activity_type == 'competency_view':
            comp_set = set(analytics_data.get('competencies_studied', []))
            comp_set.add(data.get('competency_id'))
            analytics_data['competencies_studied'] = list(comp_set)

        elif activity_type == 'resource_complete':
            analytics_data['resources_completed'] = \
                analytics_data.get('resources_completed', 0) + 1

        analytics_ref.set(analytics_data)

    def _calculate_streak(self, last_activity_iso: Optional[str],
                         current_streak: int) -> int:
        """Calculate learning streak in days"""
        if not last_activity_iso:
            return 1

        try:
            last_activity = datetime.fromisoformat(last_activity_iso.replace('Z', '+00:00'))
            now = datetime.now()
            days_diff = (now - last_activity).days

            if days_diff == 0:
                return current_streak
            elif days_diff == 1:
                return current_streak + 1
            else:
                return 1
        except:
            return 1

    # ========================================================================
    # LEARNING PATH PROGRESS
    # ========================================================================

    def update_path_progress(self, user_id: str, path_id: str,
                            step_number: int, status: str) -> Dict:
        """Update learning path progress"""
        try:
            path_ref = self.db.collection('learningPaths').document(path_id)
            path_doc = path_ref.get()

            if not path_doc.exists:
                return {'success': False, 'error': 'Path not found'}

            path_data = path_doc.to_dict()
            steps = path_data.get('steps', [])

            # Update step status
            for step in steps:
                if step.get('stepNumber') == step_number:
                    step['status'] = status
                    if status == 'completed':
                        step['completed_at'] = datetime.now().isoformat()

            # Calculate overall progress
            completed_steps = sum(1 for step in steps if step.get('status') == 'completed')
            progress = (completed_steps / len(steps) * 100) if steps else 0

            path_ref.update({
                'steps': steps,
                'progress': progress,
                'updated_at': datetime.now().isoformat()
            })

            # Track activity
            self.track_activity(user_id, 'path_progress', {
                'path_id': path_id,
                'step_number': step_number,
                'status': status,
                'progress': progress
            })

            return {'success': True, 'progress': progress}

        except Exception as e:
            print(f"Error updating path progress: {e}")
            return {'success': False, 'error': str(e)}

    # ========================================================================
    # ANALYTICS QUERIES
    # ========================================================================

    def get_user_analytics(self, user_id: str) -> Dict:
        """Get comprehensive user analytics"""
        try:
            # Get summary
            summary_ref = self.db.collection('users').document(user_id)\
                                 .collection('analytics').document('summary')
            summary = summary_ref.get()

            if not summary.exists:
                return self._create_empty_analytics()

            analytics = summary.to_dict()

            # Get recent activities
            activities = self._get_recent_activities(user_id, limit=10)

            # Get learning paths progress
            paths = self._get_user_paths_progress(user_id)

            # Calculate weekly stats
            weekly_stats = self._calculate_weekly_stats(user_id)

            # Get competency mastery
            mastery = self._get_competency_mastery(user_id)

            return {
                'success': True,
                'summary': {
                    'total_time_minutes': analytics.get('total_time_minutes', 0),
                    'total_activities': analytics.get('total_activities', 0),
                    'streak_days': analytics.get('streak_days', 0),
                    'resources_completed': analytics.get('resources_completed', 0),
                    'competencies_count': len(analytics.get('competencies_studied', []))
                },
                'recent_activities': activities,
                'learning_paths': paths,
                'weekly_stats': weekly_stats,
                'competency_mastery': mastery
            }

        except Exception as e:
            print(f"Error getting analytics: {e}")
            return {'success': False, 'error': str(e)}

    def _get_recent_activities(self, user_id: str, limit: int = 10) -> List[Dict]:
        """Get recent activities"""
        try:
            activities_ref = self.db.collection('users').document(user_id)\
                                    .collection('activities')\
                                    .order_by('timestamp', direction=firestore.Query.DESCENDING)\
                                    .limit(limit)

            activities = []
            for doc in activities_ref.stream():
                activity = doc.to_dict()
                activity['id'] = doc.id
                activities.append(activity)

            return activities
        except Exception as e:
            print(f"Error getting activities: {e}")
            return []

    def _get_user_paths_progress(self, user_id: str) -> List[Dict]:
        """Get user's learning paths with progress"""
        try:
            paths_ref = self.db.collection('learningPaths')\
                               .where('userId', '==', user_id)

            paths = []
            for doc in paths_ref.stream():
                path = doc.to_dict()
                path['id'] = doc.id
                paths.append(path)

            return paths
        except Exception as e:
            print(f"Error getting paths: {e}")
            return []

    def _calculate_weekly_stats(self, user_id: str) -> Dict:
        """Calculate statistics for the past week"""
        try:
            week_ago = datetime.now() - timedelta(days=7)
            week_ago_iso = week_ago.isoformat()

            activities_ref = self.db.collection('users').document(user_id)\
                                    .collection('activities')\
                                    .where('timestamp', '>=', week_ago_iso)

            daily_time = {}
            for doc in activities_ref.stream():
                activity = doc.to_dict()
                timestamp = activity.get('timestamp', '')
                try:
                    date = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).date()
                    day_str = date.strftime('%Y-%m-%d')
                    daily_time[day_str] = daily_time.get(day_str, 0) + \
                                         activity.get('duration_minutes', 0)
                except:
                    continue

            # Fill in missing days
            for i in range(7):
                day = (datetime.now() - timedelta(days=i)).date()
                day_str = day.strftime('%Y-%m-%d')
                if day_str not in daily_time:
                    daily_time[day_str] = 0

            return daily_time

        except Exception as e:
            print(f"Error calculating weekly stats: {e}")
            return {}

    def _get_competency_mastery(self, user_id: str) -> Dict:
        """Get competency mastery levels by category"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            user_doc = user_ref.get()

            if not user_doc.exists:
                return {}

            competencies = user_doc.to_dict().get('competencies', {})

            # Group by category
            categories = {}
            for comp_id, level in competencies.items():
                # Get competency details
                comp_doc = self.db.collection('competencies').document(comp_id).get()
                if comp_doc.exists:
                    category = comp_doc.to_dict().get('category', 'general')
                    if category not in categories:
                        categories[category] = {'total': 0, 'sum': 0, 'count': 0}

                    categories[category]['sum'] += level
                    categories[category]['count'] += 1

            # Calculate averages
            mastery = {}
            for category, data in categories.items():
                mastery[category] = round(data['sum'] / data['count'], 2) if data['count'] > 0 else 0

            return mastery

        except Exception as e:
            print(f"Error getting mastery: {e}")
            return {}

    def _create_empty_analytics(self) -> Dict:
        """Create empty analytics structure"""
        return {
            'success': True,
            'summary': {
                'total_time_minutes': 0,
                'total_activities': 0,
                'streak_days': 0,
                'resources_completed': 0,
                'competencies_count': 0
            },
            'recent_activities': [],
            'learning_paths': [],
            'weekly_stats': {},
            'competency_mastery': {}
        }

    # ========================================================================
    # LEARNING VELOCITY
    # ========================================================================

    def calculate_learning_velocity(self, user_id: str, weeks: int = 4) -> Dict:
        """Calculate learning velocity (competencies per week)"""
        try:
            start_date = datetime.now() - timedelta(weeks=weeks)
            start_iso = start_date.isoformat()

            activities_ref = self.db.collection('users').document(user_id)\
                                    .collection('activities')\
                                    .where('timestamp', '>=', start_iso)\
                                    .where('type', '==', 'competency_view')

            unique_competencies_per_week = {}
            for doc in activities_ref.stream():
                activity = doc.to_dict()
                timestamp = activity.get('timestamp', '')
                try:
                    date = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    week_start = (date - timedelta(days=date.weekday())).date()
                    week_str = week_start.strftime('%Y-%m-%d')

                    if week_str not in unique_competencies_per_week:
                        unique_competencies_per_week[week_str] = set()

                    comp_id = activity.get('data', {}).get('competency_id')
                    if comp_id:
                        unique_competencies_per_week[week_str].add(comp_id)
                except:
                    continue

            velocity_data = {
                week: len(comps)
                for week, comps in unique_competencies_per_week.items()
            }

            avg_velocity = sum(velocity_data.values()) / len(velocity_data) \
                          if velocity_data else 0

            return {
                'success': True,
                'velocity_per_week': velocity_data,
                'average_velocity': round(avg_velocity, 2),
                'total_competencies': sum(velocity_data.values())
            }

        except Exception as e:
            print(f"Error calculating velocity: {e}")
            return {'success': False, 'error': str(e)}

    # ========================================================================
    # RECOMMENDATIONS
    # ========================================================================

    def get_recommendations(self, user_id: str) -> List[Dict]:
        """Get AI-powered learning recommendations"""
        try:
            # Get user competencies
            user_ref = self.db.collection('users').document(user_id)
            user_doc = user_ref.get()

            if not user_doc.exists:
                return []

            user_competencies = user_doc.to_dict().get('competencies', {})

            # Get learning paths
            paths = self._get_user_paths_progress(user_id)

            recommendations = []

            # Recommend next steps in current paths
            for path in paths:
                if path.get('progress', 0) < 100:
                    steps = path.get('steps', [])
                    for step in steps:
                        if step.get('status') != 'completed':
                            recommendations.append({
                                'type': 'path_step',
                                'title': f"Continue: {path.get('title', 'Learning Path')}",
                                'description': step.get('description', ''),
                                'path_id': path.get('id'),
                                'step_number': step.get('stepNumber'),
                                'priority': 'high'
                            })
                            break

            # Recommend based on weak competencies
            for comp_id, level in user_competencies.items():
                if level < 2.0:
                    comp_doc = self.db.collection('competencies').document(comp_id).get()
                    if comp_doc.exists:
                        comp_data = comp_doc.to_dict()
                        recommendations.append({
                            'type': 'improve_competency',
                            'title': f"Improve: {comp_data.get('name', comp_id)}",
                            'description': f"Current level: {level}/5. Practice to master this skill.",
                            'competency_id': comp_id,
                            'priority': 'medium'
                        })

            return recommendations[:5]  # Return top 5

        except Exception as e:
            print(f"Error getting recommendations: {e}")
            return []
