'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getDay, getDaysInMonth, isSameDay } from 'date-fns';
import { Check, ChevronLeftIcon, ChevronRightIcon, ChevronsUpDown, Loader2 } from 'lucide-react';
import * as React from 'react';
import { type ReactNode, createContext, useContext, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type CalendarState = {
  month: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  year: number;
  setMonth: (month: CalendarState['month']) => void;
  setYear: (year: CalendarState['year']) => void;
};

export const useCalendar = create<CalendarState>()(
  devtools((set) => ({
    month: new Date().getMonth() as CalendarState['month'],
    year: new Date().getFullYear(),
    setMonth: (month: CalendarState['month']) => set(() => ({ month })),
    setYear: (year: CalendarState['year']) => set(() => ({ year })),
  }))
);

type CalendarContextProps = {
  locale: Intl.LocalesArgument;
  startDay: number;
};

const CalendarContext = createContext<CalendarContextProps>({
  locale: 'en-US',
  startDay: 0,
});

export type Status = {
  id: string;
  name: string;
  color: string;
};

export type Feature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: Status;
  description?: string;
};

type ComboboxProps = {
  value: string;
  setValue: (value: string) => void;
  data: {
    value: string;
    label: string;
  }[];
  labels: {
    button: string;
    empty: string;
    search: string;
  };
  className?: string;
};

export const monthsForLocale = (
  localeName: Intl.LocalesArgument,
  monthFormat: Intl.DateTimeFormatOptions['month'] = 'long'
) => {
  const format = new Intl.DateTimeFormat(localeName, { month: monthFormat }).format;

  return [...new Array(12).keys()].map((m) => format(new Date(Date.UTC(2021, m % 12))));
};

export const daysForLocale = (locale: Intl.LocalesArgument, startDay: number) => {
  const weekdays: string[] = [];
  const baseDate = new Date(2024, 0, startDay);

  for (let i = 0; i < 7; i++) {
    weekdays.push(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(baseDate));
    baseDate.setDate(baseDate.getDate() + 1);
  }

  return weekdays;
};

