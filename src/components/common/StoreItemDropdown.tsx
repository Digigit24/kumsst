/**
 * Store Item Dropdown Component
 * Reusable dropdown for selecting store items
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useStoreItems } from '../../hooks/useStoreItems';
import { Label } from '../ui/label';
import { SearchableSelect, SearchableSelectOption } from '../ui/searchable-select';
import { Package, AlertCircle } from 'lucide-react';

interface StoreItemDropdownProps {
    value?: number | string | null;
    onChange: (itemId: number | null) => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    className?: string;
}

export function StoreItemDropdown({
    value,
    onChange,
    disabled = false,
    required = true,
    error,
    label = "Store Item",
    showLabel = true,
    placeholder = "Select item",
    className = "",
}: StoreItemDropdownProps) {
    const { data: itemsData, isLoading } = useStoreItems({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

    const handleChange = (selectedValue: string | number) => {
        onChange(parseInt(selectedValue as string));
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {showLabel && <Label required={required}>{label}</Label>}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted">
                    <Package className="h-4 w-4 animate-pulse text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading items...</span>
                </div>
            </div>
        );
    }

    const items = itemsData?.results || [];

    const options: SearchableSelectOption[] = items.map((item) => ({
        value: item.id,
        label: item.name || `Item #${item.id}`,
        subtitle: item.category_name ? `Category: ${item.category_name}` : '',
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
                searchPlaceholder="Search items..."
                emptyText="No items found"
                disabled={disabled}
                className={error ? 'border-destructive' : ''}
            />

            {error && (
                <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}

            {items.length === 0 && !isLoading && (
                <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    No store items available. Please create items first.
                </p>
            )}
        </div>
    );
}
