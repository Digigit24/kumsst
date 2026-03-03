/**
 * BedIndicator Component
 * Single bed status icon with visual state
 */

import { Bed, Wrench } from 'lucide-react';
import { cn } from '../../../lib/utils';

export type BedStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

interface BedIndicatorProps {
    status: BedStatus;
    bedNumber?: number;
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
    className?: string;
}

export const BedIndicator = ({
    status,
    bedNumber,
    size = 'md',
    showTooltip = true,
    className,
}: BedIndicatorProps) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    const statusConfig = {
        available: {
            bg: 'bg-muted',
            text: 'text-muted-foreground',
            icon: Bed,
            label: 'Available',
        },
        occupied: {
            bg: 'bg-primary',
            text: 'text-primary-foreground',
            icon: Bed,
            label: 'Occupied',
        },
        maintenance: {
            bg: 'bg-orange-100 dark:bg-orange-950/30',
            text: 'text-orange-600',
            icon: Wrench,
            label: 'Under Maintenance',
        },
        reserved: {
            bg: 'bg-blue-100 dark:bg-blue-950/30',
            text: 'text-blue-600',
            icon: Bed,
            label: 'Reserved',
        },
    };

    const config = statusConfig[status];
    const Icon = config.icon;
    const tooltipText = bedNumber
        ? `Bed ${bedNumber} - ${config.label}`
        : config.label;

    return (
        <div
            className={cn(
                'rounded-lg flex items-center justify-center transition-all',
                sizeClasses[size],
                config.bg,
                config.text,
                className
            )}
            title={showTooltip ? tooltipText : undefined}
        >
            <Icon className={iconSizes[size]} />
        </div>
    );
};
