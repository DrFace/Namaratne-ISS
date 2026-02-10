import classNames from 'classnames';
import { useState } from 'react';

interface ExpandableTextProps {
    title: string; // The title to display
    className?: string; // Optional additional class names for styling
}

export default function TitleWidget({
    title,
    className = '', // Default to an empty string if no className is provided
}: ExpandableTextProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = (e: React.MouseEvent<HTMLParagraphElement>) => {
        e.stopPropagation();
        setIsExpanded(prev => !prev);
    };

    return (
        <div className='expandable-text'>
            <p
                className={` leading-tight  ${isExpanded ? '' : 'whitespace-nowrap overflow-hidden text-ellipsis'}  font-Inter ${className}`}
                onClick={toggleExpand}
            >
                {title || 'No title available'}
            </p>

        </div>
    );
}
