import uuid
from datetime import datetime
from typing import Dict, List, Any

class PathService:
    def __init__(self):
        # In a real app, this would connect to Firestore
        # For now, we'll use in-memory storage
        self.paths = {}

    def generate_learning_path(
        self,
        user_id: str,
        current_competencies: Dict[str, int],
        target_competencies: List[str],
        available_time: int = 10,
        preferences: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Generate personalized learning path

        Args:
            user_id: User identifier
            current_competencies: Dict of competency_id -> level (0-5)
            target_competencies: List of target competency IDs
            available_time: Hours per week available
            preferences: Learning preferences (resource types, etc.)

        Returns:
            Structured learning path object
        """
        if preferences is None:
            preferences = {}

        # Identify gap competencies
        gap_competencies = [
            comp_id for comp_id in target_competencies
            if comp_id not in current_competencies or current_competencies.get(comp_id, 0) < 3
        ]

        # Generate path ID
        path_id = str(uuid.uuid4())

        # Create learning steps (simplified algorithm)
        steps = []
        total_duration = 0

        for idx, comp_id in enumerate(gap_competencies):
            # Estimate hours needed based on current level
            current_level = current_competencies.get(comp_id, 0)
            hours_needed = (5 - current_level) * 10  # Rough estimate

            step = {
                "order": idx + 1,
                "competency_id": comp_id,
                "competency_name": f"Competency {comp_id}",  # Would fetch from DB
                "estimated_hours": hours_needed,
                "resources": [],  # Would populate from resource DB
                "completed": False,
                "milestone": (idx + 1) % 3 == 0  # Every 3rd step is a milestone
            }

            steps.append(step)
            total_duration += hours_needed

        # Calculate estimated weeks
        estimated_weeks = round(total_duration / available_time) if available_time > 0 else 0

        # Create milestones
        milestones = []
        if len(steps) > 0:
            milestone_count = max((len(steps) + 2) // 3, 1)  # Ceiling division
            weeks_per_milestone = estimated_weeks // milestone_count if milestone_count > 0 else estimated_weeks

            for i in range(0, len(steps), 3):
                milestone_comps = [s["competency_name"] for s in steps[i:min(i+3, len(steps))]]
                milestones.append({
                    "week": (i // 3) * weeks_per_milestone,
                    "title": f"Milestone {i//3 + 1}",
                    "competencies": milestone_comps
                })

        # Create path object
        path = {
            "path_id": path_id,
            "user_id": user_id,
            "title": f"Path to {len(target_competencies)} Competencies",
            "total_duration": total_duration,
            "estimated_weeks": estimated_weeks,
            "steps": steps,
            "milestones": milestones,
            "status": "active",
            "progress": 0,
            "created_at": datetime.now().isoformat()
        }

        # Store path
        self.paths[path_id] = path

        return path

    def get_path(self, path_id: str) -> Dict[str, Any]:
        """Get learning path by ID"""
        return self.paths.get(path_id)

    def update_progress(self, path_id: str, step_id: int, completed: bool) -> Dict[str, Any]:
        """Update progress on a learning path step"""
        path = self.paths.get(path_id)
        if not path:
            raise ValueError(f"Path {path_id} not found")

        # Update step completion
        for step in path["steps"]:
            if step["order"] == step_id:
                step["completed"] = completed
                break

        # Recalculate overall progress
        completed_steps = sum(1 for s in path["steps"] if s["completed"])
        path["progress"] = round((completed_steps / len(path["steps"])) * 100)

        # Update status
        if path["progress"] == 100:
            path["status"] = "completed"

        return path

    def list_user_paths(self, user_id: str) -> List[Dict[str, Any]]:
        """List all paths for a user"""
        return [
            path for path in self.paths.values()
            if path["user_id"] == user_id
        ]
