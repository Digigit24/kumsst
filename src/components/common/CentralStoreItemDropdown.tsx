/**
 * Central Store Item Dropdown Component
 * Reusable dropdown for selecting central store items in forms
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { AlertCircle, Package } from 'lucide-react';
import { useCentralInventory } from '../../hooks/useCentralInventory';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface CentralStoreItemDropdownProps {
    value?: number | string | null;
    onChange: (itemId: number | null) => void;
    centralStoreId?: number | null;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    className?: string;
}

export function CentralStoreItemDropdown({
    value,
    onChange,
    centralStoreId,
    disabled = false,
    required = true,
    error,
    label = "Central Store Item",
    showLabel = true,
    placeholder = "Select item",
    className = "",
}: CentralStoreItemDropdownProps) {
    const filters: any = { page_size: DROPDOWN_PAGE_SIZE, is_active: true };
    if (centralStoreId) {
        filters.central_store = centralStoreId;
    }

    const { data: itemsData, isLoading } = useCentralInventory(filters);

    const handleChange = (selectedValue: string) => {
        onChange(parseInt(selectedValue));
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
    const selectedItem = items.find(i => i.id === Number(value));

    return (
        <div className={`space-y-2 ${className}`}>
            {showLabel && (
                <Label required={required}>
                    {label}
                </Label>
            )}

            <Select
                value={value?.toString()}
                onValueChange={handleChange}
                disabled={disabled}
            >
                <SelectTrigger className={error ? 'border-destructive' : ''}>
                    <SelectValue placeholder={placeholder}>
                        {selectedItem ? (
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                <span>{selectedItem.item_display || selectedItem.item_name || `Item #${selectedItem.id}`}</span>
                            </div>
                        ) : null}
                    </SelectValue>
                </SelectTrigger>

                <SelectContent>
                    {items.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                            {centralStoreId ? 'No items available for this store' : 'No items available'}
                        </div>
                    ) : (
                        items.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <div>
                                        <div className="font-medium">
                                            {item.item_display || item.item_name || `Item #${item.id}`}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Available: {item.quantity_available || 0} {item.unit || 'units'}
                                        </div>
                                    </div>
                                </div>
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>

            {/* Error message */}
            {error && (
                <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}

            {/* Helper text */}
            {items.length === 0 && !isLoading && (
                <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    No central store items available. Please ask Super Admin to add items to Central Inventory first.
                </p>
            )}
            {centralStoreId && items.length > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Showing items from selected store
                </p>
            )}
        </div>
    );
}
