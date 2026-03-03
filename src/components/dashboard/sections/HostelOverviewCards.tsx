/**
 * Hostel Overview Cards Component
 * Premium, professional design for hostel statistics cards
 */

import {
    BedDouble,
    Building2,
    CreditCard,
    Phone,
    User,
    Users,
    Wallet
} from 'lucide-react';
import { useHostelDashboardStats } from '../../../hooks/useHostel';
import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Separator } from '../../ui/separator';

// Helper for detail items
const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: React.ReactNode }) => (
    <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Icon className="h-4 w-4" />
        </div>
        <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-sm font-semibold text-foreground truncate max-w-[120px]" title={String(value)}>
                {value || '-'}
            </p>
        </div>
    </div>
);

export const HostelOverviewCards = () => {
    const { data: stats, isLoading, error } = useHostelDashboardStats();

    // Loading State
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-[350px] animate-pulse bg-muted/20 border-none" />
                    ))}
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="p-6 text-center rounded-lg border border-red-200 bg-red-50 text-red-700">
                <p>Failed to load hostel data. Please refresh.</p>
            </div>
        );
    }

    const hostelList = stats?.hostels || [];

    // Empty State
    if (hostelList.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-12 text-center text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No hostels found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Hostel Facilities</h2>
                    <p className="text-muted-foreground text-sm">Overview of all campus accommodation units</p>
                </div>
                <Badge variant="secondary" className="px-3 py-1">
                    {hostelList.length} Units Active
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostelList.map((hostel) => {
                    const isFull = hostel.occupied_beds >= hostel.capacity;
                    const occupancyPercentage = hostel.occupancy_rate;
                    // Changed amber (orange) to violet for a cooler, professional look
                    const availabilityColor = isFull ? 'bg-rose-500' : (occupancyPercentage > 80 ? 'bg-violet-500' : 'bg-emerald-500');

                    return (
                        <Card
                            key={hostel.id}
                            className="group hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-zinc-900"
                        >
                            <CardContent className="p-0">
                                {/* Header Section */}
                                <div className="p-6 pb-4 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-zinc-800/20">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{hostel.name}</h3>
                                                <Badge variant="secondary" className="text-[10px] font-semibold tracking-wide">
                                                    {hostel.hostel_type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                <Building2 className="h-3.5 w-3.5" />
                                                {hostel.total_rooms} Room Units
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border-0 ${isFull ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'}`}
                                        >
                                            {isFull ? 'Occupied' : 'Available'}
                                        </Badge>
                                    </div>

                                    {/* Occupancy Indicator */}
                                    <div className="mt-6 mb-2 space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium mb-1">Current Occupancy</p>
                                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                                    {occupancyPercentage}%
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    {hostel.vacant_beds} Beds Free
                                                </p>
                                            </div>
                                        </div>
                                        <Progress value={occupancyPercentage} className="h-2 rounded-full" indicatorClassName={availabilityColor} />
                                    </div>
                                </div>

                                <Separator className="opacity-50" />

                                {/* Details Grid */}
                                <div className="p-5 grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <User className="h-3 w-3" /> Warden
                                        </p>
                                        <p className="text-sm font-medium truncate" title={hostel.warden_name || ''}>
                                            {hostel.warden_name || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <Phone className="h-3 w-3" /> Contact
                                        </p>
                                        <p className="text-sm font-medium font-mono text-slate-600 dark:text-slate-400">
                                            {hostel.contact_number || '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Financial Section */}
                                <div className="mx-5 mb-5 p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 rounded-md bg-white dark:bg-zinc-800 shadow-sm">
                                            <Wallet className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Collections</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-500">
                                                ₹{(hostel.total_fee_collected || 0).toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-emerald-600/80 font-medium">Collected</p>
                                        </div>
                                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-zinc-700" />
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-rose-600 dark:text-rose-500">
                                                ₹{(hostel.total_fee_due || 0).toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-rose-600/80 font-medium">Pending</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
