/**
 * Category Dropdown Component
 * Reusable dropdown for selecting categories in forms
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useCategories } from '../../hooks/useStore';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Folder, AlertCircle } from 'lucide-react';

interface CategoryDropdownProps {
    value?: number | string | null;
    onChange: (categoryId: number | null) => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    className?: string;
}

export function CategoryDropdown({
    value,
    onChange,
    disabled = false,
    required = false,
    error,
    label = "Category",
    showLabel = true,
    placeholder = "Select category",
    className = "",
}: CategoryDropdownProps) {
    const { data: categoriesData, isLoading } = useCategories({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

    const handleChange = (selectedValue: string) => {
        onChange(parseInt(selectedValue));
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {showLabel && <Label required={required}>{label}</Label>}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted">
                    <Folder className="h-4 w-4 animate-pulse text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading categories...</span>
                </div>
            </div>
        );
    }

    const categories = categoriesData?.results || [];
    const selectedCategory = categories.find(c => c.id === Number(value));

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
                        {selectedCategory ? (
                            <div className="flex items-center gap-2">
                                <Folder className="h-4 w-4" />
                                <span>{selectedCategory.name}</span>
                            </div>
                        ) : null}
                    </SelectValue>
                </SelectTrigger>

                <SelectContent>
                    {categories.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                            No categories available
                        </div>
                    ) : (
                        categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <Folder className="h-4 w-4" />
                                    <div>
                                        <div className="font-medium">{category.name}</div>
                                        {category.description && (
                                            <div className="text-xs text-muted-foreground">
                                                {category.description}
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
