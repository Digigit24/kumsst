import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
    ArrowRightLeft,
    ClipboardPlus,
    FileCheck,
    PackagePlus,
    Store,
    Truck,
    Zap,
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const quickActions = [
    {
        title: 'New Indent',
        icon: ClipboardPlus,
        path: '/store/indents-pipeline',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-100 dark:border-blue-800',
        hoverBorder: 'hover:border-blue-500/50 dark:hover:border-blue-400/50',
        description: 'Create material request'
    },
    {
        title: 'Stock Receipt',
        icon: PackagePlus,
        path: '/store/stock-receipts',
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-100 dark:border-emerald-800',
        hoverBorder: 'hover:border-emerald-500/50 dark:hover:border-emerald-400/50',
        description: 'Add incoming stock'
    },
    {
        title: 'Material Issue',
        icon: Truck,
        path: '/store/material-issues',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-100 dark:border-amber-800',
        hoverBorder: 'hover:border-amber-500/50 dark:hover:border-amber-400/50',
        description: 'Issue items to depts'
    },
    {
        title: 'Transfer Stock',
        icon: ArrowRightLeft,
        path: '/store/transfers-workflow',
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-100 dark:border-purple-800',
        hoverBorder: 'hover:border-purple-500/50 dark:hover:border-purple-400/50',
        description: 'Move between stores'
    },
    {
        title: 'Manage Vendors',
        icon: Store,
        path: '/store/vendors',
        color: 'text-cyan-600 dark:text-cyan-400',
        bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
        borderColor: 'border-cyan-100 dark:border-cyan-800',
        hoverBorder: 'hover:border-cyan-500/50 dark:hover:border-cyan-400/50',
        description: 'Supplier database'
    },
    {
        title: 'Approvals',
        icon: FileCheck,
        path: '/store/approvals',
        color: 'text-rose-600 dark:text-rose-400',
        bgColor: 'bg-rose-50 dark:bg-rose-900/20',
        borderColor: 'border-rose-100 dark:border-rose-800',
        hoverBorder: 'hover:border-rose-500/50 dark:hover:border-rose-400/50',
        description: 'Pending requests'
    }
];

export const CentralStoreQuickActions: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-gray-900">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                        <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold tracking-tight">Quick Actions</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                            Store Operations
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                        <motion.div
                            key={action.title}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Button
                                variant="outline"
                                className={`h-auto w-full p-4 flex flex-row items-center justify-start gap-4 bg-transparent ${action.borderColor} ${action.hoverBorder} hover:bg-card hover:shadow-md transition-all duration-300 group text-left`}
                                onClick={() => navigate(action.path)}
                            >
                                <div className={`p-3 rounded-xl ${action.bgColor} ${action.color} transition-colors group-hover:scale-110 duration-300`}>
                                    <action.icon className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {action.title}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-normal">
                                        {action.description}
                                    </span>
                                </div>
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
