/**
 * Central Store Dropdown Component
 * Reusable dropdown for selecting central stores in forms
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useCentralStores } from '../../hooks/useCentralStores';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Store, AlertCircle } from 'lucide-react';

interface CentralStoreDropdownProps {
    value?: number | string | null;
    onChange: (storeId: number | null) => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    className?: string;
}

export function CentralStoreDropdown({
    value,
    onChange,
    disabled = false,
    required = true,
    error,
    label = "Central Store",
    showLabel = true,
    placeholder = "Select central store",
    className = "",
}: CentralStoreDropdownProps) {
    const { data: storesData, isLoading } = useCentralStores({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

    const handleChange = (selectedValue: string) => {
        onChange(parseInt(selectedValue));
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {showLabel && <Label required={required}>{label}</Label>}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted">
                    <Store className="h-4 w-4 animate-pulse text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading stores...</span>
                </div>
            </div>
        );
    }

    const stores = storesData?.results || [];
    const selectedStore = stores.find(s => s.id === Number(value));

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
                        {selectedStore ? (
                            <div className="flex items-center gap-2">
                                <Store className="h-4 w-4" />
                                <span>{selectedStore.name}</span>
                            </div>
                        ) : null}
                    </SelectValue>
                </SelectTrigger>

                <SelectContent>
                    {stores.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                            No stores available
                        </div>
                    ) : (
                        stores.map((store) => (
                            <SelectItem key={store.id} value={store.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <Store className="h-4 w-4" />
                                    <div>
                                        <div className="font-medium">{store.name}</div>
                                        {store.description && (
                                            <div className="text-xs text-muted-foreground">
                                                {store.description}
                                            </div>
                                        )}
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
        </div>
    );
}
