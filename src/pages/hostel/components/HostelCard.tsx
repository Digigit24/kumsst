/**
 * HostelCard Component
 * Individual hostel card with occupancy progress
 */

import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { cn } from '../../../lib/utils';

interface Hostel {
    id: number;
    name: string;
    hostel_type?: string;
    hostel_type_display?: string;
    capacity?: number;
    is_active: boolean;
    total_beds?: number;
    occupied_beds?: number;
}

interface HostelCardProps {
    hostel: Hostel;
    onClick?: (hostel: Hostel) => void;
    showProgress?: boolean;
    className?: string;
}

export const HostelCard = ({
    hostel,
    onClick,
    showProgress = true,
    className,
}: HostelCardProps) => {
    const navigate = useNavigate();

    const totalBeds = hostel.total_beds || hostel.capacity || 0;
    const occupiedBeds = hostel.occupied_beds || 0;
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyPercentage = totalBeds > 0
        ? Math.round((occupiedBeds / totalBeds) * 100)
        : 0;

    const getOccupancyColor = (percentage: number) => {
        if (percentage >= 90) return 'text-red-600';
        if (percentage >= 70) return 'text-orange-600';
        if (percentage >= 50) return 'text-yellow-600';
        return 'text-green-600';
    };

    const handleClick = () => {
        if (onClick) {
            onClick(hostel);
        } else {
            navigate(`/hostel/hostels/${hostel.id}`);
        }
    };

    return (
        <Card
            className={cn(
                'cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
                className
            )}
            onClick={handleClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-primary/10">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{hostel.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {hostel.hostel_type_display || hostel.hostel_type || 'Standard'}
                            </p>
                        </div>
                    </div>
                    <Badge variant={hostel.is_active ? 'default' : 'secondary'}>
                        {hostel.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {showProgress && (
                    <>
                        {/* Occupancy Progress */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Occupancy</span>
                                <span className={cn('font-semibold', getOccupancyColor(occupancyPercentage))}>
                                    {occupancyPercentage}% Full
                                </span>
                            </div>
                            <Progress value={occupancyPercentage} className="h-2" />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <p className="text-xs text-muted-foreground">Occupied</p>
                                <p className="text-lg font-semibold">{occupiedBeds}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Available</p>
                                <p className="text-lg font-semibold text-green-600">{availableBeds}</p>
                            </div>
                        </div>

                        {/* Total Capacity */}
                        <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">Total Capacity</p>
                            <p className="text-lg font-bold">{totalBeds} Beds</p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
