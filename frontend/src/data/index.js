// Data exports for competency taxonomy and learning resources
import competencyData from './competency-taxonomy.json';
import resourceData from './learning-resources.json';

// Export the full data objects
export const competencies = competencyData;
export const resources = resourceData;

// Export specific parts for convenience
export const { metadata, categories, competencies: competencyList } = competencyData;
export const { resources: resourceList } = resourceData;

// Helper functions
export const getCompetencyById = (id) => {
  return competencyList.find(comp => comp.id === id);
};

export const getCompetenciesByCategory = (categoryId) => {
  return competencyList.filter(comp => comp.category === categoryId);
};

export const getCompetenciesByDifficulty = (difficulty) => {
  return competencyList.filter(comp => comp.difficulty === difficulty);
};

export const getResourcesForCompetency = (competencyId) => {
  return resourceList.filter(res => res.competencies.includes(competencyId));
};

export const getResourcesByPlatform = (platform) => {
  return resourceList.filter(res => res.platform === platform);
};

export const searchCompetencies = (query) => {
  const lowerQuery = query.toLowerCase();
  return competencyList.filter(comp =>
    comp.name.toLowerCase().includes(lowerQuery) ||
    comp.description.toLowerCase().includes(lowerQuery) ||
    comp.keywords.some(keyword => keyword.includes(lowerQuery))
  );
};

// Export all
export default {
  competencies,
  resources,
  metadata,
  categories,
  competencyList,
  resourceList,
  getCompetencyById,
  getCompetenciesByCategory,
  getCompetenciesByDifficulty,
  getResourcesForCompetency,
  getResourcesByPlatform,
  searchCompetencies
};
