import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  error,
  helperText,
  options = [],
  placeholder = 'Select an option',
  fullWidth = true,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseClasses = 'block w-full px-3 py-2 pr-10 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none';

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
        <select
          ref={ref}
          className={`${baseClasses} ${stateClasses} ${bgClasses} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
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

Select.displayName = 'Select';

export default Select;
