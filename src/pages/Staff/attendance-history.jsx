"use client";

import { useState, useEffect, useRef } from "react";
import { format, parse, addMonths, subMonths, isWithinInterval, eachDayOfInterval } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Check, X } from "lucide-react";
import { mockAttendanceData } from "./mock-data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AttendanceHistory({ employeeId }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("2023-04");
  const [displayMonth, setDisplayMonth] = useState("April 2023");
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined
  });
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState({
    morningShift: "",
    eveningShift: ""
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const calendarRef = useRef(null);

  useEffect(() => {
    const filteredData = mockAttendanceData.filter((record) => {
      const recordDate = new Date(record.date);
      const matchesEmployee = record.employeeId === employeeId;
      const matchesMonth = format(recordDate, "yyyy-MM") === selectedMonth;
      return matchesEmployee && matchesMonth;
    });

    setAttendanceData(filteredData);
  }, [employeeId, selectedMonth]);

  useEffect(() => {
    const handleClickAway = (event) => {
      const calendarElement = calendarRef.current;
      const popoverElement = document.querySelector('[role="dialog"]');
      const selectContent = document.querySelector('[role="listbox"]');
      
      // Don't clear if clicking inside the popover, select dropdown, or their children
      if (
        (popoverElement && popoverElement.contains(event.target)) ||
        (selectContent && selectContent.contains(event.target)) ||
        event.target.closest('[role="listbox"]') ||
        event.target.closest('[role="dialog"]')
      ) {
        return;
      }

      if (calendarElement && !calendarElement.contains(event.target)) {
        setDateRange({ from: undefined, to: undefined });
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickAway);
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, []);

  const handlePreviousMonth = () => {
    const currentDate = parse(selectedMonth, "yyyy-MM", new Date());
    const previousMonth = subMonths(currentDate, 1);
    setSelectedMonth(format(previousMonth, "yyyy-MM"));
    setDisplayMonth(format(previousMonth, "MMMM yyyy"));
  };

  const handleNextMonth = () => {
    const currentDate = parse(selectedMonth, "yyyy-MM", new Date());
    const nextMonth = addMonths(currentDate, 1);
    setSelectedMonth(format(nextMonth, "yyyy-MM"));
    setDisplayMonth(format(nextMonth, "MMMM yyyy"));
  };

  const generateCalendarDays = () => {
    const monthDate = parse(selectedMonth, "yyyy-MM", new Date());
    const daysInMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      1
    ).getDay();

    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getAttendanceForDay = (day) => {
    if (!day) return null;
    const dateString = `${selectedMonth}-${day.toString().padStart(2, "0")}`;
    return attendanceData.find((record) => record.date === dateString);
  };

  const getStatusBadge = (status, shift) => {
    const baseClasses = "text-xs border";
    switch (status) {
      case "present":
        return (
          <Badge
            variant="outline"
            className={`${baseClasses} bg-green-50 text-green-500 border-green-500`}
          >
            {shift}: Present
          </Badge>
        );
      case "absent":
        return (
          <Badge
            variant="outline"
            className={`${baseClasses} bg-red-50 text-red-500 border-red-500`}
          >
            {shift}: Absent
          </Badge>
        );
      case "paid_leave":
        return (
          <Badge
            variant="outline"
            className={`${baseClasses} bg-blue-50 text-blue-500 border-blue-500`}
          >
            {shift}: Paid Leave
          </Badge>
        );
      case "unpaid_leave":
        return (
          <Badge
            variant="outline"
            className={`${baseClasses} bg-orange-50 text-orange-500 border-orange-500`}
          >
            {shift}: Unpaid Leave
          </Badge>
        );
      default:
        return null;
    }
  };

  const calendarDays = generateCalendarDays();

  const handleDateSelect = (day, event) => {
    if (!day) return;
    const dateString = `${selectedMonth}-${day.toString().padStart(2, "0")}`;
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    
    if (dateRange.from && !dateRange.to) {
      // If we have a start date but no end date, set the end date
      if (date < dateRange.from) {
        setDateRange({ from: date, to: dateRange.from });
      } else {
        setDateRange({ ...dateRange, to: date });
      }
      // Set popover position to current mouse position
      const rect = calendarRef.current.getBoundingClientRect();
      const scrollLeft = window.scrollX;
      const scrollTop = window.scrollY;
      
      setPopoverPosition({
        x: event.clientX - rect.left + scrollLeft,
        y: event.clientY - rect.top + scrollTop
      });
      // Automatically open the popover
      setIsPopoverOpen(true);
    } else {
      // Start a new range
      setDateRange({ from: date, to: undefined });
      setIsPopoverOpen(false);
    }
  };

  const handleBulkUpdate = () => {
    if (!dateRange.from || !dateRange.to) return;

    const dateRangeArray = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to
    });

    const updatedData = [...attendanceData];
    dateRangeArray.forEach(date => {
      const dateString = format(date, "yyyy-MM-dd");
      const existingRecord = updatedData.find(record => record.date === dateString);
      
      if (existingRecord) {
        existingRecord.morningShift = bulkUpdateStatus.morningShift;
        existingRecord.eveningShift = bulkUpdateStatus.eveningShift;
      } else {
        updatedData.push({
          date: dateString,
          employeeId,
          morningShift: bulkUpdateStatus.morningShift,
          eveningShift: bulkUpdateStatus.eveningShift
        });
      }
    });

    setAttendanceData(updatedData);
    setDateRange({ from: undefined, to: undefined });
    setIsPopoverOpen(false);
  };

  const isDateSelected = (day) => {
    if (!day || !dateRange.from) return false;
    const dateString = `${selectedMonth}-${day.toString().padStart(2, "0")}`;
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    
    if (dateRange.to) {
      return isWithinInterval(date, { start: dateRange.from, end: dateRange.to });
    }
    return date.getTime() === dateRange.from.getTime();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-800">{displayMonth}</h3>
        <Button variant="outline" size="sm" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Date Range Selection Info */}
      {dateRange.from && (
        <div className="mb-4 text-sm text-gray-600">
          {dateRange.to ? (
            <span>Selected: {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}</span>
          ) : (
            <span>Select end date</span>
          )}
        </div>
      )}

      <div className="relative" ref={calendarRef}>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-medium p-2 text-sm text-gray-600"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="border rounded-md p-2 min-h-[100px] bg-gray-50"
                ></div>
              );
            }

            const attendance = getAttendanceForDay(day);
            const isSelected = isDateSelected(day);

            return (
              <div
                key={`day-${day}`}
                onClick={(e) => handleDateSelect(day, e)}
                className={`border rounded-md p-2 min-h-[100px] bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
                  isSelected ? "ring-2 ring-primary-500 bg-primary-100" : ""
                }`}
              >
                <div className={`font-medium ${isSelected ? "text-primary-600" : "text-gray-700"}`}>{day}</div>
                {attendance && (
                  <div className="mt-2 space-y-1">
                    {getStatusBadge(attendance.morningShift, "Morning")}
                    {getStatusBadge(attendance.eveningShift, "Evening")}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bulk Update Popover */}
        {dateRange.from && dateRange.to && (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverContent 
              className="w-80" 
              style={{
                position: 'fixed',
                left: `${popoverPosition.x}px`,
                top: `${popoverPosition.y}px`,
                transform: 'none',
                zIndex: 1000
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Update Attendance Status</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPopoverOpen(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div onClick={(e) => e.stopPropagation()}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Morning Shift</label>
                    <Select
                      value={bulkUpdateStatus.morningShift}
                      onValueChange={(value) => setBulkUpdateStatus(prev => ({ ...prev, morningShift: value }))}
                    >
                      <SelectTrigger className="w-full" onClick={(e) => e.stopPropagation()}>
                        <SelectValue placeholder="Select" className="text-gray-400" />
                      </SelectTrigger>
                      <SelectContent className="z-[2000]" onClick={(e) => e.stopPropagation()}>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="paid_leave">Paid Leave</SelectItem>
                        <SelectItem value="unpaid_leave">Unpaid Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Evening Shift</label>
                    <Select
                      value={bulkUpdateStatus.eveningShift}
                      onValueChange={(value) => setBulkUpdateStatus(prev => ({ ...prev, eveningShift: value }))}
                    >
                      <SelectTrigger className="w-full" onClick={(e) => e.stopPropagation()}>
                        <SelectValue placeholder="Select" className="text-gray-400" />
                      </SelectTrigger>
                      <SelectContent className="z-[2000]" onClick={(e) => e.stopPropagation()}>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="paid_leave">Paid Leave</SelectItem>
                        <SelectItem value="unpaid_leave">Unpaid Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBulkUpdate();
                    }}
                    className="w-full"
                    disabled={!bulkUpdateStatus.morningShift || !bulkUpdateStatus.eveningShift}
                  >
                    Apply Changes
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
