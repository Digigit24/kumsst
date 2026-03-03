import { motion } from 'framer-motion';
import {
    CalendarDays,
    CreditCard,
    FilePlus,
    FileText,
    MessageSquare,
    Printer,
    Search,
    UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';

export const ClerkQuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        {
            title: "New Admission",
            description: "Register a new student",
            icon: UserPlus,
            path: "/students/list",
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/30",
            border: "border-blue-100 dark:border-blue-900/50"
        },
        {
            title: "Fee Collection",
            description: "Process student fees",
            icon: CreditCard,
            path: "/fees/collection",
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
            border: "border-emerald-100 dark:border-emerald-900/50"
        },
        {
            title: "Print ID Cards",
            description: "Generate student IDs",
            icon: Printer,
            path: "/clerk/print-documents",
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-950/30",
            border: "border-purple-100 dark:border-purple-900/50"
        },
        {
            title: "Post Notice",
            description: "Send announcements",
            icon: MessageSquare,
            path: "/communication/notices",
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-950/30",
            border: "border-amber-100 dark:border-amber-900/50"
        },
        {
            title: "Document Search",
            description: "Find student records",
            icon: Search,
            path: "/clerk/students",
            color: "text-cyan-600",
            bg: "bg-cyan-50 dark:bg-cyan-950/30",
            border: "border-cyan-100 dark:border-cyan-900/50"
        },
        {
            title: "Academic Year",
            description: "Manage sessions",
            icon: CalendarDays,
            path: "/core/academic-years",
            color: "text-rose-600",
            bg: "bg-rose-50 dark:bg-rose-950/30",
            border: "border-rose-100 dark:border-rose-900/50"
        },
        {
            title: "Print Templates",
            description: "Design documents",
            icon: FileText,
            path: "/clerk/print-templates",
            color: "text-indigo-600",
            bg: "bg-indigo-50 dark:bg-indigo-950/30",
            border: "border-indigo-100 dark:border-indigo-900/50"
        },
        {
            title: "New Report",
            description: "Generate summaries",
            icon: FilePlus,
            path: "/reports/generated",
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-950/30",
            border: "border-orange-100 dark:border-orange-900/50"
        }
    ];

    return (
        <Card className="border-none shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <FileText className="h-64 w-64" />
            </div>
            <CardHeader>
                <CardTitle className="text-xl font-bold">Administrative Actions</CardTitle>
                <CardDescription>Quick access to frequent clerical tasks</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {actions.map((action, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                variant="outline"
                                className={`h-full w-full flex flex-col items-center justify-center p-6 gap-3 border transition-all duration-300 group hover:shadow-md ${action.bg} ${action.border}`}
                                onClick={() => navigate(action.path)}
                            >
                                <div className={`p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm transition-transform duration-300 group-hover:scale-110 ${action.color}`}>
                                    <action.icon className="h-6 w-6" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-foreground leading-none mb-1">{action.title}</p>
                                    <p className="text-[10px] text-muted-foreground line-clamp-1">{action.description}</p>
                                </div>
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
