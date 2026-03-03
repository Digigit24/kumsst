/**
 * Vendor/Supplier Dropdown Component
 * Reusable dropdown for selecting vendors/suppliers in forms
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useVendors } from '../../hooks/useStore';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Users, AlertCircle } from 'lucide-react';

interface VendorDropdownProps {
    value?: number | string | null;
    onChange: (vendorId: number | null) => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    className?: string;
}

export function VendorDropdown({
    value,
    onChange,
    disabled = false,
    required = false,
    error,
    label = "Supplier/Vendor",
    showLabel = true,
    placeholder = "Select supplier",
    className = "",
}: VendorDropdownProps) {
    const { data: vendorsData, isLoading } = useVendors({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

    const handleChange = (selectedValue: string) => {
        onChange(parseInt(selectedValue));
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {showLabel && <Label required={required}>{label}</Label>}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted">
                    <Users className="h-4 w-4 animate-pulse text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading vendors...</span>
                </div>
            </div>
        );
    }

    const vendors = vendorsData?.results || [];
    const selectedVendor = vendors.find(v => v.id === Number(value));

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
                        {selectedVendor ? (
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{selectedVendor.name}</span>
                            </div>
                        ) : null}
                    </SelectValue>
                </SelectTrigger>

                <SelectContent>
                    {vendors.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                            No vendors available
                        </div>
                    ) : (
                        vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <div>
                                        <div className="font-medium">{vendor.name}</div>
                                        {vendor.contact_person && (
                                            <div className="text-xs text-muted-foreground">
                                                Contact: {vendor.contact_person}
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
