import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";

const BillDateRangePicker = ({ 
  existingBills = [], 
  onDateRangeSelect,
  className 
}) => {
  const [date, setDate] = useState({
    from: null,
    to: null,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [existingRanges, setExistingRanges] = useState([]);

  useEffect(() => {
    const ranges = existingBills.map(bill => {
      try {
        if (!bill || !bill.start_date || !bill.end_date) {
          return null;
        }
        return {
          start: new Date(bill.start_date),
          end: new Date(bill.end_date)
        };
      } catch (error) {
        console.error("Error processing bill date range:", error);
        return null;
      }
    }).filter(Boolean);
    setExistingRanges(ranges);
  }, [existingBills]);

  const isDateInExistingRange = (date) => {
    if (!date) return false;
    return existingRanges.some(range => 
      isWithinInterval(new Date(date), { start: range.start, end: range.end })
    );
  };
  const getExistingRangeForDate = (date) => {
    if (!date) return null;
    return existingRanges.find(range => 
      isWithinInterval(new Date(date), { start: range.start, end: range.end })
    );
  };

  useEffect(() => {
    const hasValidRange = date.from && date.to;
    if (hasValidRange) {
      const startDate = new Date(date.from);
      const endDate = new Date(date.to);
      onDateRangeSelect({ startDate, endDate });
    }
  }, [date.from, date.to]);

  const handleDateSelect = (newDate) => {
    // If no date provided, reset selection
    if (!newDate) {
      setDate({ from: null, to: null });
      return;
    }

    // If no start date yet, or starting a new selection
    if (!date.from) {
      setDate({ from: newDate.from, to: null });
      return;
    }

    // If we have start date but no end date
    if (date.from && !date.to) {
      // If selecting a new date for end date
      if (newDate.to) {
        setDate({ from: date.from, to: newDate.to });
        setIsOpen(false); // Close popover when end date is selected
        return;
      }
      
      // If selecting the same date as start, clear selection
      if (newDate.from && newDate.from.getTime() === date.from.getTime()) {
        setDate({ from: null, to: null });
        return;
      }

      // If selecting a date before start date, clear selection
      if (newDate.from && newDate.from < date.from) {
        setDate({ from: null, to: null });
        return;
      }

      // If selecting a new date after start date
      if (newDate.from) {
        setDate({ from: date.from, to: newDate.from });
        setIsOpen(false); // Close popover when end date is selected
        return;
      }
    }

    // If both dates are selected, start new selection
    if (date.from && date.to) {
      setDate({ from: newDate.from, to: null });
    }
  };

  const getDateTooltip = (date) => {
    const range = getExistingRangeForDate(date);
    if (range) {
      return `Bill already generated for ${format(range.start, "MMM d")} - ${format(range.end, "MMM d, yyyy")}`;
    }
    return null;
  };

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM d, yyyy")} - {format(date.to, "MMM d, yyyy")}
                </>
              ) : (
                format(date.from, "MMM d, yyyy")
              )
            ) : (
              "Select date range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Card className="border-0 shadow-none">
            <CardContent className="p-3">
              <div className="space-y-1.5 pb-2 border-b">
                <p className="text-sm font-medium text-foreground">Select a date range for the bill</p>
                <p className="text-xs text-muted-foreground">Dates in green are already used</p>
              </div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                disabled={(date) => isDateInExistingRange(date)}
                className="border-0 [&_.rdp-day_range_middle]:bg-primary-100 [&_.rdp-day_range_middle]:text-primary-500"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-neutral-gray500 rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-neutral-gray100 hover:text-neutral-gray900 focus:bg-neutral-gray100 focus:text-neutral-gray900 relative rounded-md transition-colors",
                  day_selected: "bg-primary-600 text-neutral-white hover:bg-primary-500 hover:text-neutral-white",
                  day_range_start: "bg-primary-600 text-neutral-white hover:bg-primary-500 hover:text-neutral-white",
                  day_range_end: "bg-primary-600 text-neutral-white hover:bg-primary-500 hover:text-neutral-white",
                  day_today: "bg-primary-100 text-primary-600 hover:bg-primary-200 hover:text-primary-600",
                  day_outside: "text-neutral-gray500 opacity-50",
                  day_disabled: "text-neutral-gray500 opacity-50",
                  day_hidden: "invisible"
                }}
                components={{
                  DayContent: ({ date }) => {
                    const tooltip = getDateTooltip(date);
                    return tooltip ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full h-full flex items-center justify-center">
                              {format(date, "d")}
                              <InfoIcon className="absolute top-0 right-0 h-3 w-3 text-green-500" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent 
                            className="z-[100] bg-black text-white shadow-lg rounded-md border-0 p-2"
                            side="top"
                            sideOffset={5}
                          >
                            <p className="text-sm font-medium">{tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      format(date, "d")
                    );
                  }
                }}
              />
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BillDateRangePicker; 