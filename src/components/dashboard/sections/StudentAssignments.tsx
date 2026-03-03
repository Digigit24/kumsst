import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAssignments } from '@/hooks/useAssignments';
import {
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const StudentAssignments: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const { data: assignmentsData, isLoading } = useAssignments({
    page_size: 5,
    ordering: 'due_date',
    is_active: true
  });

  const assignments = assignmentsData?.results || [];

  // Deterministic pastel color generator for subjects
  const getSubjectColor = (subject: string) => {
    const colors = [
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
      "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
      "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300"
    ];
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatus = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return {
      text: 'Overdue',
      icon: AlertCircle,
      className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    };
    if (isToday(date)) return {
      text: 'Due Today',
      icon: Clock,
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    };
    if (isTomorrow(date)) return {
      text: 'Tomorrow',
      icon: Clock,
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    };
    return {
      text: formatDistanceToNow(date, { addSuffix: true }).replace('in ', ''),
      icon: Clock,
      className: 'bg-secondary/50 text-muted-foreground'
    };
  };

  if (isLoading) {
    return (
      <Card className="h-full border-none shadow-sm">
        <CardHeader className="pb-4"><div className="h-6 w-32 bg-muted rounded animate-pulse" /></CardHeader>
        <CardContent><div className="space-y-4">{[1, 2, 3, 4].map(i => <div key={i} className="flex gap-4"><div className="h-10 w-10 rounded-lg bg-muted animate-pulse" /><div className="space-y-2 flex-1"><div className="h-4 w-3/4 bg-muted rounded animate-pulse" /><div className="h-3 w-1/2 bg-muted rounded animate-pulse" /></div></div>)}</div></CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-none shadow-sm bg-card flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-5">
        <CardTitle className="text-base font-bold text-foreground">Pending Assignments</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs font-medium text-muted-foreground hover:text-primary"
          onClick={() => navigate('/student/academics/assignments')}
        >
          View All
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto px-5 pb-2 pt-2 custom-scrollbar">
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-400/20 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">All Clear!</h4>
              <p className="text-xs text-muted-foreground mt-1">No pending assignments for now.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.slice(0, 5).map((assignment, index) => {
              const subjectColor = getSubjectColor(assignment.subject_name || '?');
              const status = getStatus(assignment.due_date);
              const StatusIcon = status.icon;
              const isHovered = hoveredId === assignment.id;

              return (
                <div
                  key={assignment.id}
                  className="group flex gap-4 items-center cursor-pointer"
                  onMouseEnter={() => setHoveredId(assignment.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => navigate('/student/academics/assignments')}
                >
                  {/* Subject Icon Box */}
                  <div className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-transform duration-300",
                    subjectColor,
                    isHovered ? "scale-110 shadow-sm" : ""
                  )}>
                    {(assignment.subject_name || '?').charAt(0).toUpperCase()}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 border-b border-border/40 pb-4 group-last:border-0 group-last:pb-0">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className={cn(
                          "text-sm font-semibold truncate pr-2 transition-colors",
                          isHovered ? "text-primary" : "text-foreground"
                        )}>
                          {assignment.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {assignment.subject_name}
                        </p>
                      </div>

                      <div className={cn("text-[10px] flex items-center gap-1 min-w-fit px-2 py-1 rounded-full border border-transparent dark:border-white/5", status.className)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.text}
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "text-muted-foreground/30 group-hover:text-primary transition-all duration-300 transform",
                    isHovered ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
                  )}>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
