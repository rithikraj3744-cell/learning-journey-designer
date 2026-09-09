// Form Container Component
export const Form = ({ children, onSubmit, className = '' }) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      {children}
    </form>
  );
};

// Form Group Component
export const FormGroup = ({ children, className = '' }) => {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
};

// Form Row Component (for side-by-side fields)
export const FormRow = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {children}
    </div>
  );
};

// Field Error Component
export const FieldError = ({ error }) => {
  if (!error) return null;
  return <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>;
};

// Field Label Component
export const FieldLabel = ({ label, required, htmlFor }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

// Helper Text Component
export const HelperText = ({ text }) => {
  if (!text) return null;
  return <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{text}</p>;
};

export default {
  Form,
  FormGroup,
  FormRow,
  FieldError,
  FieldLabel,
  HelperText
};
