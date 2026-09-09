import { Clock, ExternalLink, Star, Play, BookOpen, Video, FileText } from 'lucide-react';

const ResourceCard = ({
  resource,
  onViewResource,
  showRating = true,
  rating = 0,
  className = ''
}) => {
  const typeIcons = {
    video: Video,
    course: BookOpen,
    interactive: Play,
    documentation: FileText,
    article: FileText
  };

  const typeColors = {
    video: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    course: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    interactive: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    documentation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    article: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };

  const difficultyLabels = {
    1: 'Beginner',
    2: 'Basic',
    3: 'Intermediate',
    4: 'Advanced',
    5: 'Expert'
  };

  const TypeIcon = typeIcons[resource.type] || FileText;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 dark:border-gray-700 flex flex-col h-full ${className}`}
    >
      {/* Header with Platform Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded mb-2">
            {resource.platform}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {resource.title}
          </h3>
        </div>
        <TypeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2" />
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
        {resource.description}
      </p>

      {/* Spacer to push content to bottom */}
      <div className="flex-grow"></div>

      {/* Type and Duration Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
            typeColors[resource.type] || typeColors.article
          }`}
        >
          {resource.type}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          {resource.duration}
        </span>
        {resource.difficulty && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            {difficultyLabels[resource.difficulty]}
          </span>
        )}
      </div>

      {/* Rating */}
      {showRating && rating > 0 && (
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, idx) => (
              <Star
                key={idx}
                className={`h-4 w-4 ${
                  idx < rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {rating.toFixed(1)}
          </span>
        </div>
      )}

      {/* Competencies Count */}
      {resource.competencies && resource.competencies.length > 0 && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
          Covers {resource.competencies.length} competenc{resource.competencies.length === 1 ? 'y' : 'ies'}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onViewResource && onViewResource(resource)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium text-sm"
        >
          View Details
        </button>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Open resource"
        >
          <ExternalLink className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
};

export default ResourceCard;
