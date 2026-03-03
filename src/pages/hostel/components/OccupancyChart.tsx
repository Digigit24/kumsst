/**
 * OccupancyChart Component
 * Pie/donut chart for occupancy visualization
 */

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';

interface OccupancyChartProps {
    occupiedBeds: number;
    availableBeds: number;
    maintenanceBeds?: number;
    title?: string;
    size?: 'sm' | 'md' | 'lg';
    type?: 'pie' | 'donut';
    showLegend?: boolean;
    className?: string;
}

export const OccupancyChart = ({
    occupiedBeds,
    availableBeds,
    maintenanceBeds = 0,
    title = 'Occupancy Overview',
    size = 'md',
    type = 'donut',
    showLegend = true,
    className,
}: OccupancyChartProps) => {
    const totalBeds = occupiedBeds + availableBeds + maintenanceBeds;
    const occupiedPercentage = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
    const availablePercentage = totalBeds > 0 ? (availableBeds / totalBeds) * 100 : 0;
    const maintenancePercentage = totalBeds > 0 ? (maintenanceBeds / totalBeds) * 100 : 0;

    const chartSize = {
        sm: 120,
        md: 160,
        lg: 200,
    }[size];

    const strokeWidth = type === 'donut' ? 20 : 0;
    const radius = (chartSize / 2) - (strokeWidth / 2);
    const circumference = 2 * Math.PI * radius;

    // Calculate stroke dash offsets for segments
    const occupiedDash = (occupiedPercentage / 100) * circumference;
    const availableDash = (availablePercentage / 100) * circumference;
    const maintenanceDash = (maintenancePercentage / 100) * circumference;

    const occupiedOffset = 0;
    const availableOffset = -occupiedDash;
    const maintenanceOffset = -(occupiedDash + availableDash);

    return (
        <Card className={cn('', className)}>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                {/* Chart */}
                <div className="relative" style={{ width: chartSize, height: chartSize }}>
                    <svg width={chartSize} height={chartSize} className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx={chartSize / 2}
                            cy={chartSize / 2}
                            r={radius}
                            fill={type === 'donut' ? 'transparent' : '#f3f4f6'}
                            stroke="#e5e7eb"
                            strokeWidth={strokeWidth}
                        />

                        {/* Maintenance segment */}
                        {maintenanceBeds > 0 && (
                            <circle
                                cx={chartSize / 2}
                                cy={chartSize / 2}
                                r={radius}
                                fill="transparent"
                                stroke="#f97316"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${maintenanceDash} ${circumference}`}
                                strokeDashoffset={maintenanceOffset}
                                strokeLinecap="round"
                            />
                        )}

                        {/* Available segment */}
                        {availableBeds > 0 && (
                            <circle
                                cx={chartSize / 2}
                                cy={chartSize / 2}
                                r={radius}
                                fill="transparent"
                                stroke="#22c55e"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${availableDash} ${circumference}`}
                                strokeDashoffset={availableOffset}
                                strokeLinecap="round"
                            />
                        )}

                        {/* Occupied segment */}
                        {occupiedBeds > 0 && (
                            <circle
                                cx={chartSize / 2}
                                cy={chartSize / 2}
                                r={radius}
                                fill="transparent"
                                stroke="#3b82f6"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${occupiedDash} ${circumference}`}
                                strokeDashoffset={occupiedOffset}
                                strokeLinecap="round"
                            />
                        )}
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-3xl font-bold">{Math.round(occupiedPercentage)}%</p>
                        <p className="text-xs text-muted-foreground">Occupied</p>
                    </div>
                </div>

                {/* Legend */}
                {showLegend && (
                    <div className="w-full space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span>Occupied</span>
                            </div>
                            <span className="font-semibold">{occupiedBeds} ({Math.round(occupiedPercentage)}%)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span>Available</span>
                            </div>
                            <span className="font-semibold">{availableBeds} ({Math.round(availablePercentage)}%)</span>
                        </div>
                        {maintenanceBeds > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                                    <span>Maintenance</span>
                                </div>
                                <span className="font-semibold">{maintenanceBeds} ({Math.round(maintenancePercentage)}%)</span>
                            </div>
                        )}
                        <div className="pt-2 border-t flex items-center justify-between text-sm font-semibold">
                            <span>Total Beds</span>
                            <span>{totalBeds}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
