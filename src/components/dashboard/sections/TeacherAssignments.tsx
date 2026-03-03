import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssignments } from '@/hooks/useTeachers';
import { formatDistanceToNow, parseISO, isPast } from 'date-fns';
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  FilePlus,
  GraduationCap,
  MoreHorizontal
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const TeacherAssignments: React.FC = () => {
  const navigate = useNavigate();
  // Fetch active assignments
  const { data: assignmentsData, isLoading } = useAssignments({
    is_active: true,
    page_size: 5,
    ordering: 'due_date'
  });

  const getDueBadge = (dueDateStr: string) => {
    try {
      const date = parseISO(dueDateStr);
      const isOverdue = isPast(date);

      return (
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${isOverdue
          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
          }`}>
          <CalendarClock className="h-3 w-3" />
          {isOverdue ? 'Overdue' : `Due ${formatDistanceToNow(date, { addSuffix: true })}`}
        </div>
      );
    } catch {
      return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  if (isLoading) {
    return (
      <Card className="h-full border-none shadow-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const assignments = assignmentsData?.results || [];

  return (
    <Card className="h-full border-none shadow-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
      <CardHeader className="pb-4 border-b border-border/40 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Recent Assignments
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => navigate('/assignments/list')}
            >
              <FilePlus className="h-3.5 w-3.5" />
              Create
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => navigate('/teachers/homework-submissions')}
            >
              Grade
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-auto">
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-3">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No active assignments</p>
            <p className="text-sm text-muted-foreground mt-1">Create a new assignment to get started.</p>
          </div>
        ) : (
          <motion.div
            className="divide-y divide-border/40"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {assignments.slice(0, 4).map((assignment) => (
              <motion.div
                key={assignment.id}
                variants={itemVariants}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {assignment.title}
                    </h4>
                    {assignment.class_name && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal text-muted-foreground">
                        {assignment.class_name} {assignment.section_name && `- ${assignment.section_name}`}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {assignment.subject_name}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>
                      <strong className="text-foreground font-medium">{assignment.submission_count ?? 0}</strong> submissions
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[140px]">
                  {getDueBadge(assignment.due_date)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => navigate('/teachers/homework-submissions')}
                  >
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>

      {assignments.length > 0 && (
        <div className="p-2 border-t border-border/40 bg-muted/10 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-primary w-full h-8"
            onClick={() => navigate('/assignments/list')}
          >
            View All Assignments
          </Button>
        </div>
      )}
    </Card>
  );
};
