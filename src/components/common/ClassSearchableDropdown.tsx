/**
 * Class Searchable Dropdown Component
 * Reusable searchable dropdown for selecting classes
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useClassesSWR } from '../../hooks/useAcademicSWR';
import { Label } from '../ui/label';
import { SearchableSelect, SearchableSelectOption } from '../ui/searchable-select';
import { GraduationCap, AlertCircle } from 'lucide-react';

interface ClassSearchableDropdownProps {
    value?: number | null;
    onChange: (classId: number | null) => void;
    college?: number | null;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    className?: string;
}

export function ClassSearchableDropdown({
    value,
    onChange,
    college,
    disabled = false,
    required = true,
    error,
    label = "Class",
    showLabel = true,
    placeholder = "Select class",
    className = "",
}: ClassSearchableDropdownProps) {
    const filters: any = { page_size: DROPDOWN_PAGE_SIZE, is_active: true };

    if (college) {
        filters.college = college;
    }

    const { results: classes = [], isLoading } = useClassesSWR(filters);

    const handleChange = (selectedValue: string | number) => {
        onChange(selectedValue as number);
    };

    // Transform classes to SearchableSelectOption format
    const options: SearchableSelectOption[] = classes.map((classItem) => ({
        value: classItem.id,
        label: classItem.name,
        subtitle: `${classItem.program_name} • Sem ${classItem.semester} • Year ${classItem.year}`,
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
                searchPlaceholder="Search by class name..."
                emptyText="No classes found"
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
                    No classes available. Please create one first.
                </p>
            )}
        </div>
    );
}
