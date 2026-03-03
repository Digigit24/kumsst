/**
 * Event Searchable Dropdown Component
 * Reusable searchable dropdown for selecting events
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useEvents } from '../../hooks/useCommunication';
import { Label } from '../ui/label';
import { SearchableSelect, SearchableSelectOption } from '../ui/searchable-select';
import { Calendar, AlertCircle } from 'lucide-react';

interface EventSearchableDropdownProps {
    value?: number | null;
    onChange: (eventId: number | null) => void;
    college?: number | null; // Filter by college
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    className?: string;
}

export function EventSearchableDropdown({
    value,
    onChange,
    college,
    disabled = false,
    required = true,
    error,
    label = "Event",
    showLabel = true,
    placeholder = "Select event",
    className = "",
}: EventSearchableDropdownProps) {
    const filters: any = { page_size: DROPDOWN_PAGE_SIZE, is_active: true };

    if (college) {
        filters.college = college;
    }

    const { data: eventsData, isLoading } = useEvents(filters);

    const handleChange = (selectedValue: string | number) => {
        onChange(selectedValue as number);
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {showLabel && <Label required={required}>{label}</Label>}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted">
                    <Calendar className="h-4 w-4 animate-pulse text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading events...</span>
                </div>
            </div>
        );
    }

    const events = eventsData?.results || [];

    // Transform events to SearchableSelectOption format
    const options: SearchableSelectOption[] = events.map((event) => ({
        value: event.id,
        label: event.title,
        subtitle: `${event.venue} • ${new Date(event.event_date).toLocaleDateString()}`,
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
                searchPlaceholder="Search by event title..."
                emptyText="No events found"
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
                    No events available. Please create one first.
                </p>
            )}
        </div>
    );
}
