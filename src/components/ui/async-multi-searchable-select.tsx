/**
 * Async Multi Searchable Select Component
 * A multi-select dropdown with server-side search functionality.
 * Unlike MultiSearchableSelect which filters locally, this component
 * delegates filtering to the backend via the onSearch callback.
 */

import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce, DEBOUNCE_DELAYS } from '../../hooks/useDebounce';
import { cn } from '../../lib/utils';
import { Badge } from './badge';
import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';
import { SkeletonDropdown } from './skeleton';

export interface AsyncMultiSearchableSelectOption {
  value: string | number;
  label: string;
  subtitle?: string;
  disabled?: boolean;
}

interface AsyncMultiSearchableSelectProps {
  /** Options returned from the server (managed by parent) */
  options: AsyncMultiSearchableSelectOption[];
  /** Currently selected values */
  value: (string | number)[];
  /** Callback when selection changes */
  onChange: (value: (string | number)[]) => void;
  /**
   * Called when the debounced search query changes.
   * Parent should fetch from backend and update `options`.
   */
  onSearch: (query: string) => void;
  /**
   * The currently selected option objects, used to preserve
   * selected labels even when items are not in the current API results.
   */
  selectedOptions?: AsyncMultiSearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** True during initial data load (shows skeleton) */
  isLoading?: boolean;
  /** True while a search request is in-flight (shows inline spinner) */
  isSearching?: boolean;
  className?: string;
  /** Debounce delay in ms (default: 300) */
  debounceDelay?: number;
}

export function AsyncMultiSearchableSelect({
  options,
  value,
  onChange,
  onSearch,
  selectedOptions: selectedOptionsProp,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  disabled = false,
  isLoading = false,
  isSearching = false,
  className,
  debounceDelay = DEBOUNCE_DELAYS.SEARCH,
}: AsyncMultiSearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, debounceDelay);

  // Trigger server-side search when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const selectedValuesSet = useMemo(() => new Set(value), [value]);

  // Merge selectedOptions into options so labels are always visible
  const displayOptions = useMemo(() => {
    if (!selectedOptionsProp || selectedOptionsProp.length === 0)
      return options;
    const existingValues = new Set(options.map((o) => o.value));
    const missing = selectedOptionsProp.filter(
      (o) => !existingValues.has(o.value)
    );
    return [...missing, ...options];
  }, [options, selectedOptionsProp]);

  // Resolve selected option objects for the trigger badges
  const resolvedSelectedOptions = useMemo(() => {
    const fromProps = selectedOptionsProp || [];
    const fromPropsMap = new Map(fromProps.map((o) => [o.value, o]));
    const fromOptionsMap = new Map(displayOptions.map((o) => [o.value, o]));

    return value
      .map(
        (v) =>
          fromPropsMap.get(v) ||
          fromOptionsMap.get(v) || { value: v, label: String(v) }
      );
  }, [value, selectedOptionsProp, displayOptions]);

  const toggleOption = (currentValue: string | number) => {
    const isSelected = selectedValuesSet.has(currentValue);
    if (isSelected) {
      onChange(value.filter((v) => v !== currentValue));
    } else {
      onChange([...value, currentValue]);
    }
  };

  const removeOption = (
    e: React.MouseEvent<unknown>,
    optionValue: string | number
  ) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const hasNoData = options.length === 0;

  if (isLoading && hasNoData && resolvedSelectedOptions.length === 0) {
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
            resolvedSelectedOptions.length === 0 && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 items-center flex-1 max-w-full overflow-hidden text-left">
            {resolvedSelectedOptions.length > 0 ? (
              resolvedSelectedOptions.map((opt) => (
                <Badge
                  key={opt.value}
                  variant="secondary"
                  className="rounded-sm px-1 font-normal max-w-full relative group"
                >
                  <span className="truncate max-w-[150px] inline-block align-bottom">
                    {opt.label}
                  </span>
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted-foreground/20 p-0.5 inline-flex items-center justify-center transition-colors"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      removeOption(e as unknown as React.MouseEvent<unknown>, opt.value);
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
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {isSearching && (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
          )}
        </div>

        <ScrollArea className="h-[300px]">
          <div className="p-1">
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                <p>Loading options...</p>
              </div>
            ) : displayOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <p>{emptyText}</p>
              </div>
            ) : (
              <>
                {displayOptions.map((option) => {
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
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-col items-start text-left flex-1 min-w-0">
                        <span className="font-medium truncate w-full">
                          {option.label}
                        </span>
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
