import { BookOpen, CalendarDays, FileText, CreditCard, Megaphone, UserCircle, ArrowRight, GraduationCap } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ACTIONS = [
  {
    label: 'Assignments',
    icon: FileText,
    href: '/student/academics/assignments',
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50',
    stroke: 'stroke-blue-600/10'
  },
  {
    label: 'Attendance',
    icon: CalendarDays,
    href: '/student/academics/attendance',
    color: 'bg-emerald-600',
    lightColor: 'bg-emerald-50',
    stroke: 'stroke-emerald-600/10'
  },
  {
    label: 'Exam Results',
    icon: GraduationCap,
    href: '/student/examinations/results',
    color: 'bg-violet-600',
    lightColor: 'bg-violet-50',
    stroke: 'stroke-violet-600/10'
  },
  {
    label: 'My Fees',
    icon: CreditCard,
    href: '/student/fees',
    color: 'bg-amber-600',
    lightColor: 'bg-amber-50',
    stroke: 'stroke-amber-600/10'
  },
  {
    label: 'Library',
    icon: BookOpen,
    href: '/library/my-books',
    color: 'bg-indigo-600',
    lightColor: 'bg-indigo-50',
    stroke: 'stroke-indigo-600/10'
  },
  {
    label: 'Notices',
    icon: Megaphone,
    href: '/communication/notices',
    color: 'bg-pink-600',
    lightColor: 'bg-pink-50',
    stroke: 'stroke-pink-600/10'
  },
  {
    label: 'Timetable',
    icon: CalendarDays,
    href: '/academic/timetables',
    color: 'bg-sky-600',
    lightColor: 'bg-sky-50',
    stroke: 'stroke-sky-600/10'
  },
  {
    label: 'Profile',
    icon: UserCircle,
    href: '/student/profile',
    color: 'bg-slate-600',
    lightColor: 'bg-slate-50',
    stroke: 'stroke-slate-600/10'
  },
];

export const StudentQuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Quick Actions
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ACTIONS.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer h-full"
            onClick={() => navigate(action.href)}
          >
            <div className="relative overflow-hidden h-full bg-white dark:bg-slate-900 rounded-lg p-5 shadow-sm transition-all duration-300 group-hover:shadow-md">

              {/* Background Pattern - Geometric Strokes */}
              <div className="absolute right-0 top-0 h-full w-1/2 opacity-100 pointer-events-none overflow-hidden">
                <svg className={`absolute -right-4 -top-8 w-32 h-32 transform rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110 ${action.stroke}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 10 L40 40 M10 50 L40 80 M50 10 L80 40 M50 50 L90 90" strokeWidth="8" strokeLinecap="square" />
                  <circle cx="80" cy="20" r="10" strokeWidth="4" />
                </svg>
              </div>

              {/* Content */}
              <div className="flex flex-col h-full justify-between relative z-10">
                {/* Top: Icon */}
                <div className="flex justify-between items-start">
                  <div className={`
                            p-3 rounded-md ${action.lightColor} dark:bg-slate-800 
                            transition-colors duration-300
                        `}>
                    <action.icon className={`h-6 w-6 ${action.color.replace('bg-', 'text-')}`} />
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-1">
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Bottom: Label */}
                <div className="mt-4">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {action.label}
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
