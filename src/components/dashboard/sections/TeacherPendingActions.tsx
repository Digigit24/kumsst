import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChats } from '@/hooks/useCommunication';
import { useHomeworkSubmissions } from '@/hooks/useTeachers';
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  ListTodo,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const TeacherPendingActions: React.FC = () => {
  const navigate = useNavigate();

  // Fetch pending submissions (submitted status)
  const { data: submissionsData, isLoading: isLoadingSubmissions } = useHomeworkSubmissions({
    status: 'submitted',
    page_size: 1
  });

  // Fetch unread messages
  const { data: chatsData, isLoading: isLoadingChats } = useChats({
    is_read: false,
    page_size: 1
  });

  const actions = useMemo(() => {
    const pendingSubmissions = submissionsData?.count || 0;
    const unreadMessages = chatsData?.count || 0;

    return [
      {
        id: 'grading',
        title: 'Grade Submissions',
        detail: pendingSubmissions === 0
          ? 'No assignments waiting for review'
          : `${pendingSubmissions} assignments waiting for review`,
        badge: 'Grading',
        href: '/teachers/homework-submissions',
        count: pendingSubmissions,
        icon: ClipboardCheck,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/40',
        borderColor: 'border-blue-200 dark:border-blue-800',
        isUrgent: pendingSubmissions > 0
      },
      {
        id: 'attendance',
        title: 'Mark Attendance',
        detail: 'Record student attendance for today',
        badge: 'Daily Task',
        href: '/attendance/students',
        count: null,
        icon: CalendarCheck2,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        isUrgent: true // Always relevant daily
      },
      {
        id: 'messages',
        title: 'Unread Messages',
        detail: unreadMessages === 0
          ? 'You have no unread messages'
          : `${unreadMessages} new messages from students`,
        badge: 'Inbox',
        href: '/communication/chats',
        count: unreadMessages,
        icon: MessageCircle,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/40',
        borderColor: 'border-amber-200 dark:border-amber-800',
        isUrgent: unreadMessages > 0
      },
    ];
  }, [submissionsData, chatsData]);

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

  if (isLoadingSubmissions || isLoadingChats) {
    return (
      <Card className="h-full border-none shadow-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Calculate total urgency
  const pendingCount = actions.filter(a => a.isUrgent && a.count !== 0).length;

  return (
    <Card className="h-full border-none shadow-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListTodo className="h-5 w-5 text-primary" />
            Pending Actions
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                {pendingCount}
              </Badge>
            )}
          </CardTitle>
          {pendingCount === 0 && (
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              All Caught Up
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {actions.map((action) => (
            <motion.div
              key={action.id}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all ${action.isUrgent
                ? 'bg-white dark:bg-gray-800 border-border/60 hover:shadow-md'
                : 'bg-muted/30 border-transparent opacity-80 hover:opacity-100'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${action.bgColor} ${action.color} ring-1 ring-inset ${action.borderColor}`}>
                  <action.icon className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold text-sm ${action.isUrgent ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {action.title}
                    </h4>
                    {action.count !== null && action.count > 0 && (
                      <Badge className={`${action.bgColor} ${action.color} border-none`}>
                        {action.count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground max-w-[200px] line-clamp-1">
                    {action.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Button
                  size="sm"
                  variant={action.isUrgent ? 'default' : 'ghost'}
                  className={`h-8 w-8 p-0 rounded-full ${!action.isUrgent && 'text-muted-foreground'}`}
                  onClick={() => navigate(action.href)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};
