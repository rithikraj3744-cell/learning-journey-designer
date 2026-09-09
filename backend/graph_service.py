"""
Knowledge Graph Service
Handles competency relationships and graph data structures for visualization
"""

from firebase_admin import firestore
from datetime import datetime
from typing import Dict, List, Optional
import json

class GraphService:
    """Service for managing competency knowledge graph"""

    def __init__(self, db):
        self.db = db
        self.relationships_collection = 'competency_relationships'
        self.roles_collection = 'roles'
        self.cache = {}
        self.cache_timeout = 300  # 5 minutes

    # ========================================================================
    # RELATIONSHIP TYPES
    # ========================================================================
    PREREQUISITE_OF = 'PREREQUISITE_OF'    # A is prerequisite of B
    RELATED_TO = 'RELATED_TO'              # A is related to B (bidirectional)
    LEADS_TO_ROLE = 'LEADS_TO_ROLE'        # Competency leads to a role
    PART_OF = 'PART_OF'                    # Competency is part of a larger domain

    # ========================================================================
    # RELATIONSHIP CRUD OPERATIONS
    # ========================================================================

    def add_relationship(self, source_id: str, target_id: str,
                        relationship_type: str, strength: float = 1.0,
                        metadata: Dict = None) -> Dict:
        """
        Add a relationship between two competencies or competency-to-role

        Args:
            source_id: ID of source competency
            target_id: ID of target competency or role
            relationship_type: Type of relationship (PREREQUISITE_OF, RELATED_TO, LEADS_TO_ROLE)
            strength: Relationship strength (0.0 to 1.0)
            metadata: Additional metadata (description, weight, etc.)

        Returns:
            Dict with relationship details
        """
        try:
            relationship_data = {
                'source_id': source_id,
                'target_id': target_id,
                'type': relationship_type,
                'strength': strength,
                'metadata': metadata or {},
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }

            # Create unique ID based on source, target, and type
            relationship_id = f"{source_id}_{target_id}_{relationship_type}"

            doc_ref = self.db.collection(self.relationships_collection).document(relationship_id)
            doc_ref.set(relationship_data)

            # If RELATED_TO, create reverse relationship automatically
            if relationship_type == self.RELATED_TO:
                reverse_id = f"{target_id}_{source_id}_{relationship_type}"
                reverse_data = relationship_data.copy()
                reverse_data['source_id'] = target_id
                reverse_data['target_id'] = source_id
                self.db.collection(self.relationships_collection).document(reverse_id).set(reverse_data)

            # Clear cache
            self._clear_cache()

            return {'success': True, 'relationship_id': relationship_id}

        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_relationships(self, competency_id: str,
                         relationship_type: Optional[str] = None) -> List[Dict]:
        """
        Get all relationships for a competency

        Args:
            competency_id: ID of the competency
            relationship_type: Optional filter by relationship type

        Returns:
            List of relationship dictionaries
        """
        try:
            # Query where competency is the source
            query = self.db.collection(self.relationships_collection)\
                        .where('source_id', '==', competency_id)

            if relationship_type:
                query = query.where('type', '==', relationship_type)

            docs = query.stream()
            relationships = []

            for doc in docs:
                rel_data = doc.to_dict()
                rel_data['id'] = doc.id
                relationships.append(rel_data)

            return relationships

        except Exception as e:
            print(f"Error getting relationships: {e}")
            return []

    def delete_relationship(self, relationship_id: str) -> Dict:
        """Delete a relationship"""
        try:
            self.db.collection(self.relationships_collection).document(relationship_id).delete()
            self._clear_cache()
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    # ========================================================================
    # GRAPH BUILDING
    # ========================================================================

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
            # Check cache
            cache_key = f"graph_{','.join(sorted(competency_ids or []))}"
            if cache_key in self.cache:
                return self.cache[cache_key]

            nodes = []
            edges = []
            node_ids = set()

            # Get all relationships first to determine which competencies to show
            relationships_ref = self.db.collection(self.relationships_collection)
            all_relationships = [
                {**doc.to_dict(), 'id': doc.id}
                for doc in relationships_ref.stream()
            ]

            # Find all competencies that have relationships
            competencies_with_relationships = set()
            for rel in all_relationships:
                if rel.get('type') != self.LEADS_TO_ROLE:
                    competencies_with_relationships.add(rel.get('source_id'))
                    competencies_with_relationships.add(rel.get('target_id'))
                else:
                    competencies_with_relationships.add(rel.get('source_id'))

            # Get competencies
            competencies_ref = self.db.collection('competencies')
            if competency_ids:
                # Filter specific competencies
                competencies = []
                for comp_id in competency_ids:
                    doc = competencies_ref.document(comp_id).get()
                    if doc.exists:
                        comp_data = doc.to_dict()
                        comp_data['id'] = doc.id
                        competencies.append(comp_data)
            else:
                # Only get competencies that have relationships
                competencies = []
                for comp_id in competencies_with_relationships:
                    doc = competencies_ref.document(comp_id).get()
                    if doc.exists:
                        comp_data = doc.to_dict()
                        comp_data['id'] = doc.id
                        competencies.append(comp_data)

            # Build competency nodes
            for comp in competencies:
                node = {
                    'id': comp['id'],
                    'label': comp.get('name', comp['id']),
                    'type': 'competency',
                    'category': comp.get('category', 'general'),
                    'level': comp.get('level', 1),
                    'description': comp.get('description', ''),
                    'importance': comp.get('importance', 0.5)
                }
                nodes.append(node)
                node_ids.add(comp['id'])

            # Get all relationships
            relationships_ref = self.db.collection(self.relationships_collection)
            all_relationships = [
                {**doc.to_dict(), 'id': doc.id}
                for doc in relationships_ref.stream()
            ]

            # Filter relationships to include only nodes in our graph
            for rel in all_relationships:
                source_id = rel.get('source_id')
                target_id = rel.get('target_id')
                rel_type = rel.get('type')

                # Skip if nodes not in our set (unless it's a role and we want roles)
                if source_id not in node_ids:
                    continue

                if rel_type == self.LEADS_TO_ROLE and include_roles:
                    # Add role node if not exists
                    if target_id not in node_ids:
                        role_doc = self.db.collection(self.roles_collection).document(target_id).get()
                        if role_doc.exists:
                            role_data = role_doc.to_dict()
                            nodes.append({
                                'id': target_id,
                                'label': role_data.get('name', target_id),
                                'type': 'role',
                                'category': 'career',
                                'description': role_data.get('description', ''),
                                'salary_range': role_data.get('salary_range', '')
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

            result = {
                'nodes': nodes,
                'edges': edges,
                'metadata': {
                    'node_count': len(nodes),
                    'edge_count': len(edges),
                    'generated_at': datetime.now().isoformat()
                }
            }

            # Cache result
            self.cache[cache_key] = result

            return result

        except Exception as e:
            print(f"Error building graph: {e}")
            return {'nodes': [], 'edges': [], 'metadata': {}, 'error': str(e)}

    def get_competency_graph(self, competency_id: str, depth: int = 2) -> Dict:
        """
        Get graph centered around a specific competency up to certain depth

        Args:
            competency_id: Center competency ID
            depth: How many levels deep to traverse

        Returns:
            Graph data structure
        """
        try:
            visited = set()
            competency_ids = set()

            def traverse(node_id, current_depth):
                if current_depth > depth or node_id in visited:
                    return

                visited.add(node_id)
                competency_ids.add(node_id)

                # Get outgoing relationships
                relationships = self.get_relationships(node_id)

                for rel in relationships:
                    target = rel['target_id']
                    if rel['type'] != self.LEADS_TO_ROLE:  # Don't traverse into roles
                        traverse(target, current_depth + 1)

                # Get incoming relationships (where this is target)
                incoming_query = self.db.collection(self.relationships_collection)\
                                    .where('target_id', '==', node_id)
                for doc in incoming_query.stream():
                    rel = doc.to_dict()
                    source = rel['source_id']
                    if rel['type'] != self.LEADS_TO_ROLE:
                        traverse(source, current_depth + 1)

            traverse(competency_id, 0)

            return self.build_graph_data(
                competency_ids=list(competency_ids),
                include_roles=True
            )

        except Exception as e:
            print(f"Error getting competency graph: {e}")
            return {'nodes': [], 'edges': [], 'error': str(e)}

    # ========================================================================
    # ROLE & PATH FINDING
    # ========================================================================

    def get_role_requirements(self, role_id: str) -> Dict:
        """Get all competencies required for a role"""
        try:
            # Get all relationships where type is LEADS_TO_ROLE and target is role
            query = self.db.collection(self.relationships_collection)\
                        .where('target_id', '==', role_id)\
                        .where('type', '==', self.LEADS_TO_ROLE)

            competency_ids = []
            for doc in query.stream():
                rel = doc.to_dict()
                competency_ids.append(rel['source_id'])

            # Get competency details
            competencies = []
            for comp_id in competency_ids:
                comp_doc = self.db.collection('competencies').document(comp_id).get()
                if comp_doc.exists:
                    comp_data = comp_doc.to_dict()
                    comp_data['id'] = comp_id
                    competencies.append(comp_data)

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
        """
        Find optimal learning path from user's current competencies to target role

        Args:
            role_id: Target role ID
            user_competencies: Dict of competency_id -> proficiency_level

        Returns:
            Structured learning path with prerequisites
        """
        try:
            # Get required competencies for role
            role_reqs = self.get_role_requirements(role_id)
            required_comps = role_reqs['competencies']

            # Identify gaps
            gaps = []
            for comp in required_comps:
                comp_id = comp['id']
                current_level = user_competencies.get(comp_id, 0)
                required_level = comp.get('required_level', 3)  # Default to intermediate

                if current_level < required_level:
                    gaps.append({
                        'competency_id': comp_id,
                        'competency_name': comp.get('name'),
                        'current_level': current_level,
                        'required_level': required_level,
                        'gap': required_level - current_level
                    })

            # Sort gaps by prerequisites (competencies with fewer prerequisites first)
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
        # Build prerequisite map
        prereq_map = {}
        for gap in gaps:
            comp_id = gap['competency_id']
            prereqs = self.get_relationships(comp_id, self.PREREQUISITE_OF)
            prereq_map[comp_id] = [r['target_id'] for r in prereqs]

        # Topological sort
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

    # ========================================================================
    # ROLE MANAGEMENT
    # ========================================================================

    def add_role(self, role_id: str, name: str, description: str,
                 metadata: Dict = None) -> Dict:
        """Add a role definition"""
        try:
            role_data = {
                'name': name,
                'description': description,
                'metadata': metadata or {},
                'created_at': datetime.now().isoformat()
            }

            self.db.collection(self.roles_collection).document(role_id).set(role_data)
            return {'success': True, 'role_id': role_id}

        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_all_roles(self) -> List[Dict]:
        """Get all available roles"""
        try:
            roles = []
            for doc in self.db.collection(self.roles_collection).stream():
                role_data = doc.to_dict()
                role_data['id'] = doc.id
                roles.append(role_data)
            return roles
        except Exception as e:
            print(f"Error getting roles: {e}")
            return []

    # ========================================================================
    # UTILITIES
    # ========================================================================

    def _get_edge_label(self, relationship_type: str) -> str:
        """Get human-readable label for edge type"""
        labels = {
            self.PREREQUISITE_OF: 'prerequisite of',
            self.RELATED_TO: 'related to',
            self.LEADS_TO_ROLE: 'leads to',
            self.PART_OF: 'part of'
        }
        return labels.get(relationship_type, relationship_type)

    def _clear_cache(self):
        """Clear the graph cache"""
        self.cache = {}

    def get_statistics(self) -> Dict:
        """Get graph statistics"""
        try:
            comp_count = len(list(self.db.collection('competencies').stream()))
            rel_count = len(list(self.db.collection(self.relationships_collection).stream()))
            role_count = len(list(self.db.collection(self.roles_collection).stream()))

            return {
                'competencies': comp_count,
                'relationships': rel_count,
                'roles': role_count
            }
        except Exception as e:
            return {'error': str(e)}
