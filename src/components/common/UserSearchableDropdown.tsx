/**
 * User Searchable Dropdown Component
 * Reusable searchable dropdown for selecting users (managers, staff, etc.)
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useUsers } from '../../hooks/useAccounts';
import { Label } from '../ui/label';
import { SearchableSelect, SearchableSelectOption } from '../ui/searchable-select';
import { User, AlertCircle } from 'lucide-react';

interface UserSearchableDropdownProps {
    value?: string | null;
    onChange: (userId: string | null) => void;
    userType?: string; // Filter by user type: 'teacher', 'staff', 'college_admin', etc.
    college?: number | null; // Filter by college
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    className?: string;
}

export function UserSearchableDropdown({
    value,
    onChange,
    userType,
    college,
    disabled = false,
    required = true,
    error,
    label = "User",
    showLabel = true,
    placeholder = "Select user",
    className = "",
}: UserSearchableDropdownProps) {
    const filters: any = { page_size: DROPDOWN_PAGE_SIZE, is_active: true };

    if (userType) {
        filters.user_type = userType;
    }

    if (college) {
        filters.college = college;
    }

    const { data: usersData, isLoading } = useUsers(filters);

    const handleChange = (selectedValue: string | number) => {
        onChange(selectedValue as string);
    };

    const users = usersData?.results || [];

    // Transform users to SearchableSelectOption format
    const options: SearchableSelectOption[] = users.map((user) => ({
        value: user.id,
        label: user.full_name || user.username || `User #${user.id}`,
        subtitle: `${user.email || ''} ${user.user_type_display ? `• ${user.user_type_display}` : ''}`.trim(),
    }));

    return (
        <div className={`space-y-2 ${className}`}>
            {showLabel && (
                <Label required={required}>
                    {label}
                </Label>
            )}

            <SearchableSelect
                options={options}
                value={value || undefined}
                onChange={handleChange}
                placeholder={placeholder}
                searchPlaceholder="Search by name or email..."
                emptyText={
                    userType
                        ? `No ${userType.replace('_', ' ')}s found`
                        : 'No users found'
                }
                disabled={disabled}
                isLoading={isLoading}
                className={error ? 'border-destructive' : ''}
            />

            {/* Error message */}
            {error && (
                <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}

            {/* Helper text */}
            {options.length === 0 && !isLoading && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {userType
                        ? `No ${userType.replace('_', ' ')}s available. Please create one first.`
                        : 'No users available. Please create one first.'}
                </p>
            )}
        </div>
    );
}
