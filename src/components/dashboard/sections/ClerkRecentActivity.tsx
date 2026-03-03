import { motion } from 'framer-motion';
import {
    History,
    MoreHorizontal
} from 'lucide-react';
import { useMemo } from 'react';
import useSWR from 'swr';
import { API_BASE_URL, API_ENDPOINTS, getDefaultHeaders } from '../../../config/api.config';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { ScrollArea } from '../../ui/scroll-area';
import { Skeleton } from '../../ui/skeleton';

const fetcher = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    const headers = getDefaultHeaders();

    return fetch(fullUrl, { headers }).then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    });
};

export const ClerkRecentActivity = () => {
    const { data: activityLogs, isLoading: loadingLogs } = useSWR(
        API_ENDPOINTS.activityLogs.list + '?page_size=8',
        fetcher
    );

    const activities = useMemo(() => {
        if (loadingLogs || !activityLogs?.results) return [];
        return activityLogs.results.map((log: any) => ({
            id: log.id,
            user: log.user_name || "System",
            action: log.action_display || "Action performed",
            time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
            details: log.description || log.object_repr,
            color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
        }));
    }, [activityLogs, loadingLogs]);

    return (
        <Card className="border-none shadow-lg h-full overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <History className="h-64 w-64" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                    <CardDescription>Latest administrative events</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-6">
                        {loadingLogs ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-[60%]" />
                                        <Skeleton className="h-3 w-[40%]" />
                                    </div>
                                </div>
                            ))
                        ) : activities.length > 0 ? (
                            activities.map((activity: any, index: number) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative flex items-start gap-4"
                                >
                                    {/* Vertical Line Connector */}
                                    {index !== activities.length - 1 && (
                                        <div className="absolute left-5 top-10 bottom-[-1.5rem] w-px bg-slate-200 dark:bg-slate-800" />
                                    )}

                                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm z-10">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                            {activity.user.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-foreground">
                                                {activity.user}
                                            </p>
                                            <span className="text-[10px] font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                                                {activity.time}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            <span className="text-primary font-medium">{activity.action}</span>: {activity.details}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <History className="h-12 w-12 mb-2 opacity-20" />
                                <p>No recent activity found</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="ghost" className="w-full text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-900">
                        View Audit Log
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
