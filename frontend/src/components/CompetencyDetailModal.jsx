import { useState } from 'react';
import {
  X,
  Clock,
  BarChart3,
  BookOpen,
  Users,
  Plus,
  ChevronRight,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import PrerequisiteTree from './PrerequisiteTree';

const CompetencyDetailModal = ({ competency, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPrerequisiteTree, setShowPrerequisiteTree] = useState(false);
  const [addedToPath, setAddedToPath] = useState(false);

  if (!competency) return null;

  const difficultyConfig = {
    1: { label: 'Beginner', color: 'green', description: 'No prior experience required' },
    2: { label: 'Intermediate', color: 'blue', description: 'Some foundational knowledge needed' },
    3: { label: 'Advanced', color: 'orange', description: 'Strong foundation required' },
    4: { label: 'Expert', color: 'red', description: 'Extensive experience required' }
  };

  const difficulty = difficultyConfig[competency.difficulty] || difficultyConfig[1];

  const handleAddToLearningPath = () => {
    // TODO: Implement add to learning path functionality
    setAddedToPath(true);
    setTimeout(() => setAddedToPath(false), 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'prerequisites', label: 'Prerequisites' },
    { id: 'resources', label: 'Resources' },
    { id: 'related', label: 'Related Skills' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {competency.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {competency.subcategory || competency.category}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3 mt-4">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-${difficulty.color}-100 dark:bg-${difficulty.color}-900/20 text-${difficulty.color}-700 dark:text-${difficulty.color}-300`}>
                <BarChart3 className="h-4 w-4" />
                {difficulty.label}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                <Clock className="h-4 w-4" />
                {competency.estimatedHours || 0}h
              </span>
              {competency.prerequisites && competency.prerequisites.length > 0 && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                  <BookOpen className="h-4 w-4" />
                  {competency.prerequisites.length} Prerequisites
                </span>
              )}
              {competency.relatedSkills && competency.relatedSkills.length > 0 && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <Users className="h-4 w-4" />
                  {competency.relatedSkills.length} Related
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-4 border-b border-gray-200 dark:border-gray-700 -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-280px)]">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {competency.description}
                  </p>
                </div>

                {/* Difficulty Info */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Difficulty Level: {difficulty.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {difficulty.description}
                  </p>
                </div>

                {/* Keywords */}
                {competency.keywords && competency.keywords.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Key Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {competency.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Outcomes */}
                {competency.learningOutcomes && competency.learningOutcomes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      What You'll Learn
                    </h3>
                    <ul className="space-y-2">
                      {competency.learningOutcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Prerequisites Tab */}
            {activeTab === 'prerequisites' && (
              <div className="space-y-6">
                {competency.prerequisites && competency.prerequisites.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Required Prerequisites
                      </h3>
                      <button
                        onClick={() => setShowPrerequisiteTree(!showPrerequisiteTree)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {showPrerequisiteTree ? 'Hide Tree View' : 'Show Tree View'}
                      </button>
                    </div>

                    {showPrerequisiteTree && (
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <PrerequisiteTree competencyId={competency.id} />
                      </div>
                    )}

                    <div className="space-y-3">
                      {competency.prerequisites.map((prereqId, idx) => (
                        <PrerequisiteItem
                          key={idx}
                          prerequisiteId={prereqId}
                          index={idx}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No prerequisites required for this competency
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                {competency.resources && competency.resources.length > 0 ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Learning Resources ({competency.resources.length})
                    </h3>
                    <div className="space-y-3">
                      {competency.resources.map((resource, idx) => (
                        <ResourceItem key={idx} resource={resource} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No resources mapped yet
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Check back later for curated learning materials
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Related Skills Tab */}
            {activeTab === 'related' && (
              <div className="space-y-6">
                {competency.relatedSkills && competency.relatedSkills.length > 0 ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Related Competencies
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {competency.relatedSkills.map((skillId, idx) => (
                        <RelatedSkillItem key={idx} skillId={skillId} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No related skills found
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Estimated Time: <span className="font-medium text-gray-900 dark:text-white">{competency.estimatedHours || 0} hours</span></p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleAddToLearningPath}
                  disabled={addedToPath}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                    addedToPath
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {addedToPath ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Added to Path
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Add to Learning Path
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Prerequisite Item Component
const PrerequisiteItem = ({ prerequisiteId, index }) => {
  // In production, fetch prerequisite details from Firestore
  const prerequisite = {
    id: prerequisiteId,
    name: `Prerequisite ${index + 1}`,
    description: 'Brief description of this prerequisite',
    difficulty: 2,
    estimatedHours: 10
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold text-sm">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white truncate">
          {prerequisite.name}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {prerequisite.description}
        </p>
      </div>
      <button className="flex-shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

// Resource Item Component
const ResourceItem = ({ resource }) => {
  const resourceTypeIcons = {
    article: '📄',
    video: '🎥',
    course: '🎓',
    book: '📚',
    tutorial: '💡',
    documentation: '📖'
  };

  const icon = resourceTypeIcons[resource.type] || '📄';

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
    >
      <div className="flex-shrink-0 text-3xl">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
          {resource.title}
        </h4>
        {resource.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {resource.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
          <span className="capitalize">{resource.type}</span>
          {resource.duration && <span>• {resource.duration}</span>}
          {resource.difficulty && <span>• {resource.difficulty}</span>}
        </div>
      </div>
      <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0" />
    </a>
  );
};

// Related Skill Item Component
const RelatedSkillItem = ({ skillId }) => {
  // In production, fetch skill details from Firestore
  const skill = {
    id: skillId,
    name: `Related Skill`,
    description: 'Brief description of this related skill',
    difficulty: 2
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer">
      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
        {skill.name}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {skill.description}
      </p>
    </div>
  );
};

export default CompetencyDetailModal;
