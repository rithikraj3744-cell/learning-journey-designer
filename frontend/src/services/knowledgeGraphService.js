// Knowledge Graph Service - Manages competency relationships and graph data

// Relationship types
export const RelationshipType = {
  PREREQUISITE_OF: 'PREREQUISITE_OF',    // A is required before B
  RELATED_TO: 'RELATED_TO',              // A and B are related concepts
  LEADS_TO_ROLE: 'LEADS_TO_ROLE',        // A leads to a specific role
  PART_OF: 'PART_OF'                     // A is part of larger topic B
};

// Career paths and roles
export const CareerRoles = {
  FULL_STACK: {
    id: 'full-stack-developer',
    name: 'Full Stack Developer',
    requiredCompetencies: ['react', 'node', 'databases', 'api-design', 'html-css', 'javascript']
  },
  DATA_SCIENTIST: {
    id: 'data-scientist',
    name: 'Data Scientist',
    requiredCompetencies: ['python', 'machine-learning', 'statistics', 'data-analysis', 'sql']
  },
  FRONTEND: {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    requiredCompetencies: ['react', 'html-css', 'javascript', 'ui-ux', 'responsive-design']
  },
  BACKEND: {
    id: 'backend-developer',
    name: 'Backend Developer',
    requiredCompetencies: ['node', 'databases', 'api-design', 'authentication', 'server-architecture']
  },
  ML_ENGINEER: {
    id: 'ml-engineer',
    name: 'ML Engineer',
    requiredCompetencies: ['python', 'machine-learning', 'deep-learning', 'tensorflow', 'data-engineering']
  }
};

// Mock competency relationships
export const competencyRelationships = [
  // Frontend Path
  { from: 'html-css', to: 'javascript', type: RelationshipType.PREREQUISITE_OF },
  { from: 'javascript', to: 'react', type: RelationshipType.PREREQUISITE_OF },
  { from: 'react', to: 'react-advanced', type: RelationshipType.PREREQUISITE_OF },
  { from: 'html-css', to: 'responsive-design', type: RelationshipType.RELATED_TO },
  { from: 'react', to: 'ui-ux', type: RelationshipType.RELATED_TO },

  // Backend Path
  { from: 'javascript', to: 'node', type: RelationshipType.PREREQUISITE_OF },
  { from: 'node', to: 'express', type: RelationshipType.PREREQUISITE_OF },
  { from: 'node', to: 'api-design', type: RelationshipType.RELATED_TO },
  { from: 'sql', to: 'databases', type: RelationshipType.PREREQUISITE_OF },
  { from: 'databases', to: 'database-design', type: RelationshipType.PREREQUISITE_OF },

  // Full Stack Connections
  { from: 'react', to: 'node', type: RelationshipType.RELATED_TO },
  { from: 'api-design', to: 'react', type: RelationshipType.RELATED_TO },

  // Data Science Path
  { from: 'python', to: 'data-analysis', type: RelationshipType.PREREQUISITE_OF },
  { from: 'statistics', to: 'data-analysis', type: RelationshipType.PREREQUISITE_OF },
  { from: 'data-analysis', to: 'machine-learning', type: RelationshipType.PREREQUISITE_OF },
  { from: 'machine-learning', to: 'deep-learning', type: RelationshipType.PREREQUISITE_OF },
  { from: 'python', to: 'sql', type: RelationshipType.RELATED_TO },

  // Role Connections
  { from: 'react', to: CareerRoles.FULL_STACK.id, type: RelationshipType.LEADS_TO_ROLE },
  { from: 'node', to: CareerRoles.FULL_STACK.id, type: RelationshipType.LEADS_TO_ROLE },
  { from: 'databases', to: CareerRoles.FULL_STACK.id, type: RelationshipType.LEADS_TO_ROLE },
  { from: 'machine-learning', to: CareerRoles.DATA_SCIENTIST.id, type: RelationshipType.LEADS_TO_ROLE },
  { from: 'react', to: CareerRoles.FRONTEND.id, type: RelationshipType.LEADS_TO_ROLE },
  { from: 'node', to: CareerRoles.BACKEND.id, type: RelationshipType.LEADS_TO_ROLE }
];

// Mock competencies for graph
export const graphCompetencies = [
  { id: 'html-css', name: 'HTML & CSS', category: 'frontend', level: 1, color: '#3B82F6' },
  { id: 'javascript', name: 'JavaScript', category: 'programming', level: 1, color: '#F59E0B' },
  { id: 'react', name: 'React', category: 'frontend', level: 2, color: '#3B82F6' },
  { id: 'react-advanced', name: 'Advanced React', category: 'frontend', level: 3, color: '#3B82F6' },
  { id: 'responsive-design', name: 'Responsive Design', category: 'frontend', level: 2, color: '#3B82F6' },
  { id: 'ui-ux', name: 'UI/UX Design', category: 'design', level: 2, color: '#EC4899' },

  { id: 'node', name: 'Node.js', category: 'backend', level: 2, color: '#10B981' },
  { id: 'express', name: 'Express.js', category: 'backend', level: 3, color: '#10B981' },
  { id: 'api-design', name: 'API Design', category: 'backend', level: 2, color: '#10B981' },
  { id: 'sql', name: 'SQL', category: 'database', level: 1, color: '#8B5CF6' },
  { id: 'databases', name: 'Databases', category: 'database', level: 2, color: '#8B5CF6' },
  { id: 'database-design', name: 'Database Design', category: 'database', level: 3, color: '#8B5CF6' },

  { id: 'python', name: 'Python', category: 'programming', level: 1, color: '#F59E0B' },
  { id: 'statistics', name: 'Statistics', category: 'data-science', level: 1, color: '#EF4444' },
  { id: 'data-analysis', name: 'Data Analysis', category: 'data-science', level: 2, color: '#EF4444' },
  { id: 'machine-learning', name: 'Machine Learning', category: 'data-science', level: 3, color: '#EF4444' },
  { id: 'deep-learning', name: 'Deep Learning', category: 'data-science', level: 4, color: '#EF4444' },

  // Roles as special nodes
  { id: CareerRoles.FULL_STACK.id, name: CareerRoles.FULL_STACK.name, category: 'role', level: 5, color: '#6366F1' },
  { id: CareerRoles.DATA_SCIENTIST.id, name: CareerRoles.DATA_SCIENTIST.name, category: 'role', level: 5, color: '#6366F1' },
  { id: CareerRoles.FRONTEND.id, name: CareerRoles.FRONTEND.name, category: 'role', level: 5, color: '#6366F1' },
  { id: CareerRoles.BACKEND.id, name: CareerRoles.BACKEND.name, category: 'role', level: 5, color: '#6366F1' }
];

