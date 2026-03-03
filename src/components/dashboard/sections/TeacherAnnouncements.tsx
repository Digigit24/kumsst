import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotices } from '@/hooks/useCommunication';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  ArrowRight,
  Bell,
  CalendarClock,
  Info,
  Megaphone,
  AlertCircle
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const TeacherAnnouncements: React.FC = () => {
  const navigate = useNavigate();
  const { data: noticesData, isLoading } = useNotices({
    is_published: true,
    is_active: true,
    page_size: 5,
    ordering: '-publish_date'
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <Card className="h-full border-none shadow-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const notices = noticesData?.results || [];

  return (
    <Card className="h-full border-none shadow-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
      <CardHeader className="pb-3 border-b border-border/40 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Bell className="h-4 w-4 text-primary" />
              Notice Board
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs font-normal">
            {notices.length} New
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-auto">
        {notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="h-10 w-10 bg-muted/50 rounded-full flex items-center justify-center mb-3">
              <Info className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No announcements</p>
          </div>
        ) : (
          <motion.div
            className="flex flex-col"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {notices.slice(0, 5).map((notice, index) => (
              <motion.div
                key={notice.id}
                variants={itemVariants}
                className={`group relative flex gap-3 p-4 transition-all hover:bg-muted/50 cursor-pointer border-b border-border/30 last:border-0 ${notice.is_urgent ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                  }`}
                onClick={() => navigate(`/communication/notices/${notice.id}`)}
              >
                {/* Icon Indicator */}
                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${notice.is_urgent
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                  : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                  {notice.is_urgent ? <AlertCircle className="h-4 w-4" /> : <Megaphone className="h-4 w-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-medium leading-none ${notice.is_urgent ? 'text-red-700 dark:text-red-400' : 'text-foreground'}`}>
                      {notice.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {formatDistanceToNow(parseISO(notice.publish_date), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {notice.content || "Tap to read full details..."}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>

      <div className="p-2 border-t border-border/40 bg-muted/10">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground hover:text-primary h-8"
          onClick={() => navigate('/communication/notices')}
        >
          View All Notices <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </Card>
  );
};
