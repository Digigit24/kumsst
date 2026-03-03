import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useExamSchedules } from '@/hooks/useExamination';
import {
  Loader2,
  ChevronRight,
  CalendarDays,
  Clock,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const StudentUpcomingExams: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const { data: examSchedules, isLoading } = useExamSchedules({
    page_size: 5, // Matches StudentPriorityCards params so React Query deduplicates the call
    ordering: 'date',
    date__gte: todayStr
  });

  const exams = examSchedules?.results || [];

  // Helper formats
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const getDayName = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getUrgencyColor = (dateStr: string) => {
    const examDate = new Date(dateStr);
    examDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300";
    if (diffDays <= 3) return "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300";
    return "text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-300";
  };

  if (isLoading) {
    return (
      <Card className="h-full border-none shadow-sm">
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-none shadow-sm flex flex-col bg-background relative overflow-hidden group/card">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover/card:scale-110 duration-700" />

      <CardHeader className="flex flex-row items-center justify-between pb-4 relative z-10">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-bold tracking-tight">Upcoming Exams</CardTitle>
          <p className="text-xs text-muted-foreground font-medium">
            {exams.length > 0 ? `You have ${exams.length} exams scheduled soon` : 'No upcoming exams'}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-8 h-8 opacity-70 hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all"
          onClick={() => navigate('/exams/schedules')}
          title="View Full Schedule"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 relative z-10 p-4 pt-0">
        {exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-center border-2 border-dashed border-muted rounded-xl bg-muted/5">
            <div className="p-3 bg-background rounded-full shadow-sm mb-3">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No Scheduled Exams</p>
            <p className="text-xs text-muted-foreground mt-1">Free schedule ahead!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
            <AnimatePresence>
              {exams.slice(0, 4).map((exam: any, index: number) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div
                    className={cn(
                      "h-full p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between cursor-pointer card-hover-effect",
                      getUrgencyColor(exam.date),
                      hoveredIndex === index ? "shadow-md -translate-y-1" : "shadow-sm border-transparent bg-opacity-50"
                    )}
                    onClick={() => navigate('/exams/schedules')}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                          {getDayName(exam.date)}
                        </span>
                        <span className="text-xl font-bold leading-none mt-0.5">
                          {formatDate(exam.date)}
                        </span>
                      </div>
                      <div className={cn(
                        "p-1.5 rounded-lg bg-white/50 backdrop-blur-sm",
                        "dark:bg-black/20"
                      )}>
                        <BookOpen className="h-4 w-4 opacity-80" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm line-clamp-1 mb-1" title={exam.subject_name}>
                        {exam.subject_name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs opacity-80">
                        <Clock className="h-3 w-3" />
                        <span>{exam.start_time?.slice(0, 5)}</span>
                        <span className="mx-1">•</span>
                        <span className="truncate max-w-[60px]">{exam.classroom_name || 'Room TBA'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
