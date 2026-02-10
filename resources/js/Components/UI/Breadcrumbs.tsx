import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <nav className="flex mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide py-1" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link
                        href={route('dashboard')}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Home
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="ml-1 text-sm font-medium text-gray-500 hover:text-indigo-600 md:ml-2 dark:text-gray-400 dark:hover:text-white transition-colors capitalize"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="ml-1 text-sm font-bold text-gray-900 md:ml-2 dark:text-white capitalize">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
