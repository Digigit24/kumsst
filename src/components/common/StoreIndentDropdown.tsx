/**
 * Store Indent Dropdown Component
 * Reusable dropdown for selecting store indents
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useStoreIndents } from '../../hooks/useStoreIndents';
import { Label } from '../ui/label';
import { SearchableSelect, SearchableSelectOption } from '../ui/searchable-select';
import { FileText, AlertCircle } from 'lucide-react';

interface StoreIndentDropdownProps {
    value?: number | string | null;
    onChange: (indentId: number | null) => void;
    status?: string; // Filter by status
    college?: number; // Filter by college
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    className?: string;
}

export function StoreIndentDropdown({
    value,
    onChange,
    status,
    college,
    disabled = false,
    required = true,
    error,
    label = "Store Indent",
    showLabel = true,
    placeholder = "Select indent",
    className = "",
}: StoreIndentDropdownProps) {
    const filters: any = { page_size: DROPDOWN_PAGE_SIZE, is_active: true };

    if (status) {
        filters.status = status;
    }
    if (college) {
        filters.college = college;
    }

    const { data: indentsData, isLoading } = useStoreIndents(filters);

    const handleChange = (selectedValue: string | number) => {
        onChange(parseInt(selectedValue as string));
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {showLabel && <Label required={required}>{label}</Label>}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted">
                    <FileText className="h-4 w-4 animate-pulse text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading indents...</span>
                </div>
            </div>
        );
    }

    const indents = indentsData?.results || [];

    const options: SearchableSelectOption[] = indents.map((indent) => ({
        value: indent.id,
        label: indent.indent_number || `Indent #${indent.id}`,
        subtitle: `Status: ${indent.status?.replace(/_/g, ' ')} • Priority: ${indent.priority}`,
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
                value={value?.toString() || undefined}
                onChange={handleChange}
                placeholder={placeholder}
                searchPlaceholder="Search indents..."
                emptyText={status ? `No indents with status "${status}"` : "No indents found"}
                disabled={disabled}
                className={error ? 'border-destructive' : ''}
            />

            {error && (
                <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}

            {indents.length === 0 && !isLoading && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {status
                        ? `No indents found with status "${status}". Please approve indents first.`
                        : 'No indents available. Please create indents first.'
                    }
                </p>
            )}
        </div>
    );
}
