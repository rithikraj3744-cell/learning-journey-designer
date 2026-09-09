import { Clock, BarChart3, BookOpen, ChevronRight } from 'lucide-react';

const CompetencyListItem = ({ competency, onClick }) => {
  const difficultyConfig = {
    1: { label: 'Beginner', color: 'green' },
    2: { label: 'Intermediate', color: 'blue' },
    3: { label: 'Advanced', color: 'orange' },
    4: { label: 'Expert', color: 'red' }
  };

  const difficulty = difficultyConfig[competency.difficulty] || difficultyConfig[1];

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {competency.name}
            </h3>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {competency.subcategory || competency.category}
          </p>

          <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
            {competency.description}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${difficulty.color}-100 dark:bg-${difficulty.color}-900/20 text-${difficulty.color}-700 dark:text-${difficulty.color}-300`}>
              <BarChart3 className="h-3 w-3" />
              {difficulty.label}
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
              <Clock className="h-3 w-3" />
              {competency.estimatedHours || 0}h
            </span>

            {competency.prerequisites && competency.prerequisites.length > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                <BookOpen className="h-3 w-3" />
                {competency.prerequisites.length} Prerequisites
              </span>
            )}
          </div>

          {/* Keywords */}
          {competency.keywords && competency.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {competency.keywords.slice(0, 5).map((keyword, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                >
                  {keyword}
                </span>
              ))}
              {competency.keywords.length > 5 && (
                <span className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400">
                  +{competency.keywords.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arrow Icon */}
        <div className="flex-shrink-0">
          <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default CompetencyListItem;
