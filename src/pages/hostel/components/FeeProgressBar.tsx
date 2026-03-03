/**
 * FeeProgressBar Component
 * Hostel-wise fee collection progress bar
 */

import { TrendingDown, TrendingUp } from 'lucide-react';
import { Progress } from '../../../components/ui/progress';
import { cn } from '../../../lib/utils';

interface FeeProgressBarProps {
    hostelName: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    totalFees: number;
    paidFees: number;
    showDetails?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const FeeProgressBar = ({
    hostelName,
    totalAmount,
    paidAmount,
    pendingAmount,
    totalFees,
    paidFees,
    showDetails = true,
    size = 'md',
    className,
}: FeeProgressBarProps) => {
    const collectionRate = totalAmount > 0
        ? Math.round((paidAmount / totalAmount) * 100)
        : 0;

    const progressHeight = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    }[size];

    const getStatusColor = (rate: number) => {
        if (rate >= 90) return 'text-green-600';
        if (rate >= 70) return 'text-blue-600';
        if (rate >= 50) return 'text-orange-600';
        return 'text-red-600';
    };

    const getStatusIcon = (rate: number) => {
        if (rate >= 70) return <TrendingUp className="h-4 w-4 text-green-600" />;
        return <TrendingDown className="h-4 w-4 text-red-600" />;
    };

    return (
        <div className={cn('space-y-2', className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{hostelName}</h4>
                    {getStatusIcon(collectionRate)}
                </div>
                <span className={cn('font-bold text-sm', getStatusColor(collectionRate))}>
                    {collectionRate}%
                </span>
            </div>

            {/* Progress Bar */}
            <Progress value={collectionRate} className={progressHeight} />

            {/* Details */}
            {showDetails && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span>
                            <span className="font-semibold text-green-600">₹{paidAmount.toLocaleString()}</span> collected
                        </span>
                        <span>
                            <span className="font-semibold text-orange-600">₹{pendingAmount.toLocaleString()}</span> pending
                        </span>
                    </div>
                    <span>
                        {paidFees}/{totalFees} fees
                    </span>
                </div>
            )}
        </div>
    );
};
