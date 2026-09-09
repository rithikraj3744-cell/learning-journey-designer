"""
Local Knowledge Graph Service (No Firebase Required)
Works with in-memory data structures for competencies and relationships
"""

from datetime import datetime
from typing import Dict, List, Optional


class LocalGraphService:
    """Service for managing competency knowledge graph without Firebase"""

    # Relationship types
    PREREQUISITE_OF = 'PREREQUISITE_OF'
    RELATED_TO = 'RELATED_TO'
    LEADS_TO_ROLE = 'LEADS_TO_ROLE'
    PART_OF = 'PART_OF'

    def __init__(self, competencies: Dict, roles: Dict = None):
        """
        Initialize with competency and role data

        Args:
            competencies: Dict of competency_id -> competency_data
            roles: Dict of role_id -> role_data
        """
        self.competencies = competencies
        self.roles = roles or {}
        self.relationships = {}  # Will store relationship_id -> relationship_data
        self._initialize_sample_relationships()

    def _initialize_sample_relationships(self):
        """Create sample relationships for demonstration"""
        # This creates a simple graph structure based on competency data
        # In a real app, this would be loaded from a JSON file or database

        sample_relationships = [
            # Programming fundamentals
            {'source': 'python-basics', 'target': 'python-advanced', 'type': self.PREREQUISITE_OF, 'strength': 0.9},
            {'source': 'javascript-basics', 'target': 'react', 'type': self.PREREQUISITE_OF, 'strength': 0.9},
            {'source': 'javascript-basics', 'target': 'node-js', 'type': self.PREREQUISITE_OF, 'strength': 0.8},

            # Web development
            {'source': 'html-css', 'target': 'javascript-basics', 'type': self.PREREQUISITE_OF, 'strength': 0.7},
            {'source': 'react', 'target': 'next-js', 'type': self.PREREQUISITE_OF, 'strength': 0.8},

            # Related competencies
            {'source': 'python-basics', 'target': 'data-structures', 'type': self.RELATED_TO, 'strength': 0.7},
            {'source': 'sql', 'target': 'database-design', 'type': self.RELATED_TO, 'strength': 0.8},
        ]

        # Sample roles
        sample_roles = [
            {'id': 'full-stack-developer', 'name': 'Full Stack Developer',
             'description': 'Develops both frontend and backend of web applications'},
            {'id': 'data-scientist', 'name': 'Data Scientist',
             'description': 'Analyzes and interprets complex data'},
            {'id': 'frontend-developer', 'name': 'Frontend Developer',
             'description': 'Specializes in user interface development'},
        ]

        # Store sample roles if not provided
        if not self.roles:
            for role in sample_roles:
                self.roles[role['id']] = role

        # Add relationships
        for rel in sample_relationships:
            rel_id = f"{rel['source']}_{rel['target']}_{rel['type']}"
            self.relationships[rel_id] = {
                'id': rel_id,
                'source_id': rel['source'],
                'target_id': rel['target'],
                'type': rel['type'],
                'strength': rel['strength'],
                'metadata': {},
                'created_at': datetime.now().isoformat()
            }

    def build_graph_data(self, competency_ids: Optional[List[str]] = None,
                        include_roles: bool = True) -> Dict:
        """
        Build graph data structure for visualization

        Args:
            competency_ids: Optional list to filter specific competencies
            include_roles: Whether to include role nodes

        Returns:
            Dict with nodes and edges for graph visualization
        """
        try:
            nodes = []
            edges = []
            node_ids = set()

            # Determine which competencies to include
            if competency_ids:
                comp_list = {cid: self.competencies[cid] for cid in competency_ids if cid in self.competencies}
            else:
                # Include all competencies that have relationships
                competencies_with_relationships = set()
                for rel in self.relationships.values():
                    if rel['type'] != self.LEADS_TO_ROLE:
                        competencies_with_relationships.add(rel['source_id'])
                        competencies_with_relationships.add(rel['target_id'])
                    else:
                        competencies_with_relationships.add(rel['source_id'])

                comp_list = {cid: self.competencies[cid] for cid in competencies_with_relationships
                            if cid in self.competencies}

            # Build competency nodes
            for comp_id, comp in comp_list.items():
                node = {
                    'id': comp_id,
                    'label': comp.get('name', comp_id),
                    'type': 'competency',
                    'category': comp.get('category', 'general'),
                    'level': comp.get('level', 1),
                    'description': comp.get('description', ''),
                    'importance': comp.get('importance', 0.5)
                }
                nodes.append(node)
                node_ids.add(comp_id)

            # Build edges from relationships
            for rel in self.relationships.values():
                source_id = rel['source_id']
                target_id = rel['target_id']
                rel_type = rel['type']

                # Skip if source not in our node set
                if source_id not in node_ids:
                    continue

                # Handle role relationships
                if rel_type == self.LEADS_TO_ROLE and include_roles:
                    if target_id not in node_ids and target_id in self.roles:
                        role = self.roles[target_id]
                        nodes.append({
                            'id': target_id,
                            'label': role.get('name', target_id),
                            'type': 'role',
                            'category': 'career',
                            'description': role.get('description', ''),
                            'salary_range': role.get('salary_range', '')
                        })
                        node_ids.add(target_id)
                elif target_id not in node_ids:
                    continue

                # Create edge
                edge = {
                    'id': rel['id'],
                    'source': source_id,
                    'target': target_id,
                    'type': rel_type,
                    'strength': rel.get('strength', 1.0),
                    'label': self._get_edge_label(rel_type)
                }
                edges.append(edge)

            return {
                'nodes': nodes,
                'edges': edges,
                'metadata': {
                    'node_count': len(nodes),
                    'edge_count': len(edges),
                    'generated_at': datetime.now().isoformat()
                }
            }

        except Exception as e:
            print(f"Error building graph: {e}")
            return {'nodes': [], 'edges': [], 'metadata': {}, 'error': str(e)}

    def get_competency_graph(self, competency_id: str, depth: int = 2) -> Dict:
        """Get graph centered around a specific competency"""
        try:
            visited = set()
            competency_ids = set()

            def traverse(node_id, current_depth):
                if current_depth > depth or node_id in visited or node_id not in self.competencies:
                    return

                visited.add(node_id)
                competency_ids.add(node_id)

                # Get relationships where this is source or target
                for rel in self.relationships.values():
                    if rel['source_id'] == node_id and rel['type'] != self.LEADS_TO_ROLE:
                        traverse(rel['target_id'], current_depth + 1)
                    elif rel['target_id'] == node_id and rel['type'] != self.LEADS_TO_ROLE:
                        traverse(rel['source_id'], current_depth + 1)

            traverse(competency_id, 0)

            return self.build_graph_data(
                competency_ids=list(competency_ids),
                include_roles=True
            )

        except Exception as e:
            print(f"Error getting competency graph: {e}")
            return {'nodes': [], 'edges': [], 'error': str(e)}

    def get_relationships(self, competency_id: str,
                         relationship_type: Optional[str] = None) -> List[Dict]:
        """Get all relationships for a competency"""
        try:
            relationships = []
            for rel in self.relationships.values():
                if rel['source_id'] == competency_id:
                    if relationship_type is None or rel['type'] == relationship_type:
                        relationships.append(rel)
            return relationships

        except Exception as e:
            print(f"Error getting relationships: {e}")
            return []

    def get_all_roles(self) -> List[Dict]:
        """Get all available roles"""
        return [{'id': rid, **role} for rid, role in self.roles.items()]

    def get_role_requirements(self, role_id: str) -> Dict:
        """Get all competencies required for a role"""
        try:
            competency_ids = []
            for rel in self.relationships.values():
                if rel['target_id'] == role_id and rel['type'] == self.LEADS_TO_ROLE:
                    competency_ids.append(rel['source_id'])

            competencies = []
            for comp_id in competency_ids:
                if comp_id in self.competencies:
                    comp = self.competencies[comp_id].copy()
                    comp['id'] = comp_id
                    competencies.append(comp)

            return {
                'role_id': role_id,
                'competencies': competencies,
                'count': len(competencies)
            }

        except Exception as e:
            print(f"Error getting role requirements: {e}")
            return {'competencies': [], 'error': str(e)}

    def find_learning_path_to_role(self, role_id: str,
                                   user_competencies: Dict[str, float]) -> Dict:
        """Find learning path from user's current competencies to target role"""
        try:
            role_reqs = self.get_role_requirements(role_id)
            required_comps = role_reqs['competencies']

            # Identify gaps
            gaps = []
            for comp in required_comps:
                comp_id = comp['id']
                current_level = user_competencies.get(comp_id, 0)
                required_level = comp.get('required_level', 3)

                if current_level < required_level:
                    gaps.append({
                        'competency_id': comp_id,
                        'competency_name': comp.get('name'),
                        'current_level': current_level,
                        'required_level': required_level,
                        'gap': required_level - current_level
                    })

            # Sort gaps by prerequisites
            sorted_gaps = self._sort_by_prerequisites(gaps)

            return {
                'role_id': role_id,
                'gaps': sorted_gaps,
                'total_gaps': len(gaps),
                'graph_data': self.build_graph_data(
                    competency_ids=[g['competency_id'] for g in gaps],
                    include_roles=True
                )
            }

        except Exception as e:
            print(f"Error finding learning path: {e}")
            return {'gaps': [], 'error': str(e)}

    def _sort_by_prerequisites(self, gaps: List[Dict]) -> List[Dict]:
        """Sort competency gaps by prerequisite order"""
        prereq_map = {}
        for gap in gaps:
            comp_id = gap['competency_id']
            prereqs = self.get_relationships(comp_id, self.PREREQUISITE_OF)
            prereq_map[comp_id] = [r['target_id'] for r in prereqs]

        sorted_gaps = []
        visited = set()

        def visit(gap):
            comp_id = gap['competency_id']
            if comp_id in visited:
                return

            # Visit prerequisites first
            for prereq_id in prereq_map.get(comp_id, []):
                prereq_gap = next((g for g in gaps if g['competency_id'] == prereq_id), None)
                if prereq_gap:
                    visit(prereq_gap)

            visited.add(comp_id)
            sorted_gaps.append(gap)

        for gap in gaps:
            visit(gap)

        return sorted_gaps

    def get_statistics(self) -> Dict:
        """Get graph statistics"""
        return {
            'competencies': len(self.competencies),
            'relationships': len(self.relationships),
            'roles': len(self.roles)
        }

    def _get_edge_label(self, relationship_type: str) -> str:
        """Get human-readable label for edge type"""
        labels = {
            self.PREREQUISITE_OF: 'prerequisite of',
            self.RELATED_TO: 'related to',
            self.LEADS_TO_ROLE: 'leads to',
            self.PART_OF: 'part of'
        }
        return labels.get(relationship_type, relationship_type)

    def add_relationship(self, source_id: str, target_id: str,
                        relationship_type: str, strength: float = 1.0,
                        metadata: Dict = None) -> Dict:
        """Add a new relationship"""
        try:
            relationship_id = f"{source_id}_{target_id}_{relationship_type}"

            self.relationships[relationship_id] = {
                'id': relationship_id,
                'source_id': source_id,
                'target_id': target_id,
                'type': relationship_type,
                'strength': strength,
                'metadata': metadata or {},
                'created_at': datetime.now().isoformat()
            }

            # If RELATED_TO, create reverse relationship
            if relationship_type == self.RELATED_TO:
                reverse_id = f"{target_id}_{source_id}_{relationship_type}"
                self.relationships[reverse_id] = {
                    'id': reverse_id,
                    'source_id': target_id,
                    'target_id': source_id,
                    'type': relationship_type,
                    'strength': strength,
                    'metadata': metadata or {},
                    'created_at': datetime.now().isoformat()
                }

            return {'success': True, 'relationship_id': relationship_id}

        except Exception as e:
            return {'success': False, 'error': str(e)}

    def delete_relationship(self, relationship_id: str) -> Dict:
        """Delete a relationship"""
        try:
            if relationship_id in self.relationships:
                del self.relationships[relationship_id]
                return {'success': True}
            return {'success': False, 'error': 'Relationship not found'}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def add_role(self, role_id: str, name: str, description: str,
                 metadata: Dict = None) -> Dict:
        """Add a new role"""
        try:
            self.roles[role_id] = {
                'name': name,
                'description': description,
                'metadata': metadata or {},
                'created_at': datetime.now().isoformat()
            }
            return {'success': True, 'role_id': role_id}

        except Exception as e:
            return {'success': False, 'error': str(e)}
