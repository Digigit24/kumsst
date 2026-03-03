/**
 * Message Template Searchable Dropdown Component
 * Reusable searchable dropdown for selecting message templates
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useMessageTemplates } from '../../hooks/useCommunication';
import { Label } from '../ui/label';
import { SearchableSelect, SearchableSelectOption } from '../ui/searchable-select';
import { FileText, AlertCircle } from 'lucide-react';

interface MessageTemplateSearchableDropdownProps {
    value?: number | null;
    onChange: (templateId: number | null) => void;
    messageType?: string; // Filter by message type
    category?: string; // Filter by category
    college?: number | null; // Filter by college
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    className?: string;
}

export function MessageTemplateSearchableDropdown({
    value,
    onChange,
    messageType,
    category,
    college,
    disabled = false,
    required = true,
    error,
    label = "Template",
    showLabel = true,
    placeholder = "Select template",
    className = "",
}: MessageTemplateSearchableDropdownProps) {
    const filters: any = { page_size: DROPDOWN_PAGE_SIZE, is_active: true };

    if (messageType) {
        filters.message_type = messageType;
    }

    if (category) {
        filters.category = category;
    }

    if (college) {
        filters.college = college;
    }

    const { data: templatesData, isLoading } = useMessageTemplates(filters);

    const handleChange = (selectedValue: string | number) => {
        onChange(selectedValue as number);
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {showLabel && <Label required={required}>{label}</Label>}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted">
                    <FileText className="h-4 w-4 animate-pulse text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading templates...</span>
                </div>
            </div>
        );
    }

    const templates = templatesData?.results || [];

    // Transform templates to SearchableSelectOption format
    const options: SearchableSelectOption[] = templates.map((template) => ({
        value: template.id,
        label: template.name,
        subtitle: `${template.code} • ${template.message_type}`.trim(),
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
                searchPlaceholder="Search by template name..."
                emptyText="No templates found"
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
                    No templates available. Please create one first.
                </p>
            )}
        </div>
    );
}
