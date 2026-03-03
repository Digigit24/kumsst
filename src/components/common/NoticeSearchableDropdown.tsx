/**
 * Notice Searchable Dropdown Component
 * Reusable searchable dropdown for selecting notices
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useNotices } from '../../hooks/useCommunication';
import { Label } from '../ui/label';
import { SearchableSelect, SearchableSelectOption } from '../ui/searchable-select';
import { Bell, AlertCircle } from 'lucide-react';

interface NoticeSearchableDropdownProps {
    value?: number | null;
    onChange: (noticeId: number | null) => void;
    college?: number | null;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    className?: string;
}

export function NoticeSearchableDropdown({
    value,
    onChange,
    college,
    disabled = false,
    required = true,
    error,
    label = "Notice",
    showLabel = true,
    placeholder = "Select notice",
    className = "",
}: NoticeSearchableDropdownProps) {
    const filters: any = { page_size: DROPDOWN_PAGE_SIZE, is_active: true };

    if (college) {
        filters.college = college;
    }

    const { data: noticesData, isLoading } = useNotices(filters);

    const handleChange = (selectedValue: string | number) => {
        onChange(selectedValue as number);
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {showLabel && <Label required={required}>{label}</Label>}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted">
                    <Bell className="h-4 w-4 animate-pulse text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading notices...</span>
                </div>
            </div>
        );
    }

    const notices = noticesData?.results || [];

    // Transform notices to SearchableSelectOption format
    const options: SearchableSelectOption[] = notices.map((notice) => ({
        value: notice.id,
        label: notice.title,
        subtitle: notice.is_published ? 'Published' : 'Draft',
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
                searchPlaceholder="Search by notice title..."
                emptyText="No notices found"
                disabled={disabled}
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
                    No notices available. Please create one first.
                </p>
            )}
        </div>
    );
}
