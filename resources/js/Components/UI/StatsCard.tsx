import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import classNames from 'classnames';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  description?: string;
  color?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'blue';
  className?: string;
  onClick?: () => void;
}

const colorMap = {
  indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/10',
  emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10',
  rose: 'from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/10',
  amber: 'from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10',
  blue: 'from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/10',
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  color = 'indigo',
  className,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={classNames(
        'relative overflow-hidden p-6 rounded-3xl border bg-white dark:bg-gray-900 shadow-sm transition-all',
        onClick ? 'cursor-pointer hover:shadow-md' : '',
        className
      )}
    >
      <div className="relative z-10 flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
            {value}
          </h3>
        </div>
        <div className={classNames(
          'p-3 rounded-2xl bg-gradient-to-br border',
          colorMap[color]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          {trend ? (
            <div className={classNames(
              'flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full',
              trend.isUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
            )}>
              {trend.isUp ? '↑' : '↓'} {trend.value}%
              <span className="opacity-60 font-medium ml-1">vs last month</span>
            </div>
          ) : description && (
            <p className="text-xs text-gray-500 font-medium">{description}</p>
          )}
        </div>
      </div>

      {/* DECORATIVE BACKGROUND SHAPE */}
      <div className={classNames(
        'absolute -right-4 -bottom-4 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br',
        color === 'indigo' ? 'from-indigo-500' : 
        color === 'emerald' ? 'from-emerald-500' :
        color === 'rose' ? 'from-rose-500' :
        color === 'amber' ? 'from-amber-500' : 'from-blue-500'
      )} />
    </motion.div>
  );
};

export default StatsCard;
