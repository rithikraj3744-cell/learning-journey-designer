"""
Learning Path Generator Algorithm
Automatically generates personalized learning paths based on competency gaps
"""

from typing import List, Dict, Set, Tuple
from collections import defaultdict, deque
from datetime import datetime, timedelta
import json


class LearningPathGenerator:
    """
    Generates optimized learning paths based on user competencies and goals
    """

    def __init__(self, competencies_data: Dict, resources_data: Dict):
        """
        Initialize with competencies and resources data

        Args:
            competencies_data: Dict of competency_id -> competency info
            resources_data: Dict of resource_id -> resource info
        """
        self.competencies = competencies_data
        self.resources = resources_data
        self.prerequisite_graph = self._build_prerequisite_graph()

    def _build_prerequisite_graph(self) -> Dict[str, List[str]]:
        """Build adjacency list for prerequisite relationships"""
        graph = defaultdict(list)

        for comp_id, comp_data in self.competencies.items():
            prerequisites = comp_data.get('prerequisites', [])
            for prereq in prerequisites:
                graph[prereq].append(comp_id)

        return graph

    def identify_gaps(
        self,
        current_competencies: Dict[str, int],
        target_competencies: List[str]
    ) -> List[str]:
        """
        Identify competency gaps between current and target

        Args:
            current_competencies: Dict of competency_id -> proficiency_score (0-100)
            target_competencies: List of target competency IDs

        Returns:
            List of competency IDs that need to be learned
        """
        gaps = []

        for target_id in target_competencies:
            current_score = current_competencies.get(target_id, 0)

            # Consider it a gap if score is below 60%
            if current_score < 60:
                gaps.append(target_id)

        return gaps

    def topological_sort_with_prerequisites(
        self,
        competency_ids: List[str]
    ) -> List[str]:
        """
        Sort competencies based on prerequisites using topological sort

        Args:
            competency_ids: List of competency IDs to sort

        Returns:
            Ordered list respecting prerequisite dependencies
        """
        # Build in-degree map
        in_degree = defaultdict(int)
        local_graph = defaultdict(list)

        # Build subgraph for relevant competencies
        relevant = set(competency_ids)
        for comp_id in competency_ids:
            prereqs = self.competencies.get(comp_id, {}).get('prerequisites', [])
            for prereq in prereqs:
                if prereq in relevant:
                    local_graph[prereq].append(comp_id)
                    in_degree[comp_id] += 1

        # Initialize queue with nodes having no prerequisites
        queue = deque([comp_id for comp_id in competency_ids if in_degree[comp_id] == 0])
        result = []

        while queue:
            current = queue.popleft()
            result.append(current)

            # Reduce in-degree for dependent competencies
            for dependent in local_graph[current]:
                in_degree[dependent] -= 1
                if in_degree[dependent] == 0:
                    queue.append(dependent)

        # Add any remaining competencies (circular dependencies or isolated nodes)
        remaining = set(competency_ids) - set(result)
        result.extend(remaining)

        return result

    def select_resources(
        self,
        competency_id: str,
        user_preferences: Dict,
        current_level: int
    ) -> List[Dict]:
        """
        Select appropriate resources for a competency

        Args:
            competency_id: ID of the competency
            user_preferences: User's learning preferences
            current_level: User's current proficiency (0-100)

        Returns:
            List of selected resources
        """
        # Determine appropriate difficulty
        if current_level < 30:
            target_difficulty = 'beginner'
        elif current_level < 70:
            target_difficulty = 'intermediate'
        else:
            target_difficulty = 'advanced'

        # Get competency resources
        comp_resources = self.competencies.get(competency_id, {}).get('resources', [])

        # Filter by preferences and difficulty
        preferred_types = user_preferences.get('preferredResourceTypes', [])
        learning_style = user_preferences.get('learningStyle', 'visual')

        selected = []

        for resource in comp_resources:
            # Match difficulty
            if resource.get('difficulty', '').lower() == target_difficulty:
                # Prefer user's preferred types
                if not preferred_types or resource.get('type') in preferred_types:
                    selected.append(resource)

        # If no resources match, relax criteria
        if not selected:
            selected = comp_resources[:3]  # Take top 3

        # Sort by rating if available
        selected.sort(key=lambda x: x.get('rating', 0), reverse=True)

        return selected[:3]  # Return top 3 resources

    def estimate_duration(
        self,
        competency_ids: List[str],
        resources_map: Dict[str, List[Dict]]
    ) -> Tuple[int, Dict[str, int]]:
        """
        Estimate total duration for learning path

        Args:
            competency_ids: List of competencies in path
            resources_map: Map of competency_id -> selected resources

        Returns:
            (total_hours, competency_hours_map)
        """
        total_hours = 0
        competency_hours = {}

        for comp_id in competency_ids:
            comp_data = self.competencies.get(comp_id, {})
            estimated_hours = comp_data.get('estimatedHours', 10)

            # Adjust based on resources
            resources = resources_map.get(comp_id, [])
            if resources:
                # Parse resource durations
                resource_hours = 0
                for resource in resources:
                    duration_str = resource.get('duration', '0 hours')
                    try:
                        hours = int(duration_str.split()[0])
                        resource_hours += hours
                    except:
                        resource_hours += estimated_hours / len(resources)

                estimated_hours = max(estimated_hours, resource_hours)

            competency_hours[comp_id] = estimated_hours
            total_hours += estimated_hours

        return total_hours, competency_hours

    def create_milestones(
        self,
        ordered_competencies: List[str],
        competency_hours: Dict[str, int]
    ) -> List[Dict]:
        """
        Create learning milestones for the path

        Args:
            ordered_competencies: Ordered list of competency IDs
            competency_hours: Hours required per competency

        Returns:
            List of milestone objects
        """
        milestones = []
        cumulative_hours = 0

        # Group competencies into milestones (every 3-4 competencies)
        milestone_size = 3

        for i in range(0, len(ordered_competencies), milestone_size):
            group = ordered_competencies[i:i + milestone_size]

            milestone_hours = sum(competency_hours.get(c, 0) for c in group)
            cumulative_hours += milestone_hours

            milestones.append({
                'id': f'milestone-{len(milestones) + 1}',
                'name': f'Milestone {len(milestones) + 1}',
                'competencies': group,
                'estimatedHours': milestone_hours,
                'cumulativeHours': cumulative_hours,
                'order': len(milestones) + 1
            })

        return milestones

    def generate_path(
        self,
        user_id: str,
        current_competencies: Dict[str, int],
        target_competencies: List[str],
        time_available: int,
        preferences: Dict
    ) -> Dict:
        """
        Main method to generate a complete learning path

        Args:
            user_id: User's ID
            current_competencies: Current competency scores
            target_competencies: Target competency IDs
            time_available: Hours available per week
            preferences: User learning preferences

        Returns:
            Complete learning path object
        """
        # Step 1: Identify gaps
        gaps = self.identify_gaps(current_competencies, target_competencies)

        if not gaps:
            return {
                'success': False,
                'message': 'No competency gaps identified. You already meet the targets!'
            }

        # Step 2: Add prerequisites
        all_required = self._expand_with_prerequisites(gaps, current_competencies)

        # Step 3: Topological sort
        ordered_competencies = self.topological_sort_with_prerequisites(all_required)

        # Step 4: Select resources for each competency
        resources_map = {}
        for comp_id in ordered_competencies:
            current_level = current_competencies.get(comp_id, 0)
            resources = self.select_resources(comp_id, preferences, current_level)
            resources_map[comp_id] = resources

        # Step 5: Estimate duration
        total_hours, competency_hours = self.estimate_duration(
            ordered_competencies, resources_map
        )

        # Step 6: Create milestones
        milestones = self.create_milestones(ordered_competencies, competency_hours)

        # Step 7: Build steps
        steps = []
        for i, comp_id in enumerate(ordered_competencies):
            comp_data = self.competencies.get(comp_id, {})

            steps.append({
                'stepNumber': i + 1,
                'competencyId': comp_id,
                'competencyName': comp_data.get('name', comp_id),
                'description': comp_data.get('description', ''),
                'estimatedHours': competency_hours.get(comp_id, 0),
                'resources': resources_map.get(comp_id, []),
                'prerequisites': comp_data.get('prerequisites', []),
                'status': 'not-started',
                'progress': 0
            })

        # Step 8: Calculate estimated completion date
        weeks_required = total_hours / time_available if time_available > 0 else 0
        estimated_completion = datetime.now() + timedelta(weeks=weeks_required)

        # Build complete path object
        learning_path = {
            'userId': user_id,
            'name': f'Path to {", ".join([self.competencies.get(c, {}).get("name", c) for c in target_competencies[:3]])}',
            'description': f'Personalized learning path covering {len(ordered_competencies)} competencies',
            'status': 'active',
            'progress': 0,
            'steps': steps,
            'milestones': milestones,
            'totalDuration': total_hours,
            'weeklyHours': time_available,
            'estimatedWeeks': weeks_required,
            'estimatedCompletion': estimated_completion.isoformat(),
            'targetCompetencies': target_competencies,
            'gapsIdentified': gaps,
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }

        return {
            'success': True,
            'path': learning_path
        }

    def _expand_with_prerequisites(
        self,
        competencies: List[str],
        current_competencies: Dict[str, int]
    ) -> List[str]:
        """
        Expand competency list to include all prerequisites

        Args:
            competencies: Initial list of competencies
            current_competencies: Current competency scores

        Returns:
            Expanded list including all necessary prerequisites
        """
        required = set()
        visited = set()

        def dfs(comp_id):
            if comp_id in visited:
                return

            visited.add(comp_id)
            comp_data = self.competencies.get(comp_id, {})
            prerequisites = comp_data.get('prerequisites', [])

            for prereq in prerequisites:
                # Only add prerequisite if user hasn't mastered it
                if current_competencies.get(prereq, 0) < 60:
                    dfs(prereq)
                    required.add(prereq)

            required.add(comp_id)

        for comp_id in competencies:
            dfs(comp_id)

        return list(required)


def load_data_from_firestore():
    """
    Load competencies and resources from Firestore
    This is a placeholder - implement actual Firestore queries
    """
    # TODO: Implement Firestore data loading
    pass


# Example usage
if __name__ == '__main__':
    # Sample data for testing
    sample_competencies = {
        'html-css': {
            'name': 'HTML & CSS',
            'estimatedHours': 20,
            'prerequisites': [],
            'resources': []
        },
        'javascript': {
            'name': 'JavaScript',
            'estimatedHours': 40,
            'prerequisites': ['html-css'],
            'resources': []
        },
        'react': {
            'name': 'React',
            'estimatedHours': 50,
            'prerequisites': ['javascript'],
            'resources': []
        }
    }

    generator = LearningPathGenerator(sample_competencies, {})

    result = generator.generate_path(
        user_id='test-user',
        current_competencies={'html-css': 80},
        target_competencies=['react'],
        time_available=10,
        preferences={'preferredResourceTypes': ['video', 'course']}
    )

    print(json.dumps(result, indent=2))
