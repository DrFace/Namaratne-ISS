import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon,
  multiline,
  className = '',
  ...props 
}) => {
  const inputClasses = `input-premium ${icon ? 'pl-11' : ''} ${error ? 'border-rose-500 focus:ring-rose-500' : ''} ${className}`;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
            {icon}
          </div>
        )}
        {multiline ? (
          <textarea
            className={`${inputClasses} min-h-[100px] py-3`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            className={inputClasses}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
      {error && (
        <p className="text-xs text-rose-500 ml-1 mt-1 animate-premium-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
