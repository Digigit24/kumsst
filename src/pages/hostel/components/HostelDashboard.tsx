/**
 * HostelDashboard Component
 * Main hostel dashboard with comprehensive stats and overview
 */

import { Building2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { useHostelAllocations, useHostelFees, useHostels, useRooms } from '../../../hooks/useHostel';
import { cn } from '../../../lib/utils';
import { FeeProgressBar } from './FeeProgressBar';
import { HostelCard } from './HostelCard';
import { OccupancyChart } from './OccupancyChart';
import { QuickActionBar } from './QuickActionBar';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
    trend?: string;
    trendUp?: boolean;
    color?: string;
    className?: string;
}

const StatCard = ({
    title,
    value,
    icon,
    description,
    trend,
    trendUp,
    color = 'bg-primary',
    className,
}: StatCardProps) => {
    return (
        <Card className={cn('', className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className={cn('p-2 rounded-lg', color)}>
                        <div className="text-white">{icon}</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <div className={cn(
                        'flex items-center gap-1 text-xs mt-2',
                        trendUp ? 'text-green-600' : 'text-red-600'
                    )}>
                        <TrendingUp className={cn('h-3 w-3', !trendUp && 'rotate-180')} />
                        <span>{trend}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

interface HostelDashboardProps {
    className?: string;
}

export const HostelDashboard = ({ className }: HostelDashboardProps) => {
    // Fetch data
    const { data: hostelsData } = useHostels({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
    const { data: roomsData } = useRooms({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
    const { data: allocationsData } = useHostelAllocations({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
    const { data: feesData } = useHostelFees({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

    const hostels = hostelsData?.results || [];
    const rooms = roomsData?.results || [];
    const allocations = allocationsData?.results || [];
    const fees = feesData?.results || [];

    // Calculate statistics
    const totalHostels = hostels.length;
    const totalBeds = rooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
    const occupiedBeds = rooms.reduce((sum, room) => sum + (room.occupied_beds || 0), 0);
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const pendingAllocations = allocations.filter(a => !a.is_current && a.is_active).length;

    const totalFees = fees.length;
    const paidFees = fees.filter(f => f.is_paid).length;
    const feeCollectionRate = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0;

    const totalAmount = fees.reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
    const paidAmount = fees.filter(f => f.is_paid).reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
    const pendingAmount = totalAmount - paidAmount;

    // Group fees by hostel for progress bars
    const feesByHostel = fees.reduce((acc, fee) => {
        const allocation = allocations.find(a => a.id === fee.allocation);
        if (!allocation) return acc;

        const hostelId = allocation.hostel;
        const hostelName = allocation.hostel_name || `Hostel #${hostelId}`;

        if (!acc[hostelId]) {
            acc[hostelId] = {
                hostelName,
                totalAmount: 0,
                paidAmount: 0,
                pendingAmount: 0,
                totalFees: 0,
                paidFees: 0,
            };
        }

        acc[hostelId].totalAmount += parseFloat(fee.amount || '0');
        acc[hostelId].totalFees++;
        if (fee.is_paid) {
            acc[hostelId].paidAmount += parseFloat(fee.amount || '0');
            acc[hostelId].paidFees++;
        } else {
            acc[hostelId].pendingAmount += parseFloat(fee.amount || '0');
        }

        return acc;
    }, {} as Record<number, any>);

    return (
        <div className={cn('space-y-6', className)}>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Hostels"
                    value={totalHostels}
                    icon={<Building2 className="h-4 w-4" />}
                    description="Active hostel facilities"
                    color="bg-blue-500"
                />
                <StatCard
                    title="Available Beds"
                    value={availableBeds}
                    icon={<Building2 className="h-4 w-4" />}
                    description={`${totalBeds} total beds`}
                    color="bg-green-500"
                />
                <StatCard
                    title="Occupancy Rate"
                    value={`${occupancyRate}%`}
                    icon={<Building2 className="h-4 w-4" />}
                    description={`${occupiedBeds} beds occupied`}
                    color={occupancyRate >= 80 ? 'bg-orange-500' : 'bg-purple-500'}
                />
                <StatCard
                    title="Fee Collection"
                    value={`${feeCollectionRate}%`}
                    icon={<Building2 className="h-4 w-4" />}
                    description={`₹${paidAmount.toLocaleString()} collected`}
                    color="bg-teal-500"
                />
            </div>

            {/* Quick Actions */}
            <QuickActionBar
                pendingAllocations={pendingAllocations}
                overdueFees={fees.filter(f => !f.is_paid && f.due_date).length}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Occupancy Chart */}
                <div className="lg:col-span-1">
                    <OccupancyChart
                        occupiedBeds={occupiedBeds}
                        availableBeds={availableBeds}
                        maintenanceBeds={0}
                        title="Overall Occupancy"
                    />
                </div>

                {/* Fee Collection by Hostel */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fee Collection by Hostel</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Object.values(feesByHostel).map((hostelFee: any, index) => (
                                <FeeProgressBar
                                    key={index}
                                    hostelName={hostelFee.hostelName}
                                    totalAmount={hostelFee.totalAmount}
                                    paidAmount={hostelFee.paidAmount}
                                    pendingAmount={hostelFee.pendingAmount}
                                    totalFees={hostelFee.totalFees}
                                    paidFees={hostelFee.paidFees}
                                />
                            ))}
                            {Object.keys(feesByHostel).length === 0 && (
                                <p className="text-center text-muted-foreground py-8">
                                    No fee records available
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Hostel Cards */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Hostels Overview</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hostels.map((hostel) => (
                        <HostelCard key={hostel.id} hostel={hostel} />
                    ))}
                    {hostels.length === 0 && (
                        <Card className="col-span-full">
                            <CardContent className="p-12 text-center">
                                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Hostels Found</h3>
                                <p className="text-muted-foreground">
                                    Create your first hostel to get started
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
