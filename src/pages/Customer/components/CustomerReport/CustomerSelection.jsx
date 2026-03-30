"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import {
  CalendarIcon,
  Check,
  Loader2,
  Search,
  RotateCcw,
  Eye,
} from "lucide-react";
import { format, subDays, isAfter, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Backdrop from "@/components/Backdrop";

// PropTypes definition
CustomerSelection.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  customers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      customer_name: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedCustomers: PropTypes.array.isRequired,
  onCustomerSelect: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  isLoadingPreview: PropTypes.bool.isRequired,
  date: PropTypes.object.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onDialogClose: PropTypes.func.isRequired,
};

// Utility functions
const getDefaultDateRange = () => ({
  from: subDays(new Date(), 15),
  to: new Date(),
});

const isDateDisabled = (date) => {
  return isAfter(startOfDay(date), startOfDay(new Date()));
};

const isValidDateRange = (tempDate) => {
  return tempDate.from && tempDate.to && !isAfter(tempDate.from, tempDate.to);
};

export function CustomerSelection({
  open,
  onOpenChange,
  customers,
  selectedCustomers,
  onCustomerSelect,
  onSelectAll,
  onPreview,
  isLoadingPreview,
  date,
  onDateChange,
  onDialogClose,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tempDate, setTempDate] = useState(date);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Sync tempDate with date prop
  useEffect(() => {
    setTempDate(date);
  }, [date]);

  // Computed values
  const customersArray = useMemo(() => 
    Array.isArray(customers) ? customers : Object.values(customers), 
    [customers]
  );

  const filteredCustomers = useMemo(() => 
    customersArray.filter((customer) =>
      customer.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    ), 
    [customersArray, searchQuery]
  );

  // Customer Management
  const isCustomerSelected = useCallback((id) => {
    return selectedCustomers.some((customer) => customer.id === id);
  }, [selectedCustomers]);

  // Date Management
  const handleDateSelect = useCallback((range) => {
    if (!range) return;
    
    const today = startOfDay(new Date());
    let newRange = { ...range };
    
    if (range.from && isAfter(startOfDay(range.from), today)) {
      newRange.from = today;
    }
    if (range.to && isAfter(startOfDay(range.to), today)) {
      newRange.to = today;
    }
    
    if (newRange.from && newRange.to && isAfter(newRange.from, newRange.to)) {
      newRange.to = newRange.from;
    }
    
    setTempDate(newRange);
  }, []);

  const handleSetDate = useCallback(() => {
    if (tempDate.from && tempDate.to) {
      onDateChange(tempDate);
      // Use a small delay to ensure the calendar closes properly
      requestAnimationFrame(() => {
        setCalendarOpen(false);
      });
    }
  }, [tempDate, onDateChange]);

  const handleResetDate = useCallback(() => {
    const defaultRange = getDefaultDateRange();
    setTempDate(defaultRange);
  }, []);

  const handleCancelDate = useCallback(() => {
    setTempDate(date);
    setCalendarOpen(false);
  }, [date]);

  return (
    <>
      {open && <Backdrop />}
      
      <Dialog open={open} onOpenChange={onDialogClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0">
          <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-semibold">
                Generate Customer Bills
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Select customers and date range to generate a custom report
              </p>
            </DialogHeader>

            <div className="space-y-4">
              {/* Enhanced Date Range Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 px-3 border-input bg-background",
                        !date.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "MMM dd, yyyy")} -{" "}
                            {format(date.to, "MMM dd, yyyy")}
                          </>
                        ) : (
                          format(date.from, "MMM dd, yyyy")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={tempDate?.from}
                        selected={tempDate}
                        onSelect={handleDateSelect}
                        numberOfMonths={2}
                        disabled={isDateDisabled}
                        className="rounded-md"
                      />
                      <div className="border-t pt-3 mt-3 flex justify-between gap-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetDate}
                            className="gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Reset
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelDate}
                          >
                            Cancel
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleSetDate}
                          disabled={!isValidDateRange(tempDate)}
                          className="gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Set
                        </Button>
                      </div>
                      {tempDate.from && tempDate.to && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-center">
                          {format(tempDate.from, "MMM dd, yyyy")} - {format(tempDate.to, "MMM dd, yyyy")}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Default: Current date to 15 days ago • Future dates disabled
                </p>
              </div>

              {/* Customer Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-9 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Customer List */}
              <div className="border rounded-lg overflow-hidden">
                <div className="border-b p-3 bg-muted/10">
                  <div className="flex items-center">
                    <Checkbox
                      id="select-all"
                      className="mr-2 h-4 w-4"
                      checked={
                        filteredCustomers.length > 0 &&
                        filteredCustomers.every((c) => isCustomerSelected(c.id))
                      }
                      onCheckedChange={onSelectAll}
                    />
                    <label htmlFor="select-all" className="font-medium text-sm">
                      Name
                    </label>
                  </div>
                </div>
                <div className="max-h-[180px] overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <div key={customer.id} className="border-b last:border-0">
                        <div className="flex items-center p-3">
                          <Checkbox
                            id={`customer-${customer.id}`}
                            className="mr-2 h-4 w-4"
                            checked={isCustomerSelected(customer.id)}
                            onCheckedChange={(checked) =>
                              onCustomerSelect(
                                {
                                  id: customer.id,
                                  name: customer.customer_name,
                                },
                                checked
                              )
                            }
                          />
                          <label
                            htmlFor={`customer-${customer.id}`}
                            className="flex-grow text-sm"
                          >
                            {customer.customer_name}
                          </label>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      No customers found
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {selectedCustomers.length} of {customers.length} customers selected
              </div>
            </div>
          </div>

          <div className="border-t p-4 flex flex-col sm:flex-row justify-between gap-3">
            <Button
              variant="outline"
              onClick={onDialogClose}
              className="px-3 h-9 text-sm"
            >
              Cancel
            </Button>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="gap-2 px-3 h-9 text-sm"
                disabled={!date.from || !date.to || isLoadingPreview || selectedCustomers.length === 0}
                onClick={onPreview}
              >
                {isLoadingPreview ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="whitespace-nowrap">Preview Report</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 