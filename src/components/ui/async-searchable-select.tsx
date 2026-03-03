/**
 * Async Searchable Select Component
 * A dropdown with server-side search functionality.
 * Unlike SearchableSelect which filters locally, this component
 * delegates filtering to the backend via the onSearch callback.
 */

import { Check, ChevronsUpDown, Loader2, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce, DEBOUNCE_DELAYS } from '../../hooks/useDebounce';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';
import { SkeletonDropdown } from './skeleton';

export interface AsyncSearchableSelectOption {
  value: number | string;
  label: string;
  subtitle?: string;
  disabled?: boolean;
}

interface AsyncSearchableSelectProps {
  /** Options returned from the server (managed by parent) */
  options: AsyncSearchableSelectOption[];
  /** Currently selected value */
  value?: number | string;
  /** Callback when selection changes */
  onChange: (value: number | string) => void;
  /**
   * Called when the debounced search query changes.
   * Parent should fetch from backend and update `options`.
   */
  onSearch: (query: string) => void;
  /**
   * The currently selected option object, used to preserve the
   * selected label even when the item is not in the current API results.
   */
  selectedOption?: AsyncSearchableSelectOption;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** True during initial data load (shows skeleton) */
  isLoading?: boolean;
  /** True while a search request is in-flight (shows inline spinner) */
  isSearching?: boolean;
  onCreate?: () => void;
  createLabel?: string;
  className?: string;
  /** Debounce delay in ms (default: 300) */
  debounceDelay?: number;
}

export function AsyncSearchableSelect({
  options,
  value,
  onChange,
  onSearch,
  selectedOption: selectedOptionProp,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  disabled = false,
  isLoading = false,
  isSearching = false,
  onCreate,
  createLabel = 'Create New',
  className,
  debounceDelay = DEBOUNCE_DELAYS.SEARCH,
}: AsyncSearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, debounceDelay);

  // Trigger server-side search when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  // Merge selectedOption into options so the label is always visible
  const displayOptions = useMemo(() => {
    if (!selectedOptionProp) return options;
    const existsInOptions = options.some(
      (o) => o.value == selectedOptionProp.value
    );
    return existsInOptions ? options : [selectedOptionProp, ...options];
  }, [options, selectedOptionProp]);

  // Resolve the display label for the trigger button
  const resolvedSelectedOption = useMemo(() => {
    if (selectedOptionProp && selectedOptionProp.value == value) {
      return selectedOptionProp;
    }
    return displayOptions.find((o) => o.value == value);
  }, [displayOptions, value, selectedOptionProp]);

  const handleSelect = (currentValue: number | string) => {
    onChange(currentValue);
    setOpen(false);
    setSearchQuery('');
  };

  const hasNoData = options.length === 0;

  // Show skeleton only on initial load with no data
  if (isLoading && hasNoData && !resolvedSelectedOption) {
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
            'w-full justify-between',
            !resolvedSelectedOption && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {resolvedSelectedOption
              ? resolvedSelectedOption.label
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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

        {/* Sticky Create Button under Search Bar */}
        {onCreate && (
          <div className="p-1 border-b">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-primary h-8 hover:bg-primary/5"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                onCreate();
              }}
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              {createLabel}
            </Button>
          </div>
        )}

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
                {displayOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    disabled={option.disabled}
                    onPointerDown={(e) => {
                      if (option.disabled) return;
                      e.preventDefault();
                      handleSelect(option.value);
                    }}
                    className={cn(
                      'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none',
                      option.disabled
                        ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground',
                      value == option.value && 'bg-accent'
                    )}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value == option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">{option.label}</span>
                      {option.subtitle && (
                        <span className="text-xs text-muted-foreground">
                          {option.subtitle}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
