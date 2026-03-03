import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { hasModulePermission } from '@/utils/permissions';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Library,
  ShoppingCart,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ActionCardProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  color: string;
  bgColor: string;
  onClick: () => void;
  index: number;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, label, description, color, bgColor, onClick, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Button
      variant="outline"
      className="w-full h-auto py-6 flex flex-col items-center gap-3 bg-card hover:bg-accent/50 border-muted-foreground/20 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md group relative overflow-hidden"
      onClick={onClick}
    >
      <div className={`p-3 rounded-full ${bgColor} group-hover:bg-opacity-80 transition-colors`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-semibold text-base">{label}</span>
        {description && <span className="text-xs text-muted-foreground font-normal">{description}</span>}
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-full ${color.replace('text-', 'bg-')} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </Button>
  </motion.div>
);

export const StaffQuickActions: React.FC = () => {
  const navigate = useNavigate();

  // Check permissions for each module
  const hasStoreAccess = hasModulePermission('store', 'read');
  const hasLibraryAccess = hasModulePermission('library', 'read');
  const hasStudentsAccess = hasModulePermission('students', 'read');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-950">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
            <ClipboardList className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
            <CardDescription>Access your assigned modules and common tasks</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {hasStoreAccess && (
            <>
              <ActionCard
                icon={Store}
                label="Inventory"
                description="Manage stock"
                color="text-blue-600 dark:text-blue-400"
                bgColor="bg-blue-100 dark:bg-blue-900/20"
                onClick={() => navigate('/store/central-inventory')}
                index={0}
              />
              <ActionCard
                icon={ClipboardList}
                label="Indents"
                description="View requests"
                color="text-purple-600 dark:text-purple-400"
                bgColor="bg-purple-100 dark:bg-purple-900/20"
                onClick={() => navigate('/store/indents-pipeline')}
                index={1}
              />
              <ActionCard
                icon={ShoppingCart}
                label="Store Items"
                description="Catalog & Pricing"
                color="text-green-600 dark:text-green-400"
                bgColor="bg-green-100 dark:bg-green-900/20"
                onClick={() => navigate('/store/items')}
                index={2}
              />
            </>
          )}

          {hasLibraryAccess && (
            <>
              <ActionCard
                icon={BookOpen}
                label="Books"
                description="Manage collection"
                color="text-amber-600 dark:text-amber-400"
                bgColor="bg-amber-100 dark:bg-amber-900/20"
                onClick={() => navigate('/library/books')}
                index={3}
              />
              <ActionCard
                icon={Library}
                label="Book Issues"
                description="Track circulation"
                color="text-indigo-600 dark:text-indigo-400"
                bgColor="bg-indigo-100 dark:bg-indigo-900/20"
                onClick={() => navigate('/library/issues')}
                index={4}
              />
              <ActionCard
                icon={Users}
                label="Members"
                description="Library users"
                color="text-rose-600 dark:text-rose-400"
                bgColor="bg-rose-100 dark:bg-rose-900/20"
                onClick={() => navigate('/library/members')}
                index={5}
              />
            </>
          )}

          {hasStudentsAccess && (
            <ActionCard
              icon={GraduationCap}
              label="Students"
              description="Student records"
              color="text-cyan-600 dark:text-cyan-400"
              bgColor="bg-cyan-100 dark:bg-cyan-900/20"
              onClick={() => navigate('/students/list')}
              index={6}
            />
          )}
        </motion.div>

        {!hasStoreAccess && !hasLibraryAccess && !hasStudentsAccess && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/30">
            <ClipboardList className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">No actions available</p>
            <p className="text-xs mt-1">Contact your administrator permissions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
