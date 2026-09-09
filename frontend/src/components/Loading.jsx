import { Loader2 } from 'lucide-react';

// Full Page Loading
export const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        <p className="text-lg text-gray-700 dark:text-gray-300">{message}</p>
      </div>
    </div>
  );
};

// Inline Loading Spinner
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <Loader2 className={`animate-spin text-blue-600 dark:text-blue-400 ${sizeClasses[size]} ${className}`} />
  );
};

// Loading Overlay
export const LoadingOverlay = ({ message = 'Loading...', show = true }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-lg text-gray-700 dark:text-gray-300">{message}</p>
      </div>
    </div>
  );
};

// Card Loading Skeleton
export const CardSkeleton = ({ count = 3 }) => {
  return (
    <>
      {[...Array(count)].map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </>
  );
};

// Button Loading State
export const ButtonLoading = ({ children, loading = false, ...props }) => {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <span className="flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

// Table Loading Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      {[...Array(rows)].map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 mb-2">
          {[...Array(columns)].map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const Loading = LoadingSpinner;
export default Loading;
