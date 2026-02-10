import React from 'react';
import { LucideIcon, SearchX } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon: Icon = SearchX,
    action,
    className = '',
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 ${className}`}>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4">
                <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                {title}
            </h3>
            {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-6">
                    <Button onClick={action.onClick} variant="primary">
                        {action.label}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default EmptyState;
