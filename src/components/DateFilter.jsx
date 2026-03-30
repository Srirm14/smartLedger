import React, { useState, useEffect } from "react";
import { format, subDays, subMonths, startOfDay } from "date-fns";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as DateCalendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const DateFilter = ({ 
  onDateChange,
  initialDate = new Date(),
  selectedRange,
  defaultOption = "lastMonth",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState(selectedRange || {
    from: initialDate,
    to: initialDate
  });
  const [activeQuickSelect, setActiveQuickSelect] = useState(null);

  // Helper function to check if a range matches any quick select option
  const isQuickSelectRange = (range) => {
    if (!range?.from || !range?.to) return false;
    
    const today = startOfDay(new Date());
    const from = startOfDay(range.from);
    const to = startOfDay(range.to);

    // Check if it matches today
    if (from.getTime() === today.getTime() && to.getTime() === today.getTime()) {
      return 'today';
    }
    // Check if it matches last week
    if (from.getTime() === subDays(today, 7).getTime() && to.getTime() === today.getTime()) {
      return 'lastWeek';
    }
    // Check if it matches last month
    if (from.getTime() === subMonths(today, 1).getTime() && to.getTime() === today.getTime()) {
      return 'lastMonth';
    }
    // Check if it matches last two months
    if (from.getTime() === subMonths(today, 2).getTime() && to.getTime() === today.getTime()) {
      return 'lastTwoMonths';
    }

    return false;
  };

  // Set initial date range and active quick select
  useEffect(() => {
    const today = startOfDay(new Date());
    let newRange;

    switch (defaultOption) {
      case 'today':
        newRange = { from: today, to: today };
        break;
      case 'lastWeek':
        newRange = { from: subDays(today, 7), to: today };
        break;
      case 'lastMonth':
        newRange = { from: subMonths(today, 1), to: today };
        break;
      case 'lastTwoMonths':
        newRange = { from: subMonths(today, 2), to: today };
        break;
      default:
        newRange = { from: today, to: today };
    }

    if (!selectedRange) {
      setDateRange(newRange);
      setActiveQuickSelect(defaultOption);
      onDateChange(newRange);
    }
  }, []); // Run only once on mount

  // Update internal state when selectedRange changes
  useEffect(() => {
    if (selectedRange) {
      setDateRange(selectedRange);
      // Check if the selected range matches any quick select option
      const quickSelectMatch = isQuickSelectRange(selectedRange);
      setActiveQuickSelect(quickSelectMatch || null);
    }
  }, [selectedRange]);

  const handleDateRangeChange = (range) => {
    if (!range) {
      setDateRange({ from: null, to: null });
      setActiveQuickSelect(null);
      return;
    }

    if (range.from && range.to) {
      const [from, to] = [range.from, range.to].sort((a, b) => a.getTime() - b.getTime());
      const newRange = { from, to };
      setDateRange(newRange);
      
      // Check if this range matches any quick select option
      const quickSelectMatch = isQuickSelectRange(newRange);
      setActiveQuickSelect(quickSelectMatch || null);
    } else if (range.from) {
      if (dateRange.from && dateRange.to) {
        setDateRange({ from: range.from, to: null });
      } else {
        setDateRange({ from: range.from, to: null });
      }
      setActiveQuickSelect(null);
    }
  };

  const handleQuickSelect = (range) => {
    const today = startOfDay(new Date());
    let newRange;

    switch (range) {
      case 'today':
        newRange = { from: today, to: today };
        break;
      case 'lastWeek':
        newRange = { from: subDays(today, 7), to: today };
        break;
      case 'lastMonth':
        newRange = { from: subMonths(today, 1), to: today };
        break;
      case 'lastTwoMonths':
        newRange = { from: subMonths(today, 2), to: today };
        break;
      default:
        return;
    }

    setDateRange(newRange);
    setActiveQuickSelect(range);
    onDateChange(newRange);
    setIsOpen(false);
  };

  const handleSubmit = () => {
    // If no date is selected, use today's date
    if (!dateRange.from) {
      const today = new Date();
      onDateChange({ from: today, to: today });
    } else {
      // If only one date is selected, set both from and to to that date
      const finalRange = !dateRange.to
        ? { from: dateRange.from, to: dateRange.from }
        : dateRange;
      onDateChange(finalRange);
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    // Clear all selections but keep popover open
    setDateRange({ from: null, to: null });
    setActiveQuickSelect(null);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className={`flex items-center gap-2 h-9 min-w-fit max-w-full justify-between whitespace-nowrap overflow-hidden ${className}`}
        >
          <span className="truncate">
            {!dateRange.from 
              ? "Select Date"
              : dateRange.from.getTime() === dateRange.to?.getTime() 
                ? format(dateRange.from, 'MMM dd, yyyy')
                : dateRange.to
                  ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
                  : format(dateRange.from, 'MMM dd, yyyy')
            }
          </span>
          <CalendarRange className="h-4 w-4 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align="start" 
        sideOffset={5}
        alignOffset={0}
      >
        <div className="flex">
          <DateCalendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
            className="border-0 [&_.rdp-day_range_middle]:bg-[var(--primary-100)] [&_.rdp-day_range_middle]:text-[var(--primary-500)] [&_.rdp-day_selected]:!bg-[var(--primary-500)] [&_.rdp-day_selected]:!text-[var(--neutral-white)] dark:[&_.rdp-day_selected]:!bg-[var(--primary-400)] dark:[&_.rdp-day_selected]:!text-[var(--neutral-white)]"
            classNames={{
              day_selected: "bg-[var(--primary-500)] text-[var(--neutral-white)] hover:bg-[var(--primary-600)] hover:text-[var(--neutral-white)] dark:bg-[var(--primary-400)] dark:text-[var(--neutral-white)] dark:hover:bg-[var(--primary-300)] dark:hover:text-[var(--neutral-white)]",
              day_range_start: "bg-[var(--primary-500)] text-[var(--neutral-white)] hover:bg-[var(--primary-600)] hover:text-[var(--neutral-white)] dark:bg-[var(--primary-400)] dark:text-[var(--neutral-white)] dark:hover:bg-[var(--primary-300)] dark:hover:text-[var(--neutral-white)]",
              day_range_end: "bg-[var(--primary-500)] text-[var(--neutral-white)] hover:bg-[var(--primary-600)] hover:text-[var(--neutral-white)] dark:bg-[var(--primary-400)] dark:text-[var(--neutral-white)] dark:hover:bg-[var(--primary-300)] dark:hover:text-[var(--neutral-white)]",
              day_today: "data-[selected=true]:bg-[var(--primary-500)] data-[selected=true]:text-[var(--neutral-white)] data-[selected=false]:bg-[var(--primary-100)] data-[selected=false]:text-[var(--primary-500)] hover:bg-[var(--primary-200)] hover:text-[var(--primary-600)] dark:data-[selected=true]:bg-[var(--primary-400)] dark:data-[selected=true]:text-[var(--neutral-white)] dark:data-[selected=false]:bg-[var(--primary-200)] dark:data-[selected=false]:text-[var(--primary-400)] dark:hover:bg-[var(--primary-300)] dark:hover:text-[var(--primary-300)]"
            }}
          />
          <div className="flex flex-col gap-2 p-3 border-l border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] min-w-[120px]">
            <Button
              variant="outline"
              size="sm"
              className={`justify-start shadow-none ${
                activeQuickSelect === 'today' 
                  ? 'bg-[var(--primary-100)] text-[var(--primary-500)] border-[var(--primary-200)] dark:bg-[var(--primary-200)] dark:text-[var(--primary-400)] dark:border-[var(--primary-300)]' 
                  : 'text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray200)] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]'
              }`}
              onClick={() => handleQuickSelect('today')}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`justify-start shadow-none ${
                activeQuickSelect === 'lastWeek' 
                  ? 'bg-[var(--primary-100)] text-[var(--primary-500)] border-[var(--primary-200)] dark:bg-[var(--primary-200)] dark:text-[var(--primary-400)] dark:border-[var(--primary-300)]' 
                  : 'text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray200)] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]'
              }`}
              onClick={() => handleQuickSelect('lastWeek')}
            >
              Last Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`justify-start shadow-none ${
                activeQuickSelect === 'lastMonth' 
                  ? 'bg-[var(--primary-100)] text-[var(--primary-500)] border-[var(--primary-200)] dark:bg-[var(--primary-200)] dark:text-[var(--primary-400)] dark:border-[var(--primary-300)]' 
                  : 'text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray200)] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]'
              }`}
              onClick={() => handleQuickSelect('lastMonth')}
            >
              Last Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`justify-start shadow-none ${
                activeQuickSelect === 'lastTwoMonths' 
                  ? 'bg-[var(--primary-100)] text-[var(--primary-500)] border-[var(--primary-200)] dark:bg-[var(--primary-200)] dark:text-[var(--primary-400)] dark:border-[var(--primary-300)]' 
                  : 'text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray200)] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]'
              }`}
              onClick={() => handleQuickSelect('lastTwoMonths')}
            >
              Last 2 Months
            </Button>
            <div className="flex flex-col gap-2 mt-auto pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="shadow-none"
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-primary-500 text-white hover:bg-primary-600"
                onClick={handleSubmit}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}; 