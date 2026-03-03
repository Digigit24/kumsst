import { motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    FileText,
    Users
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '@/hooks/useStudents';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';

export const ClerkPendingTasks: React.FC = () => {
    const navigate = useNavigate();

    // Fetch real data for pending admissions (inactive students)
    const { data: studentsData, isLoading: loadingStudents } = useStudents({
        is_active: false,
        page_size: 1
    });

    const pendingAdmissions = studentsData?.count || 0;

    const tasks = [
        {
            id: 'admissions',
            title: 'Admission verifications',
            description: 'New student registrations awaiting approval',
            count: pendingAdmissions,
            priority: 'high',
            route: '/students/list?status=inactive',
            icon: Users,
            color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30'
        },
        {
            id: 'documents',
            title: 'Document approvals',
            description: 'Uploaded certificates needing verification',
            count: 5, // Placeholder
            priority: 'medium',
            route: '/clerk/print-documents',
            icon: FileText,
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'
        },
        {
            id: 'notifications',
            title: 'Urgent notices',
            description: 'Announcements pending for circulation',
            count: 2, // Placeholder
            priority: 'low',
            route: '/communication/notices',
            icon: Activity,
            color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30'
        }
    ].filter(t => t.count > 0);

    return (
        <Card className="border-none shadow-lg h-full overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <AlertCircle className="h-64 w-64" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl font-bold">Pending Tasks</CardTitle>
                    <CardDescription>Actions requiring your immediate attention</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {loadingStudents ? (
                        Array(3).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-xl" />
                        ))
                    ) : tasks.length > 0 ? (
                        tasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => navigate(task.route)}
                                className="group p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className={`p-3 rounded-lg ${task.color} group-hover:scale-110 transition-transform`}>
                                        <task.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-bold text-foreground text-sm truncate">{task.title}</p>
                                            <Badge
                                                variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'warning' : 'secondary'}
                                                className="uppercase text-[10px] px-2 py-0"
                                            >
                                                {task.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                                    </div>
                                    <div className="text-2xl font-black text-primary/40 group-hover:text-primary transition-colors">
                                        {task.count}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                            <CheckCircle2 className="h-12 w-12 mb-3 text-emerald-500 opacity-80" />
                            <p className="font-bold text-foreground">You're all caught up!</p>
                            <p className="text-sm">No pending tasks for today.</p>
                        </div>
                    )}
                </div>
                <div className="mt-6">
                    <Button
                        variant="outline"
                        className="w-full border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                        onClick={() => navigate('/clerk/students')}
                    >
                        View Work Queue
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