class KnowledgeGraphService {
  /**
   * Get all relationships for a competency
   */
  getCompetencyRelationships(competencyId) {
    return competencyRelationships.filter(
      rel => rel.from === competencyId || rel.to === competencyId
    );
  }

  /**
   * Get prerequisites for a competency
   */
  getPrerequisites(competencyId) {
    return competencyRelationships
      .filter(rel => rel.to === competencyId && rel.type === RelationshipType.PREREQUISITE_OF)
      .map(rel => rel.from);
  }

  /**
   * Get what a competency leads to
   */
  getLeadsTo(competencyId) {
    return competencyRelationships
      .filter(rel => rel.from === competencyId && rel.type === RelationshipType.PREREQUISITE_OF)
      .map(rel => rel.to);
  }

  /**
   * Get related competencies
   */
  getRelated(competencyId) {
    return competencyRelationships
      .filter(rel =>
        (rel.from === competencyId || rel.to === competencyId) &&
        rel.type === RelationshipType.RELATED_TO
      )
      .map(rel => rel.from === competencyId ? rel.to : rel.from);
  }

  /**
   * Get learning path to a role
   */
  getPathToRole(roleId, userCompletedCompetencies = []) {
    const role = Object.values(CareerRoles).find(r => r.id === roleId);
    if (!role) return null;

    const required = role.requiredCompetencies;
    const completed = userCompletedCompetencies.filter(c => required.includes(c));
    const remaining = required.filter(c => !userCompletedCompetencies.includes(c));

    // Get prerequisites for remaining competencies
    const allNeeded = new Set(remaining);
    remaining.forEach(comp => {
      this.getAllPrerequisites(comp).forEach(pre => allNeeded.add(pre));
    });

    return {
      role,
      required,
      completed,
      remaining: Array.from(allNeeded),
      progress: Math.round((completed.length / required.length) * 100)
    };
  }

  /**
   * Get all prerequisites recursively
   */
  getAllPrerequisites(competencyId, visited = new Set()) {
    if (visited.has(competencyId)) return [];
    visited.add(competencyId);

    const direct = this.getPrerequisites(competencyId);
    const all = [...direct];

    direct.forEach(pre => {
      const nested = this.getAllPrerequisites(pre, visited);
      all.push(...nested);
    });

    return [...new Set(all)];
  }

  /**
   * Build graph data for visualization
   */
  buildGraphData(focusCompetencyId = null, roleId = null) {
    let nodes = [...graphCompetencies];
    let links = [...competencyRelationships];

    // Filter by focus competency if specified
    if (focusCompetencyId) {
      const related = this.getCompetencyRelationships(focusCompetencyId);
      const relatedIds = new Set([focusCompetencyId]);
      related.forEach(rel => {
        relatedIds.add(rel.from);
        relatedIds.add(rel.to);
      });

      nodes = nodes.filter(n => relatedIds.has(n.id));
      links = related;
    }

    // Filter by role if specified
    if (roleId) {
      const pathData = this.getPathToRole(roleId);
      if (pathData) {
        const relevantIds = new Set([
          ...pathData.required,
          ...pathData.remaining,
          roleId
        ]);

        nodes = nodes.filter(n => relevantIds.has(n.id));
        links = links.filter(l => relevantIds.has(l.from) && relevantIds.has(l.to));
      }
    }

    // Transform for visualization library
    return {
      nodes: nodes.map(n => ({
        id: n.id,
        name: n.name,
        category: n.category,
        level: n.level,
        color: n.color,
        size: n.category === 'role' ? 20 : 10 + (n.level * 2)
      })),
      links: links.map(l => ({
        source: l.from,
        target: l.to,
        type: l.type,
        color: this.getLinkColor(l.type)
      }))
    };
  }

  /**
   * Get link color based on relationship type
   */
  getLinkColor(type) {
    switch (type) {
      case RelationshipType.PREREQUISITE_OF:
        return '#3B82F6'; // Blue
      case RelationshipType.RELATED_TO:
        return '#10B981'; // Green
      case RelationshipType.LEADS_TO_ROLE:
        return '#F59E0B'; // Amber
      case RelationshipType.PART_OF:
        return '#8B5CF6'; // Purple
      default:
        return '#6B7280'; // Gray
    }
  }

  /**
   * Get shortest path between two competencies
   */
  getShortestPath(fromId, toId) {
    // Simple BFS implementation
    const queue = [[fromId]];
    const visited = new Set([fromId]);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current === toId) {
        return path;
      }

      const neighbors = this.getLeadsTo(current);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }

    return null; // No path found
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();
export default knowledgeGraphService;
