const LoadingSkeleton = ({ type = 'grid' }) => {
  if (type === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Title */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>

            {/* Subcategory */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>

            {/* Meta badges */}
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
            </div>

            {/* Keywords */}
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-18"></div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Grid skeleton
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse">
      <div className="space-y-4">
        {/* Title */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>

        {/* Subcategory */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
        </div>

        {/* Prerequisites text */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-18"></div>
        </div>

        {/* Button */}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
