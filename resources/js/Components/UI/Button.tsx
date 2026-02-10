import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  processing?: boolean; // Support both for convenience
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  processing = false,
  icon,
  className = '',
  ...props 
}) => {
  const loading = isLoading || processing;
  
  const baseStyle = "btn-premium flex items-center justify-center transition-all duration-200";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  const variants = {
    primary: "btn-primary-premium",
    secondary: "btn-secondary-premium",
    danger: "bg-rose-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 whitespace-nowrap",
    ghost: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap",
    outline: "border-2 border-indigo-600/20 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 bg-transparent whitespace-nowrap",
  };

  return (
    <button 
      className={`${baseStyle} ${sizeStyles[size]} ${variants[variant]} ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {icon && <span className={`${children ? 'mr-2' : ''}`}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