const Combobox = ({
  value,
  setValue,
  data,
  labels,
  className,
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn('w-40 justify-between capitalize', className)}
        >
          {value ? data.find((item) => item.value === value)?.label : labels.button}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0">
        <Command
          filter={(val, search) => {
            const label = data.find((item) => item.value === val)?.label;
            return label?.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={labels.search} />
          <CommandList>
            <CommandEmpty>{labels.empty}</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                  className="capitalize"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

type OutOfBoundsDayProps = {
  day: number;
};

const OutOfBoundsDay = ({ day }: OutOfBoundsDayProps) => (
  <div className="relative h-full w-full bg-muted/30 p-1 text-muted-foreground text-xs">{day}</div>
);

export type CalendarBodyProps = {
  features: Feature[];
  children: (props: { feature: Feature }) => ReactNode;
  onDayClick?: (date: Date) => void;
  onFeatureClick?: (feature: Feature) => void;
  loadingDates?: Date[];
};

export const CalendarBody = ({ features, children, onDayClick, onFeatureClick, loadingDates }: CalendarBodyProps) => {
  const { month, year } = useCalendar();
  const { startDay } = useContext(CalendarContext);
  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  const firstDay = (getDay(new Date(year, month, 1)) - startDay + 7) % 7;
  const days: ReactNode[] = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonthDays = getDaysInMonth(new Date(prevMonthYear, prevMonth, 1));
  const prevMonthDaysArray = Array.from({ length: prevMonthDays }, (_, i) => i + 1);

  for (let i = 0; i < firstDay; i++) {
    const day = prevMonthDaysArray[prevMonthDays - firstDay + i];
    if (day) days.push(<OutOfBoundsDay key={`prev-${i}`} day={day} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const featuresForDay = features.filter((feature) =>
      isSameDay(new Date(feature.endAt), new Date(year, month, day))
    );

    const firstColor = featuresForDay[0]?.status?.color;
    const cellStyle = firstColor
      ? {
        backgroundColor: `${firstColor}26`,
      }
      : undefined;

    const dateObj = new Date(year, month, day);
    const isSunday = dateObj.getDay() === 0;
    const isLoading = loadingDates?.some(d => isSameDay(d, dateObj));

    days.push(
      <div
        key={day}
        className={cn(
          'relative flex h-full w-full flex-col gap-1 p-1 text-base font-bold',
          isSunday ? 'text-red-500' : 'text-muted-foreground',
          onDayClick && !isLoading && 'cursor-pointer hover:bg-accent/40',
          isLoading && "opacity-80 cursor-wait bg-muted/10 pointer-events-none"
        )}
        onClick={() => !isLoading && onDayClick?.(dateObj)}
        style={cellStyle}
      >
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-white/40 dark:bg-black/40 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {day}
        <div>
          {featuresForDay.slice(0, 3).map((feature) => (
            <div
              key={feature.id}
              onClick={(e) => {
                e.stopPropagation();
                onFeatureClick?.(feature);
              }}
            >
              {children({ feature })}
            </div>
          ))}
        </div>
        {featuresForDay.length > 3 && (
          <span className="block text-muted-foreground text-xs">
            +{featuresForDay.length - 3} more
          </span>
        )}
      </div>
    );
  }

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;
  const nextMonthDays = getDaysInMonth(new Date(nextMonthYear, nextMonth, 1));
  const nextMonthDaysArray = Array.from({ length: nextMonthDays }, (_, i) => i + 1);

  const remainingDays = 7 - ((firstDay + daysInMonth) % 7);
  if (remainingDays < 7) {
    for (let i = 0; i < remainingDays; i++) {
      const day = nextMonthDaysArray[i];
      if (day) days.push(<OutOfBoundsDay key={`next-${i}`} day={day} />);
    }
  }

  return (
    <div className="grid flex-grow grid-cols-7 bg-background">
      {days.map((day, index) => (
        <div
          key={index}
          className={cn(
            'relative aspect-square overflow-hidden border-t border-r bg-muted/5 hover:bg-muted/10 transition-colors',
            index % 7 === 6 && 'border-r-0'
          )}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export type CalendarDatePickerProps = {
  className?: string;
  children: ReactNode;
};

export const CalendarDatePicker = ({ className, children }: CalendarDatePickerProps) => (
  <div className={cn('flex items-center gap-1', className)}>{children}</div>
);

export type CalendarMonthPickerProps = {
  className?: string;
};

export const CalendarMonthPicker = ({ className }: CalendarMonthPickerProps) => {
  const { month, setMonth } = useCalendar();
  const { locale } = useContext(CalendarContext);

  return (
    <Combobox
      className={className}
      value={month.toString()}
      setValue={(value) => setMonth(Number.parseInt(value) as CalendarState['month'])}
      data={monthsForLocale(locale).map((m, index) => ({
        value: index.toString(),
        label: m,
      }))}
      labels={{
        button: 'Select month',
        empty: 'No month found',
        search: 'Search month',
      }}
    />
  );
};

export type CalendarYearPickerProps = {
  className?: string;
  start: number;
  end: number;
};

export const CalendarYearPicker = ({ className, start, end }: CalendarYearPickerProps) => {
  const { year, setYear } = useCalendar();

  return (
    <Combobox
      className={className}
      value={year.toString()}
      setValue={(value) => setYear(Number.parseInt(value))}
      data={Array.from({ length: end - start + 1 }, (_, i) => ({
        value: (start + i).toString(),
        label: (start + i).toString(),
      }))}
      labels={{
        button: 'Select year',
        empty: 'No year found',
        search: 'Search year',
      }}
    />
  );
};

export const CalendarDatePagination = ({ className }: { className?: string }) => {
  const { month, year, setMonth, setYear } = useCalendar();

  const handlePreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth((month - 1) as CalendarState['month']);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth((month + 1) as CalendarState['month']);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button onClick={handlePreviousMonth} variant="ghost" size="icon">
        <ChevronLeftIcon size={16} />
      </Button>
      <Button onClick={handleNextMonth} variant="ghost" size="icon">
        <ChevronRightIcon size={16} />
      </Button>
    </div>
  );
};

export const CalendarDate = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('flex items-center justify-between p-3', className)}>{children}</div>
);

export const CalendarHeader = ({ className }: { className?: string }) => {
  const { locale, startDay } = useContext(CalendarContext);

  return (
    <div className={cn('grid flex-grow grid-cols-7', className)}>
      {daysForLocale(locale, startDay).map((day, index) => (
        <div
          key={day}
          className={cn(
            "p-3 text-right text-sm font-bold",
            (index + startDay) % 7 === 0 ? "text-red-500" : "text-muted-foreground"
          )}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export const CalendarItem = ({
  feature,
  className,
  style,
}: {
  feature: Feature;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div className={cn('flex items-center gap-2', className)} style={style} key={feature.id}>
    <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: feature.status.color }} />
    <span className="truncate">{feature.name}</span>
  </div>
);

export const CalendarProvider = ({
  locale = 'en-US',
  startDay = 0,
  children,
  className,
}: {
  locale?: Intl.LocalesArgument;
  startDay?: number;
  children: ReactNode;
  className?: string;
}) => (
  <CalendarContext.Provider value={{ locale, startDay }}>
    <div className={cn('relative flex flex-col', className)}>{children}</div>
  </CalendarContext.Provider>
);

// Shadcn DayPicker wrapper for date selection (legacy usage)
export type DatePickerProps = React.ComponentProps<typeof DayPicker>;

export function Calendar(props: DatePickerProps) {
  return (
    <DayPicker
      className="p-3"
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:text-muted-foreground [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside: 'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
      }}
      {...props}
    />
  );
}
