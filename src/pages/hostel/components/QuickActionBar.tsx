/**
 * QuickActionBar Component
 * Common hostel action buttons
 */

import { ClipboardList, CreditCard, DoorClosed, FileText, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';

interface QuickAction {
    icon: React.ReactNode;
    label: string;
    description?: string;
    onClick: () => void;
    color?: string;
    badge?: number;
    disabled?: boolean;
}

interface QuickActionBarProps {
    pendingAllocations?: number;
    overdueFees?: number;
    showTitle?: boolean;
    layout?: 'horizontal' | 'grid';
    className?: string;
}

export const QuickActionBar = ({
    pendingAllocations = 0,
    overdueFees = 0,
    showTitle = true,
    layout = 'grid',
    className,
}: QuickActionBarProps) => {
    const navigate = useNavigate();

    const actions: QuickAction[] = [
        {
            icon: <UserPlus className="h-5 w-5" />,
            label: 'New Allocation',
            description: 'Allocate room to student',
            onClick: () => navigate('/hostel/allocations?action=create'),
            color: 'bg-blue-500 hover:bg-blue-600',
        },
        {
            icon: <ClipboardList className="h-5 w-5" />,
            label: 'Pending Requests',
            description: `${pendingAllocations} awaiting approval`,
            onClick: () => navigate('/hostel/allocations?filter=pending'),
            color: 'bg-orange-500 hover:bg-orange-600',
            badge: pendingAllocations,
        },
        {
            icon: <CreditCard className="h-5 w-5" />,
            label: 'Fee Status',
            description: `${overdueFees} overdue payments`,
            onClick: () => navigate('/hostel/fees?filter=overdue'),
            color: 'bg-green-500 hover:bg-green-600',
            badge: overdueFees,
        },
        {
            icon: <DoorClosed className="h-5 w-5" />,
            label: 'Room Management',
            description: 'Manage rooms & beds',
            onClick: () => navigate('/hostel/rooms'),
            color: 'bg-purple-500 hover:bg-purple-600',
        },
        {
            icon: <Users className="h-5 w-5" />,
            label: 'View Allocations',
            description: 'All room allocations',
            onClick: () => navigate('/hostel/allocations'),
            color: 'bg-indigo-500 hover:bg-indigo-600',
        },
        {
            icon: <FileText className="h-5 w-5" />,
            label: 'Reports',
            description: 'Generate reports',
            onClick: () => navigate('/hostel/reports'),
            color: 'bg-teal-500 hover:bg-teal-600',
        },
    ];

    const layoutClass = layout === 'horizontal'
        ? 'flex gap-2 overflow-x-auto'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

    return (
        <Card className={cn('', className)}>
            {showTitle && (
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
            )}
            <CardContent>
                <div className={layoutClass}>
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            className={cn(
                                'h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all relative',
                                layout === 'horizontal' && 'min-w-[200px]'
                            )}
                            onClick={action.onClick}
                            disabled={action.disabled}
                        >
                            {/* Badge */}
                            {action.badge !== undefined && action.badge > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full"
                                >
                                    {action.badge}
                                </Badge>
                            )}

                            {/* Icon */}
                            <div className={cn('p-2 rounded-lg text-white', action.color)}>
                                {action.icon}
                            </div>

                            {/* Label & Description */}
                            <div className="text-left">
                                <p className="font-semibold text-sm">{action.label}</p>
                                {action.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {action.description}
                                    </p>
                                )}
                            </div>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
