/**
 * Section Searchable Dropdown Component
 * Reusable searchable dropdown for selecting sections
 */

import { useSectionsFilteredByClass } from '../../hooks/useAcademicSWR';
import { Label } from '../ui/label';
import { SearchableSelect, SearchableSelectOption } from '../ui/searchable-select';
import { Users, AlertCircle } from 'lucide-react';

interface SectionSearchableDropdownProps {
    value?: number | null;
    onChange: (sectionId: number | null) => void;
    classId?: number | null; // Filter by class
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    className?: string;
}

export function SectionSearchableDropdown({
    value,
    onChange,
    classId,
    disabled = false,
    required = true,
    error,
    label = "Section",
    showLabel = true,
    placeholder = "Select section",
    className = "",
}: SectionSearchableDropdownProps) {
    // Prefetch all sections once, filter client-side by classId — instant switching
    const { results: sections = [], isLoading } = useSectionsFilteredByClass(classId);

    const handleChange = (selectedValue: string | number) => {
        onChange(selectedValue as number);
    };

    // Transform sections to SearchableSelectOption format
    const options: SearchableSelectOption[] = sections.map((section) => ({
        value: section.id,
        label: section.name,
        subtitle: `${section.class_name} • Max ${section.max_students} students`,
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
                searchPlaceholder="Search by section name..."
                emptyText="No sections found"
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
                    {classId
                      ? 'No sections available for selected class.'
                      : 'No sections available. Please select a class first or create sections.'}
                </p>
            )}
        </div>
    );
}
