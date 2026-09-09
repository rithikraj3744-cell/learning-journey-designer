import { Clock, Target, BookOpen, Star, ExternalLink } from 'lucide-react';

const CompetencyCard = ({
  competency,
  onViewDetails,
  onClick,
  showProgress = false,
  progress = 0,
  className = ''
}) => {
  const difficultyLabels = {
    1: 'Beginner',
    2: 'Basic',
    3: 'Intermediate',
    4: 'Advanced',
    5: 'Expert'
  };

  const difficultyColors = {
    1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    4: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    5: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 dark:border-gray-700 flex flex-col h-full ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {competency.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {competency.subcategory}
          </p>
        </div>
        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
        {competency.description}
      </p>

      {/* Spacer to push content to bottom */}
      <div className="flex-grow"></div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            difficultyColors[competency.difficulty]
          }`}
        >
          Level {competency.difficulty} - {difficultyLabels[competency.difficulty]}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <Clock className="h-3 w-3 mr-1" />
          {competency.estimatedHours}h
        </span>
      </div>

      {/* Prerequisites */}
      {competency.prerequisites && competency.prerequisites.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Prerequisites: {competency.prerequisites.length}
          </p>
        </div>
      )}

      {/* Keywords */}
      {competency.keywords && competency.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {competency.keywords.slice(0, 3).map((keyword, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
            >
              {keyword}
            </span>
          ))}
          {competency.keywords.length > 3 && (
            <span className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400">
              +{competency.keywords.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Progress
            </span>
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => (onClick || onViewDetails)?.(competency)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium text-sm"
      >
        View Details
      </button>
    </div>
  );
};

export default CompetencyCard;
