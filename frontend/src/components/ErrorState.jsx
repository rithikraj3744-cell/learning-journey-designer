import { AlertCircle, AlertTriangle, XCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

// Full Page Error
export const ErrorScreen = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again later.',
  onRetry,
  showHomeButton = true
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <XCircle className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          )}
          {showHomeButton && (
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Inline Error Alert
export const ErrorAlert = ({
  title,
  message,
  onDismiss,
  variant = 'error',
  className = ''
}) => {
  const variants = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: XCircle,
      iconColor: 'text-red-600 dark:text-red-400'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: AlertCircle,
      iconColor: 'text-blue-600 dark:text-blue-400'
    }
  };

  const style = variants[variant];
  const Icon = style.icon;

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-lg p-4 ${className}`}
    >
      <div className="flex">
        <Icon className={`h-5 w-5 ${style.iconColor} flex-shrink-0`} />
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${style.text} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${style.text}`}>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-3 ${style.text} hover:opacity-70`}
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Empty State
export const EmptyState = ({
  icon: Icon = AlertCircle,
  title = 'No data found',
  message = 'There is no data to display at the moment.',
  action,
  actionLabel = 'Get Started',
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        {message}
      </p>
      {action && (
        <button
          onClick={action}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// 404 Not Found
export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          Page not found
        </p>
        <p className="text-gray-500 dark:text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

// Error Boundary Fallback
export const ErrorBoundaryFallback = ({ error, resetError }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-lg">
        <XCircle className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Application Error
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The application encountered an unexpected error.
        </p>
        {error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              Technical details
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-auto">
              {error.toString()}
            </pre>
          </details>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={resetError}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

const ErrorState = ErrorAlert;
export default ErrorState;
