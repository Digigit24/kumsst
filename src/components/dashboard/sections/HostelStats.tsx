import {
    Activity,
    BedDouble,
    Building2,
    Landmark,
    TrendingUp
} from 'lucide-react';
import React from 'react';
import { useHostelDashboardStats } from '../../../hooks/useHostel';
import { Card, CardContent } from '../../ui/card';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    gradient: string;
    iconColor: string;
    delay?: number;
}

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    gradient,
    iconColor,
    delay = 0
}: StatCardProps) => (
    <Card
        className="relative overflow-hidden border-none shadow-lg bg-white dark:bg-zinc-900 group hover:-translate-y-1 transition-all duration-300"
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Background Gradient Blob */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${gradient}`} />

        <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-black/5 ${iconColor}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            <div className="space-y-1 mb-4">
                <h3 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:scale-105 origin-left transition-transform duration-300">
                    {value}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {title}
                </p>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className={`p-1 rounded-full ${gradient} bg-opacity-20`}>
                    <TrendingUp className="h-3 w-3 text-slate-600 dark:text-slate-300" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {subtitle}
                </span>
            </div>
        </CardContent>
    </Card>
);

export const HostelStats = () => {
    const { data: stats, isLoading } = useHostelDashboardStats();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse border-none shadow-md bg-white dark:bg-zinc-900 h-48">
                        <CardContent className="p-6">
                            <div className="h-12 w-12 bg-slate-100 dark:bg-zinc-800 rounded-xl mb-6" />
                            <div className="space-y-3">
                                <div className="h-8 w-24 bg-slate-100 dark:bg-zinc-800 rounded" />
                                <div className="h-4 w-32 bg-slate-100 dark:bg-zinc-800 rounded" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Total Hostels"
                value={stats.total_hostels}
                subtitle={`${stats.total_capacity.toLocaleString()} Total Capacity`}
                icon={Building2}
                gradient="bg-blue-500"
                iconColor="text-blue-600"
                delay={0}
            />

            <StatCard
                title="Occupancy"
                value={`${stats.overall_occupancy_rate}%`}
                subtitle={`${stats.total_occupied} / ${stats.total_beds} Beds Occupied`}
                icon={BedDouble}
                gradient="bg-emerald-500"
                iconColor="text-emerald-600"
                delay={100}
            />

            <StatCard
                title="Total Students"
                value={stats.total_students}
                subtitle="Active Residents"
                icon={Activity}
                gradient="bg-violet-500"
                iconColor="text-violet-600"
                delay={200}
            />

            <StatCard
                title="Fees Collected"
                value={`₹${(stats.total_fee_collected || 0).toLocaleString()}`}
                subtitle={`₹${(stats.total_fee_due || 0).toLocaleString()} Due`}
                icon={Landmark}
                gradient="bg-rose-500"
                iconColor="text-rose-600"
                delay={300}
            />
        </div>
    );
};
