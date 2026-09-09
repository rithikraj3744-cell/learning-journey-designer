// Progress Indicator Component
const ProgressIndicator = ({
  progress = 0,
  label = '',
  showPercentage = true,
  size = 'md',
  color = 'blue',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600 dark:bg-blue-500',
    green: 'bg-green-600 dark:bg-green-500',
    purple: 'bg-purple-600 dark:bg-purple-500',
    orange: 'bg-orange-600 dark:bg-orange-500',
    red: 'bg-red-600 dark:bg-red-500'
  };

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {progress}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

// Circular Progress Component
export const CircularProgress = ({
  progress = 0,
  size = 80,
  strokeWidth = 8,
  color = 'blue',
  showPercentage = true,
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    blue: 'stroke-blue-600 dark:stroke-blue-500',
    green: 'stroke-green-600 dark:stroke-green-500',
    purple: 'stroke-purple-600 dark:stroke-purple-500',
    orange: 'stroke-orange-600 dark:stroke-orange-500'
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-500 ease-out ${colorClasses[color]}`}
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-sm font-semibold text-gray-700 dark:text-gray-300">
          {progress}%
        </span>
      )}
    </div>
  );
};

export default ProgressIndicator;
