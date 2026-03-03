import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../../lib/utils';
import { Badge } from './badge';
import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';
import { SkeletonDropdown } from './skeleton';

export interface MultiSearchableSelectOption {
    value: string | number;
    label: string;
    subtitle?: string;
    disabled?: boolean;
}

interface MultiSearchableSelectProps {
    options: MultiSearchableSelectOption[];
    value: (string | number)[];
    onChange: (value: (string | number)[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
}

export function MultiSearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select options...',
    searchPlaceholder = 'Search...',
    emptyText = 'No results found.',
    disabled = false,
    isLoading = false,
    className,
}: MultiSearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Selected options map for fast lookup
    const selectedValuesSet = useMemo(() => new Set(value), [value]);

    // Selected options data
    const selectedOptions = useMemo(
        () => options.filter((option) => selectedValuesSet.has(option.value)),
        [options, selectedValuesSet]
    );

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options;

        const query = searchQuery.toLowerCase();
        return options.filter(
            (option) =>
                option.label.toLowerCase().includes(query) ||
                option.subtitle?.toLowerCase().includes(query)
        );
    }, [options, searchQuery]);

    const toggleOption = (currentValue: string | number) => {
        const isSelected = selectedValuesSet.has(currentValue);
        if (isSelected) {
            onChange(value.filter((v: string | number) => v !== currentValue));
        } else {
            onChange([...value, currentValue]);
        }
    };

    const removeOption = (e: React.MouseEvent<any>, optionValue: string | number) => {
        e.stopPropagation();
        onChange(value.filter((v: string | number) => v !== optionValue));
    };

    const hasNoData = options.length === 0;

    if (isLoading && hasNoData && selectedOptions.length === 0) {
        return <SkeletonDropdown className={className} />;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'w-full justify-between h-auto min-h-10 py-1.5 px-3',
                        selectedOptions.length === 0 && 'text-muted-foreground',
                        className
                    )}
                    disabled={disabled}
                >
                    <div className="flex flex-wrap gap-1 items-center flex-1 max-w-full overflow-hidden text-left">
                        {selectedOptions.length > 0 ? (
                            selectedOptions.map((opt) => (
                                <Badge
                                    key={opt.value}
                                    variant="secondary"
                                    className="rounded-sm px-1 font-normal max-w-full relative group"
                                >
                                    <span className="truncate max-w-[150px] inline-block align-bottom">{opt.label}</span>
                                    <button
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted-foreground/20 p-0.5 inline-flex items-center justify-center transition-colors"
                                        onPointerDown={(e) => {
                                            e.preventDefault();
                                            removeOption(e as any, opt.value);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Remove {opt.label}</span>
                                    </button>
                                </Badge>
                            ))
                        ) : (
                            <span className="truncate">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-none" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <div className="flex items-center border-b px-3 py-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                <ScrollArea className="h-[300px]">
                    <div className="p-1">
                        {isLoading ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                                <p>Loading options...</p>
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                                <p>{emptyText}</p>
                            </div>
                        ) : (
                            <>
                                {filteredOptions.map((option) => {
                                    const isSelected = selectedValuesSet.has(option.value);
                                    return (
                                        <button
                                            type="button"
                                            key={option.value}
                                            disabled={option.disabled}
                                            onPointerDown={(e) => {
                                                if (option.disabled) return;
                                                e.preventDefault();
                                                toggleOption(option.value);
                                            }}
                                            className={cn(
                                                'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none',
                                                option.disabled
                                                    ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                                                    : 'hover:bg-accent hover:text-accent-foreground',
                                                isSelected && 'bg-accent/50 text-accent-foreground'
                                            )}
                                        >
                                            <div className="flex items-center justify-center mr-2 h-4 w-4 flex-shrink-0">
                                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                                            </div>
                                            <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                                <span className="font-medium truncate w-full">{option.label}</span>
                                                {option.subtitle && (
                                                    <span className="text-xs text-muted-foreground truncate w-full">
                                                        {option.subtitle}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
