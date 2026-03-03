import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBookIssues, useBooks } from '@/hooks/useLibrary';
import { useStoreItems } from '@/hooks/useStore';
import { useStudents } from '@/hooks/useStudents';
import { hasModulePermission } from '@/utils/permissions';
import { motion } from 'framer-motion';
import { BookOpen, Library, ShoppingCart, TrendingUp, type LucideIcon } from 'lucide-react';
import React from 'react';

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  isLoading?: boolean;
}

export const StaffModuleStats: React.FC = () => {
  // Check permissions for each module
  const hasStoreAccess = hasModulePermission('store', 'read');
  const hasLibraryAccess = hasModulePermission('library', 'read');
  const hasStudentsAccess = hasModulePermission('students', 'read');

  // Fetch Data
  // Store
  const { data: storeItems, isLoading: isStoreItemsLoading } = useStoreItems(
    hasStoreAccess ? { page_size: 1 } : undefined,
    { enabled: hasStoreAccess }
  );


  // Library
  const { data: books, isLoading: isBooksLoading } = useBooks(
    hasLibraryAccess ? { page_size: 1 } : undefined,
    { enabled: hasLibraryAccess }
  );
  const { data: bookIssues, isLoading: isIssuesLoading } = useBookIssues(
    hasLibraryAccess ? { status: 'issued', page_size: 1 } : undefined,
    { enabled: hasLibraryAccess }
  );

  // Students
  const { data: students, isLoading: isStudentsLoading } = useStudents(
    hasStudentsAccess ? { page_size: 1 } : undefined,
    { enabled: hasStudentsAccess }
  );

  const stats: StatItem[] = [];

  if (hasStoreAccess) {
    stats.push(
      {
        label: 'Store Items',
        value: storeItems?.count ?? 0,
        icon: ShoppingCart,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        isLoading: isStoreItemsLoading
      }
    );
  }

  if (hasLibraryAccess) {
    stats.push(
      {
        label: 'Total Books',
        value: books?.count ?? 0,
        icon: BookOpen,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        isLoading: isBooksLoading
      },
      {
        label: 'Books Issued',
        value: bookIssues?.count ?? 0,
        icon: Library,
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
        borderColor: 'border-indigo-200 dark:border-indigo-800',
        isLoading: isIssuesLoading
      }
    );
  }

  if (hasStudentsAccess) {
    stats.push(
      {
        label: 'Total Students',
        value: students?.count ?? 0,
        icon: BookOpen,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        isLoading: isStudentsLoading
      }
    );
  }

  // Don't show card if no stats
  if (stats.length === 0) {
    return null;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-950">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Module Overview</CardTitle>
            <CardDescription>Quick stats from your assigned modules</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={item}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`p-5 rounded-xl border ${stat.borderColor} bg-white dark:bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}
            >
              <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500`}>
                <stat.icon className={`h-16 w-16 ${stat.color}`} />
              </div>

              <div className="flex flex-col gap-3 relative z-10">
                <div className={`p-2 w-fit rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {stat.isLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    ) : (
                      stat.value
                    )}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-1">{stat.label}</p>
                </div>
              </div>

              <div className={`absolute bottom-0 left-0 w-full h-1 ${stat.bgColor.replace('bg-', 'bg-gradient-to-r from-transparent via-')}`} />
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};
