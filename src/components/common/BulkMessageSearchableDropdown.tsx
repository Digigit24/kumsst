/**
 * Bulk Message Searchable Dropdown Component
 * Reusable searchable dropdown for selecting bulk messages
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useBulkMessages } from '../../hooks/useCommunication';
import { Label } from '../ui/label';
import { SearchableSelect, SearchableSelectOption } from '../ui/searchable-select';
import { Mail, AlertCircle } from 'lucide-react';

interface BulkMessageSearchableDropdownProps {
    value?: number | null;
    onChange: (bulkMessageId: number | null) => void;
    college?: number | null; // Filter by college
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    className?: string;
}

export function BulkMessageSearchableDropdown({
    value,
    onChange,
    college,
    disabled = false,
    required = false,
    error,
    label = "Bulk Message",
    showLabel = true,
    placeholder = "Select bulk message",
    className = "",
}: BulkMessageSearchableDropdownProps) {
    const filters: any = { page_size: DROPDOWN_PAGE_SIZE, is_active: true };

    if (college) {
        filters.college = college;
    }

    const { data: bulkMessagesData, isLoading } = useBulkMessages(filters);

    const handleChange = (selectedValue: string | number) => {
        onChange(selectedValue as number);
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {showLabel && <Label required={required}>{label}</Label>}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted">
                    <Mail className="h-4 w-4 animate-pulse text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading bulk messages...</span>
                </div>
            </div>
        );
    }

    const bulkMessages = bulkMessagesData?.results || [];

    // Transform bulk messages to SearchableSelectOption format
    const options: SearchableSelectOption[] = bulkMessages.map((message) => ({
        value: message.id,
        label: message.title,
        subtitle: `${message.message_type} • ${message.recipient_type} • ${message.status}`,
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
                searchPlaceholder="Search by title..."
                emptyText="No bulk messages found"
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
                    No bulk messages available. Please create one first.
                </p>
            )}
        </div>
    );
}
