import { forwardRef } from 'react';

const TextArea = forwardRef(({
  label,
  error,
  helperText,
  rows = 4,
  fullWidth = true,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-y';

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

      <textarea
        ref={ref}
        rows={rows}
        className={`${baseClasses} ${stateClasses} ${bgClasses} ${className}`}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
