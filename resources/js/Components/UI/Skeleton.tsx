import React from 'react';
import classNames from 'classnames';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animate = true,
}) => {
  const styles = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  };

  return (
    <div
      className={classNames(
        'bg-gray-200 dark:bg-gray-700/50 relative overflow-hidden',
        {
          'rounded-full': variant === 'circular',
          'rounded-md': variant === 'rectangular',
          'rounded': variant === 'text',
          'animate-pulse': animate,
        },
        className
      )}
      style={styles}
    >
      {/* SHIMMER EFFECT */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-6">
        <Skeleton width={200} height={32} />
        <Skeleton width={100} height={32} />
      </div>
      <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="bg-gray-50/50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-800 flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="flex-1" height={16} />
          ))}
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4 flex gap-4">
              {Array.from({ length: cols }).map((_, j) => (
                <Skeleton key={j} className="flex-1" height={20} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
