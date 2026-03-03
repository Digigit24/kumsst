import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
    ArrowRightLeft,
    ClipboardList,
    Package,
    PackagePlus,
    ShoppingCart,
    Truck,
    Users
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ActionCardProps {
    icon: React.ElementType;
    label: string;
    description: string;
    gradient: string;
    onClick: () => void;
    index: number;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, label, description, gradient, onClick, index }) => (
    <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02, translateY: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative w-full text-left group overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col p-4"
    >
        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${gradient}`} />
        <div className={`mb-3 p-2.5 rounded-lg bg-gradient-to-br ${gradient} w-fit text-white shadow-sm ring-1 ring-black/5`}>
            <Icon className="h-5 w-5" />
        </div>
        <div className="mt-auto">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                {label}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description}
            </p>
        </div>
        <div className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`}>
            <Icon className="h-24 w-24 -rotate-12" />
        </div>
    </motion.button>
);

export const StoreManagerQuickActions: React.FC = () => {
    const navigate = useNavigate();

    const actions = [
        {
            label: 'Material Issues',
            description: 'Issue stock to departments',
            icon: Package,
            gradient: 'from-blue-500 to-indigo-600',
            path: '/store/material-issues'
        },
        {
            label: 'Stock Receipts',
            description: 'Process incoming stock',
            icon: Truck,
            gradient: 'from-emerald-500 to-teal-600',
            path: '/store/stock-receipts'
        },
        {
            label: 'Indents Pipeline',
            description: 'Request items & track status',
            icon: ClipboardList,
            gradient: 'from-amber-400 to-orange-500',
            path: '/store/indents-pipeline'
        },
        {
            label: 'Store Items',
            description: 'Manage item catalog',
            icon: PackagePlus,
            gradient: 'from-purple-500 to-pink-600',
            path: '/store/items'
        },
        {
            label: 'Stock Transfers',
            description: 'Inter-store transfers',
            icon: ArrowRightLeft,
            gradient: 'from-cyan-500 to-blue-500',
            path: '/store/transfers-workflow'
        },
        {
            label: 'Store Sales',
            description: 'Manage sales & billing',
            icon: ShoppingCart,
            gradient: 'from-rose-500 to-red-600',
            path: '/store/sales'
        },
        {
            label: 'Vendors',
            description: 'Manage supplier details',
            icon: Users,
            gradient: 'from-slate-600 to-slate-800',
            path: '/store/vendors'
        }
    ];

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                <CardDescription>Frequently used store operations</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {actions.map((action, index) => (
                        <ActionCard
                            key={action.label}
                            index={index}
                            {...action}
                            onClick={() => navigate(action.path)}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
