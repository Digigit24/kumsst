/**
 * AllocationCard Component
 * Student allocation card with details
 */

import { format } from 'date-fns';
import { Bed, Building2, Calendar, User } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';

interface Allocation {
    id: number;
    student: number;
    student_name?: string;
    hostel: number;
    hostel_name?: string;
    room: number;
    room_number?: string;
    bed: number;
    bed_number?: string;
    from_date: string;
    to_date?: string;
    is_current: boolean;
    is_active: boolean;
}

interface AllocationCardProps {
    allocation: Allocation;
    onClick?: (allocation: Allocation) => void;
    showActions?: boolean;
    onApprove?: (allocation: Allocation) => void;
    onReject?: (allocation: Allocation) => void;
    className?: string;
}

export const AllocationCard = ({
    allocation,
    onClick,
    showActions = false,
    onApprove,
    onReject,
    className,
}: AllocationCardProps) => {
    const isPending = !allocation.is_current && allocation.is_active;

    return (
        <Card
            className={cn(
                'cursor-pointer hover:bg-muted/50 transition-colors',
                isPending && 'border-orange-200 bg-orange-50/30 dark:bg-orange-950/10',
                className
            )}
            onClick={() => onClick?.(allocation)}
        >
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className={cn(
                            'p-2 rounded-full',
                            isPending ? 'bg-orange-100 dark:bg-orange-950/30' : 'bg-primary/10'
                        )}>
                            <User className={cn(
                                'h-5 w-5',
                                isPending ? 'text-orange-600' : 'text-primary'
                            )} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">
                                {allocation.student_name || `Student #${allocation.student}`}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {allocation.hostel_name || `Hostel #${allocation.hostel}`}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Bed className="h-3 w-3" />
                                    Room {allocation.room_number || allocation.room}, Bed {allocation.bed_number || allocation.bed}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {allocation.from_date ? format(new Date(allocation.from_date), 'MMM dd, yyyy') : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isPending ? (
                            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                Pending
                            </Badge>
                        ) : (
                            <Badge variant={allocation.is_active ? 'default' : 'secondary'}>
                                {allocation.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
