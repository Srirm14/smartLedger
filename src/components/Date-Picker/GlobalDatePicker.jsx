import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const GlobalDatePicker = ({ selectedDate, onChange, minDate, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(new Date(selectedDate));

  // Update displayDate when selectedDate changes
  useEffect(() => {
    setDisplayDate(new Date(selectedDate));
  }, [selectedDate]);

  const handleMonthChange = (change) => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() + change);
    setDisplayDate(newDate);
  };

  const handleDateClick = (day) => {
    const newDate = new Date(displayDate);
    newDate.setDate(day);

    if (newDate > new Date()) {
      return;
    }

    onChange(newDate.toISOString().split("T")[0]);
    setIsOpen(false);
  };

  const renderDaysOfWeek = () => {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
      <div key={day} className="text-center text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)] text-xs font-medium">
        {day}
      </div>
    ));
  };

  const renderEmptyCells = () => {
    try {
      const firstDayOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
      const dayOfWeek = firstDayOfMonth.getDay();
      return Array(Math.max(0, dayOfWeek)).fill(null).map((_, index) => (
        <div key={`empty-${index}`} className="text-center text-[var(--neutral-gray300)] dark:text-[var(--neutral-gray600)]"></div>
      ));
    } catch (error) {
      console.error("Error rendering empty cells:", error);
      return [];
    }
  };

  const renderDaysOfMonth = () => {
    try {
      const daysInMonth = new Date(
        displayDate.getFullYear(),
        displayDate.getMonth() + 1,
        0
      ).getDate();

      return Array.from({ length: daysInMonth }, (_, day) => (
        <Button
          key={day + 1}
          onClick={() => handleDateClick(day + 1)}
          variant={
            new Date(selectedDate).getFullYear() === displayDate.getFullYear() &&
            new Date(selectedDate).getMonth() === displayDate.getMonth() &&
            new Date(selectedDate).getDate() === day + 1
              ? "default"
              : "ghost"
          }
          className={`w-8 h-8 ${
            new Date(displayDate.getFullYear(), displayDate.getMonth(), day + 1) >
              new Date() ||
            (minDate &&
              new Date(
                displayDate.getFullYear(),
                displayDate.getMonth(),
                day + 1
              ) < minDate)
              ? "text-[var(--neutral-gray400)] dark:text-[var(--neutral-gray500)] cursor-not-allowed"
              : ""
          }`}
          disabled={
            disabled ||
            new Date(displayDate.getFullYear(), displayDate.getMonth(), day + 1) >
              new Date() ||
            (minDate &&
              new Date(
                displayDate.getFullYear(),
                displayDate.getMonth(),
                day + 1
              ) < minDate)
          }
        >
          {day + 1}
        </Button>
      ));
    } catch (error) {
      console.error("Error rendering days of month:", error);
      return [];
    }
  };

  return (
    <div className="relative inline-block">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-[160px] px-3 justify-start text-left flex items-center gap-3 ${
              disabled ? "bg-[var(--neutral-gray200)] dark:bg-[var(--neutral-gray700)] cursor-not-allowed" : ""
            }`}
            onClick={() => !disabled && setIsOpen(true)}
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="truncate">{selectedDate}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="end">
          <div className="flex justify-between items-center mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMonthChange(-1)}
            >
              <ChevronLeft />
            </Button>
            <span className="text-sm font-medium">
              {displayDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMonthChange(1)}
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderDaysOfWeek()}
            {renderEmptyCells()}
            {renderDaysOfMonth()}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

GlobalDatePicker.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  minDate: PropTypes.instanceOf(Date),
  disabled: PropTypes.bool,
};

export default GlobalDatePicker;
