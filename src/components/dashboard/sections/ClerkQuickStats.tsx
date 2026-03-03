import { motion } from 'framer-motion';
import {
    Clock,
    CreditCard,
    FileText,
    TrendingUp,
    Users
} from 'lucide-react';
import { useMemo } from 'react';
import useSWR from 'swr';
import { API_BASE_URL, API_ENDPOINTS, getDefaultHeaders } from '../../../config/api.config';
import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';

const fetcher = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    const headers = getDefaultHeaders();

    return fetch(fullUrl, { headers }).then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    });
};

export const ClerkQuickStats = () => {
    const { data: stats, isLoading } = useSWR(API_ENDPOINTS.stats.dashboard, fetcher);

    const statsData = useMemo(() => {
        const dashboardStats = Array.isArray(stats) ? stats[0] : stats;

        return [
            {
                title: "Total Students",
                value: isLoading ? "..." : (dashboardStats?.total_students || 0).toLocaleString(),
                trend: "+12",
                trendUp: true,
                icon: Users,
                color: "from-blue-500 to-indigo-500",
                shadow: "shadow-blue-500/20"
            },
            {
                title: "Fees Collected (MTD)",
                value: isLoading ? "..." : `₹${parseFloat(dashboardStats?.total_fee_collected_this_month || "0").toLocaleString()}`,
                trend: "+8.5%",
                trendUp: true,
                icon: CreditCard,
                color: "from-emerald-500 to-teal-500",
                shadow: "shadow-emerald-500/20"
            },
            {
                title: "Pending Documents",
                value: isLoading ? "..." : "24", // Placeholder if not in API
                trend: "-5",
                trendUp: false,
                icon: FileText,
                color: "from-orange-500 to-amber-500",
                shadow: "shadow-orange-500/20"
            },
            {
                title: "Active Requests",
                value: isLoading ? "..." : "12", // Placeholder if not in API
                trend: "Normal",
                trendUp: null,
                icon: Clock,
                color: "from-purple-500 to-pink-500",
                shadow: "shadow-purple-500/20"
            }
        ];
    }, [stats, isLoading]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {statsData.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-[0.08] group-hover:opacity-[0.12] transition-opacity`} />
                        <CardContent className="p-6 relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                                    <h3 className="text-3xl font-bold tracking-tight text-foreground">
                                        {isLoading ? <Skeleton className="h-8 w-24" /> : stat.value}
                                    </h3>
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-md ${stat.shadow} group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                {stat.trendUp !== null && (
                                    <Badge className={`${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} hover:opacity-100 border-none px-2 py-0.5`}>
                                        <TrendingUp className={`h-3 w-3 mr-1 ${stat.trendUp ? '' : 'rotate-180'}`} /> {stat.trend}
                                    </Badge>
                                )}
                                {stat.trendUp === null && (
                                    <Badge variant="secondary" className="px-2 py-0.5">
                                        {stat.trend}
                                    </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">vs last month</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};
