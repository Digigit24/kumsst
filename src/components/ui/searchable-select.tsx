/**
 * Searchable Select Component
 * A dropdown with search functionality for selecting items from a large list
 */

import { Check, ChevronsUpDown, Loader2, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';
import { SkeletonDropdown } from './skeleton';

export interface SearchableSelectOption {
  value: number | string;
  label: string;
  subtitle?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: number | string;
  onChange: (value: number | string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onCreate?: () => void;
  createLabel?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  disabled = false,
  isLoading = false,
  onCreate,
  createLabel = 'Create New',
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find selected option
  const selectedOption = useMemo(
    () => options.find((option) => option.value == value),
    [options, value]
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

  const handleSelect = (currentValue: number | string) => {
    onChange(currentValue);
    setOpen(false);
    setSearchQuery('');
  };

  const hasNoData = options.length === 0;

  // Show loading skeleton ONLY when loading AND there's no cached data
  // If we have cached options, show them instantly (stale-while-revalidate)
  if (isLoading && hasNoData && !selectedOption) {
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
            !selectedOption && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
            ) : filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <p>{emptyText}</p>
              </div>
            ) : (
              <>
                {filteredOptions.map((option) => (
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
