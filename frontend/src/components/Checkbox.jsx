import { forwardRef } from 'react';

// Checkbox Component
export const Checkbox = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={containerClassName}>
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className={`h-4 w-4 text-blue-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {label && (
          <label
            htmlFor={props.id}
            className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
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

Checkbox.displayName = 'Checkbox';

// Radio Component
export const Radio = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={containerClassName}>
      <div className="flex items-center">
        <input
          ref={ref}
          type="radio"
          className={`h-4 w-4 text-blue-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {label && (
          <label
            htmlFor={props.id}
            className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
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

Radio.displayName = 'Radio';

// Radio Group Component
export const RadioGroup = ({ label, error, helperText, children, className = '' }) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="space-y-2">{children}</div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

// Toggle/Switch Component
export const Toggle = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={containerClassName}>
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <div className={`w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 transition-colors ${className}`} />
          <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5" />
        </div>
        {label && (
          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        )}
      </label>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Toggle.displayName = 'Toggle';

export default Checkbox;
