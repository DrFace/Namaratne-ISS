import React, { forwardRef } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', animate = true, onClick }, ref) => {
    return (
      <div 
        ref={ref}
        className={`glass-card ${animate ? 'animate-premium-in' : ''} ${className}`}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
