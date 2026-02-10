import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '', onClick }) => {
  const variants = {
    primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    error: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
  };

  return (
    <span 
      onClick={onClick}
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium cursor-default ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
