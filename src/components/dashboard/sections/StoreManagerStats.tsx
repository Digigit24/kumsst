import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMaterialIssues, useStoreIndents, useStoreItems } from '@/hooks/useStore';
import { CheckCircle, ClipboardList, Package, Truck } from 'lucide-react';
import React from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    icon: React.ElementType;
    gradient: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subValue, icon: Icon, gradient }) => (
    <Card className="relative overflow-hidden border-none shadow-lg group">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground z-10">{title}</CardTitle>
            <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm ring-1 ring-black/5`}>
                <Icon className="h-4 w-4" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold tracking-tight z-10 relative">{value}</div>
            {subValue && (
                <p className="text-xs text-muted-foreground mt-1 z-10 relative font-medium">
                    {subValue}
                </p>
            )}
            <Icon className={`absolute -bottom-4 -right-4 h-24 w-24 opacity-[0.05] group-hover:opacity-[0.08] transition-all duration-500 rotate-12 text-black dark:text-white`} />
        </CardContent>
    </Card>
);

export const StoreManagerStats: React.FC = () => {
    // Fetch Real Data Only
    const { data: storeItems, isLoading: isItemsLoading } = useStoreItems({ page_size: 1 });
    const { data: pendingIndents, isLoading: isPendingLoading } = useStoreIndents({ status: 'pending_college_approval', page_size: 1 });
    const { data: approvedIndents, isLoading: isApprovedLoading } = useStoreIndents({ status: 'super_admin_approved', page_size: 1 });
    const { data: materialIssues, isLoading: isIssuesLoading } = useMaterialIssues({ page_size: 1 });

    const isLoading = isItemsLoading || isPendingLoading || isApprovedLoading || isIssuesLoading;

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Total Items"
                value={storeItems?.count || 0}
                subValue="Active unique items"
                icon={Package}
                gradient="from-blue-500 to-cyan-500"
            />
            <MetricCard
                title="Pending Indents"
                value={pendingIndents?.count || 0}
                subValue="Awaiting approval"
                icon={ClipboardList}
                gradient="from-amber-400 to-orange-500"
            />
            <MetricCard
                title="Ready for Dispatch"
                value={approvedIndents?.count || 0}
                subValue="Approved requests"
                icon={CheckCircle}
                gradient="from-emerald-500 to-teal-500"
            />
            <MetricCard
                title="Total Issues"
                value={materialIssues?.count || 0}
                subValue="Material issued so far"
                icon={Truck} // Using Truck icon for Material Issues as it relates to movement
                gradient="from-purple-500 to-indigo-600"
            />
        </div>
    );
};
