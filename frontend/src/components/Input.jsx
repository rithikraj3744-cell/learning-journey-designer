import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';

  const stateClasses = error
    ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500';

  const bgClasses = 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthClass} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
        )}

        <input
          ref={ref}
          className={`${baseClasses} ${stateClasses} ${bgClasses} ${Icon && iconPosition === 'left' ? 'pl-10' : ''} ${Icon && iconPosition === 'right' ? 'pr-10' : ''} ${className}`}
          {...props}
        />

        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
        )}

        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
