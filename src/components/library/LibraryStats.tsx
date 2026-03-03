/**
 * LibraryStats Component - Display library statistics with light, modern design
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export interface StatItem {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    iconBg: 'bg-blue-100 dark:bg-blue-800/40',
    icon: 'text-blue-500 dark:text-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-800/40',
    icon: 'text-emerald-500 dark:text-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10',
  },
  orange: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    iconBg: 'bg-amber-100 dark:bg-amber-800/40',
    icon: 'text-amber-500 dark:text-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10',
  },
  red: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    iconBg: 'bg-rose-100 dark:bg-rose-800/40',
    icon: 'text-rose-500 dark:text-rose-400',
    text: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-50 to-red-50 dark:from-rose-900/10 dark:to-red-900/10',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    iconBg: 'bg-purple-100 dark:bg-purple-800/40',
    icon: 'text-purple-500 dark:text-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    iconBg: 'bg-cyan-100 dark:bg-cyan-800/40',
    icon: 'text-cyan-500 dark:text-cyan-400',
    text: 'text-cyan-600 dark:text-cyan-400',
    gradient: 'from-cyan-50 to-sky-50 dark:from-cyan-900/10 dark:to-sky-900/10',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

interface LibraryStatsProps {
  stats: StatItem[];
  className?: string;
}

export function LibraryStats({ stats, className }: LibraryStatsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}
    >
      {stats.map((stat, index) => {
        const colors = colorClasses[stat.color];
        const Icon = stat.icon;

        return (
          <motion.div key={index} variants={itemVariants as any} whileHover={{ scale: 1.02 }}>
            <Card
              className={cn(
                'overflow-hidden transition-all duration-300 hover:shadow-lg border-0 shadow-sm',
                `bg-gradient-to-br ${colors.gradient}`
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <motion.p
                      className={cn('text-3xl font-bold', colors.text)}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                    >
                      {stat.value}
                    </motion.p>
                    {stat.trend && (
                      <p
                        className={cn(
                          'text-xs font-medium',
                          stat.trend.isPositive ? 'text-emerald-500' : 'text-rose-500'
                        )}
                      >
                        {stat.trend.isPositive ? '↑' : '↓'} {stat.trend.value}%
                      </p>
                    )}
                  </div>
                  <div className={cn('p-3 rounded-xl shadow-sm', colors.iconBg)}>
                    <Icon className={cn('h-6 w-6', colors.icon)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default LibraryStats;
