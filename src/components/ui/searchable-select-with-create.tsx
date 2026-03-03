/**
 * Searchable Select With Create Component
 * A dropdown with search functionality and inline create option
 * Never forces users to leave the current form
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
}

interface SearchableSelectWithCreateProps {
  options: SearchableSelectOption[];
  value?: number | string;
  onChange: (value: number | string) => void;
  onCreateNew?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  emptyActionText?: string;
  createButtonText?: string;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  showCreateButton?: boolean;
}

export function SearchableSelectWithCreate({
  options,
  value,
  onChange,
  onCreateNew,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  emptyActionText = 'Create one to continue',
  createButtonText = 'Create New',
  disabled = false,
  className,
  isLoading = false,
  showCreateButton = true,
}: SearchableSelectWithCreateProps) {
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

  const handleCreateNew = () => {
    setOpen(false);
    setSearchQuery('');
    onCreateNew?.();
  };

  const hasNoData = options.length === 0;
  const hasNoResults = filteredOptions.length === 0 && !hasNoData;

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
          disabled={disabled || isLoading}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        {/* Search Input */}
        {!hasNoData && (
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        )}

        {/* Create New Button */}
        {showCreateButton && onCreateNew && (
          <div className="border-b">
            <button
              type="button"
              onClick={handleCreateNew}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
            >
              <Plus className="h-4 w-4" />
              <span>{createButtonText}</span>
            </button>
          </div>
        )}

        {/* Options List or Empty State */}
        <ScrollArea className="h-[250px]">
          <div className="p-1">
            {hasNoData ? (
              // Smart Empty State - No data at all
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-2 rounded-full bg-muted p-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mb-1 text-sm font-medium text-foreground">
                  {emptyText}
                </p>
                <p className="mb-4 text-xs text-muted-foreground">
                  {emptyActionText}
                </p>
                {showCreateButton && onCreateNew && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateNew}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    {createButtonText}
                  </Button>
                )}
              </div>
            ) : hasNoResults ? (
              // No search results
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results for "{searchQuery}"
              </div>
            ) : (
              // Options list
              filteredOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleSelect(option.value);
                  }}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                    value == option.value && 'bg-accent'
                  )}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value == option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{option.label}</span>
                    {option.subtitle && (
                      <span className="text-xs text-muted-foreground">
                        {option.subtitle}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
