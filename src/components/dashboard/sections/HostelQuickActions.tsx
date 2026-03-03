/**
 * Hostel Quick Actions Component
 * High-performance, visually striking action buttons for hostel management
 */

import {
    ArrowRight,
    Bed,
    ClipboardCheck,
    CreditCard,
    FileCog,
    PlusCircle,
    Settings,
    Users
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePendingAllocations } from '../../../hooks/useHostel';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

interface ActionItemProps {
    icon: React.ElementType;
    label: string;
    description: string;
    onClick: () => void;
    gradient: string;
    textColor: string;
    badge?: number;
}

const ActionItem = ({ icon: Icon, label, description, onClick, gradient, textColor, badge }: ActionItemProps) => (
    <button
        onClick={onClick}
        className="group relative flex flex-col justify-between h-32 w-full p-5 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 hover:border-transparent text-left"
    >
        {/* Background Gradient on Hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${gradient}`} />

        <div className="flex justify-between items-start w-full relative z-10">
            <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-700/50 group-hover:bg-white dark:group-hover:bg-zinc-800 transition-colors duration-300 shadow-sm ${textColor}`}>
                <Icon className="h-6 w-6" />
            </div>
            {badge !== undefined && badge > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-800 animate-pulse">
                    {badge}
                </span>
            )}
            <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 ${textColor}`}>
                <ArrowRight className="h-5 w-5" />
            </div>
        </div>

        <div className="relative z-10 pt-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-md mb-0.5 group-hover:text-primary transition-colors">
                {label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                {description}
            </p>
        </div>
    </button>
);

export const HostelQuickActions = () => {
    const navigate = useNavigate();
    const { data: pendingData, isLoading } = usePendingAllocations();

    const pendingCount = pendingData?.count || 0;

    const actions = [
        {
            icon: PlusCircle,
            label: 'New Allocation',
            description: 'Assign room to student',
            onClick: () => navigate('/hostel/allocations?action=create'),
            gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
            textColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            icon: Bed,
            label: 'Manage Rooms',
            description: 'Beds & availability',
            onClick: () => navigate('/hostel/rooms'),
            gradient: 'bg-gradient-to-br from-emerald-400 to-teal-500',
            textColor: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            icon: CreditCard,
            label: 'Fees',
            description: 'Payments & dues',
            onClick: () => navigate('/hostel/fees'),
            gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
            textColor: 'text-violet-600 dark:text-violet-400',
        },
    ];

    if (isLoading) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse" />
                </CardHeader>
                <CardContent className="px-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-slate-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <FileCog className="h-5 w-5 text-primary" />
                        Quick Actions
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {actions.map((action, index) => (
                        <ActionItem
                            key={index}
                            {...action}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
