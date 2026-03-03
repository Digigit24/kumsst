/**
 * RoomGrid Component
 * Visual room layout with bed indicators
 */

import { BedIndicator, BedStatus } from './BedIndicator';

interface Bed {
    id: number;
    bed_number: string;
    status: string;
}

interface RoomGridProps {
    capacity: number;
    occupiedBeds: number;
    beds?: Bed[];
    gridCols?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const RoomGrid = ({
    capacity,
    occupiedBeds,
    beds = [],
    gridCols = 4,
    size = 'md',
    className = '',
}: RoomGridProps) => {
    const getBedStatus = (index: number): BedStatus => {
        if (beds.length > 0 && beds[index]) {
            const bedStatus = beds[index].status?.toLowerCase();
            if (bedStatus === 'maintenance') return 'maintenance';
            if (bedStatus === 'reserved') return 'reserved';
        }
        return index < occupiedBeds ? 'occupied' : 'available';
    };

    const gridColsClass = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
    }[gridCols] || 'grid-cols-4';

    return (
        <div className={`grid ${gridColsClass} gap-2 ${className}`}>
            {Array.from({ length: capacity }).map((_, index) => {
                const bed = beds[index];
                const bedNumber = bed?.bed_number || `${index + 1}`;

                return (
                    <BedIndicator
                        key={index}
                        status={getBedStatus(index)}
                        bedNumber={parseInt(bedNumber)}
                        size={size}
                    />
                );
            })}
        </div>
    );
};
