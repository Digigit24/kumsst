
import apiClient from '@/api/apiClient';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { isSuperAdmin } from '@/utils/auth.utils';
import { useSuperAdminContext } from '@/contexts/SuperAdminContext';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Lock } from 'lucide-react';

interface College {
    id: number;
    name: string;
    code: string;
}

interface CollegeFieldProps {
    value: number | string | null;
    onChange: (value: number | string) => void;
    error?: string;
    label?: string;
    required?: boolean;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

export const CollegeField: React.FC<CollegeFieldProps> = ({
    value,
    onChange,
    error,
    label = "College",
    required = true,
    className,
    placeholder = "Select college",
    disabled
}) => {
    const { user } = useAuth();
    const isSuper = isSuperAdmin(user);
    const { selectedCollege: globalCollege, isSuperAdminUser } = useSuperAdminContext();

    // Fetch colleges only if user is super admin
    const { data: collegesData, isLoading } = useQuery({
        queryKey: ['colleges-list'],
        queryFn: async () => {
            const response = await apiClient.get('/api/v1/core/colleges/');
            return response.data;
        },
        enabled: isSuper,
        staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    });

    // Extract results array if paginated
    const colleges: College[] = collegesData?.results || collegesData || [];

    // Auto-sync with global college selection
    useEffect(() => {
        if (isSuperAdminUser && globalCollege !== null && globalCollege !== value) {
            onChange(globalCollege);
        }
    }, [globalCollege, isSuperAdminUser]);

    // Don't render anything if not super admin
    if (!isSuper) return null;

    const hasGlobalSelection = isSuperAdminUser && globalCollege !== null;

    return (
        <div className={className}>
            <Label className="mb-2 block">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <Select
                value={value?.toString()}
                onValueChange={(v) => onChange(Number(v))}
                disabled={disabled || hasGlobalSelection}
            >
                <SelectTrigger className={error ? "border-destructive" : ""}>
                    <SelectValue placeholder={isLoading ? "Loading colleges..." : placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {colleges.map((college) => (
                        <SelectItem key={college.id} value={college.id.toString()}>
                            {college.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {hasGlobalSelection && (
                <p className="text-xs text-primary flex items-center gap-1 mt-1">
                    <Lock className="h-3 w-3" />
                    College locked to header selection
                </p>
            )}
            {error && <p className="text-sm font-medium text-destructive mt-1">{error}</p>}
        </div>
    );
};
