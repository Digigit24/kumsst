import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  ClipboardCheck,
  FilePlus,
  LayoutDashboard,
  MessageSquare,
  Users,
  CalendarCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export const TeacherQuickStats: React.FC = () => {
  const navigate = useNavigate();

  const shortcuts = [
    {
      label: 'Mark Attendance',
      icon: CalendarCheck,
      path: '/attendance/students',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      description: 'Record daily attendance'
    },
    {
      label: 'New Assignment',
      icon: FilePlus,
      path: '/assignments/list',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      description: 'Create tasks & homework'
    },
    {
      label: 'Students',
      icon: Users,
      path: '/students/list',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      description: 'View student profiles'
    },
    {
      label: 'Subjects',
      icon: BookOpen,
      path: '/teacher/subjects',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      description: 'Manage course content'
    },
    {
      label: 'Submissions',
      icon: ClipboardCheck,
      path: '/teachers/homework-submissions',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      description: 'Review student work'
    },
    {
      label: 'Announcements',
      icon: MessageSquare,
      path: '/communication/notices',
      color: 'text-rose-600',
      bgColor: 'bg-rose-100 dark:bg-rose-900/30',
      description: 'Post class updates'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100
      }
    }
  };

  return (
    <Card className="border-none shadow-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2 border-b border-border/40 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/20">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Quick Actions
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {shortcuts.map((shortcut) => (
            <motion.div
              key={shortcut.label}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(shortcut.path)}
              className="group cursor-pointer relative flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-gray-800 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Highlight Glow Effect on Hover */}
              <div
                className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${shortcut.bgColor.replace('bg-', 'bg-current ').replace('dark:bg-', '')}`}
              />

              <div className={`p-3 rounded-full mb-3 ${shortcut.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                <shortcut.icon className={`w-6 h-6 ${shortcut.color}`} />
              </div>

              <h3 className="font-semibold text-sm text-center mb-1 group-hover:text-primary transition-colors">
                {shortcut.label}
              </h3>

              <p className="text-[10px] text-muted-foreground text-center font-medium opacity-80 group-hover:opacity-100">
                {shortcut.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};
