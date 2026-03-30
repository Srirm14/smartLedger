"use client"

import { useState, useRef, useMemo } from "react"
import { Edit2, Trash2, Ban, CheckCircle2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import WarningPrompt from "@/components/WarningPrompt"
import Backdrop from "@/components/Backdrop"
import { StatusBadge } from "@/components/ui/StatusBadge"
import TooltipMessage from "@/components/TooltipMessage"

// Utility function to convert 24h time to 12h format
const formatTimeTo12Hour = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Utility function to calculate day span
const calculateDaySpan = (startTime, endTime) => {
  if (!startTime || !endTime) return "Same Day";
  
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  // Convert to minutes for easier comparison
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  // Early morning shifts (12 AM to 6 AM) are considered Cross Day
  if (startHour >= 0 && startHour < 6) {
    return "Cross Day";
  }
  
  // If end time is earlier in the day than start time, it means it's next day
  // Or if start time is after 6 PM and end time is before 6 AM
  if (endMinutes < startMinutes || (startHour >= 18 && endHour <= 6)) {
    return "Cross Day";
  }
  
  return "Same Day";
};

export default function ShiftTable({ shifts, islandId, onEditShift, onDeleteShift, onDiscontinueShift, searchTerm }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDiscontinueDialogOpen, setIsDiscontinueDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [editedShift, setEditedShift] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  // Memoize the filtered and processed shifts
  const processedShifts = useMemo(() => {
    return shifts
      .filter(
        (shift) =>
          shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shift.startTime.includes(searchTerm) ||
          shift.endTime.includes(searchTerm)
      )
      .map(shift => ({
        ...shift,
        daySpan: shift.daySpan || "same_day",
        active: shift.active,
        status: shift.active ? "active" : "inactive"
      }));
  }, [shifts, searchTerm]);

  const handleTimeFieldClick = (ref) => {
    if (ref.current) {
      ref.current.showPicker();
    }
  };

  const handleEditClick = (shift) => {
    setSelectedShift(shift);
    setEditedShift({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
    });
    setIsEditDialogOpen(true);
    setIsDeleteDialogOpen(false);
    setIsDiscontinueDialogOpen(false);
  };

  const handleDiscontinueClick = (shift) => {
    setSelectedShift(shift);
    setIsDiscontinueDialogOpen(true);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteClick = (shift) => {
    setSelectedShift(shift);
    setIsDeleteDialogOpen(true);
    setIsEditDialogOpen(false);
    setIsDiscontinueDialogOpen(false);
  };

  const handleEditSubmit = () => {
    if (!editedShift.name.trim() || !editedShift.startTime || !editedShift.endTime) {
      console.error("All fields are required");
      return;
    }
    onEditShift(islandId, selectedShift.id, editedShift);
    setIsEditDialogOpen(false);
  };

  const handleDiscontinueConfirm = () => {
    if (selectedShift) {
      onDiscontinueShift(islandId, selectedShift.id, selectedShift.active);
      setIsDiscontinueDialogOpen(false);
      setSelectedShift(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedShift) {
      onDeleteShift(selectedShift.id);
      setIsDeleteDialogOpen(false);
      setSelectedShift(null);
    }
  };
  return (
    <div className="p-4 pt-0">
      {processedShifts.length === 0 ? (
        <div className="text-center py-6 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">
          No shifts found. Add a shift to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shift Name</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Day Span</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedShifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell className="font-medium">{shift.name}</TableCell>
                <TableCell>{formatTimeTo12Hour(shift.startTime)}</TableCell>
                <TableCell>{formatTimeTo12Hour(shift.endTime)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                    {shift.daySpan === "same_day" ? "Same Day" : "Cross Day"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={shift.active ? "active" : "inactive"} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TooltipMessage message="Edit shift">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(shift)}
                        className="hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)]"
                      >
                        <Edit2 className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
                      </Button>
                    </TooltipMessage>

                    <WarningPrompt
                      open={isDiscontinueDialogOpen && selectedShift?.id === shift.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setSelectedShift(null);
                          setIsDiscontinueDialogOpen(false);
                        }
                      }}
                      title={shift.active ? "Disable Shift" : "Enable Shift"}
                      description={`Are you sure you want to ${shift.active ? 'disable' : 'enable'} the shift "${shift.name}"?`}
                      actionText={shift.active ? "DISABLE" : "ENABLE"}
                      onAction={handleDiscontinueConfirm}
                      onCancel={() => {
                        setSelectedShift(null);
                        setIsDiscontinueDialogOpen(false);
                      }}
                      variant="danger"
                      triggerButton={
                        <TooltipMessage message={shift.active ? "Disable shift" : "Enable shift"}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDiscontinueClick(shift);
                            }}
                            className={`hover:text-[var(--danger-500)] ${!shift.active ? 'hover:text-[var(--success-500)]' : ''}`}
                          >
                            {shift.active ? (
                              <Ban className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipMessage>
                      }
                    />

                    <WarningPrompt
                      open={isDeleteDialogOpen && selectedShift?.id === shift.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setSelectedShift(null);
                          setIsDeleteDialogOpen(false);
                        }
                      }}
                      title="Delete Shift"
                      description={`Are you sure you want to delete the shift "${shift.name}"? This action is irreversible.`}
                      actionText="DELETE"
                      onAction={handleDeleteConfirm}
                      onCancel={() => {
                        setSelectedShift(null);
                        setIsDeleteDialogOpen(false);
                      }}
                      variant="danger"
                      triggerButton={
                        <TooltipMessage message="Delete shift">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(shift);
                            }}
                            className="hover:text-[var(--danger-500)]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipMessage>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Shift Dialog */}
      {isEditDialogOpen && <Backdrop />}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedShift(null);
            setIsDeleteDialogOpen(false);
            setIsDiscontinueDialogOpen(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
              Edit Shift
            </DialogTitle>
            <DialogDescription className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">
              Update the shift details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shift-name" className="text-right text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                Shift Name
              </Label>
              <Input
                id="shift-name"
                value={editedShift.name}
                onChange={(e) =>
                  setEditedShift({ ...editedShift, name: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter shift name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-time" className="text-right text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                Start Time
              </Label>
              <div className="col-span-3">
                <div 
                  className="relative cursor-pointer"
                  onClick={() => handleTimeFieldClick(startTimeRef)}
                >
                  <Input
                    ref={startTimeRef}
                    id="start-time"
                    type="time"
                    value={editedShift.startTime}
                    onChange={(e) =>
                      setEditedShift({ ...editedShift, startTime: e.target.value })
                    }
                    className="cursor-pointer hover:border-[var(--primary-400)] focus:border-[var(--primary-500)] transition-colors duration-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:hover:opacity-70 [&::-webkit-time-picker]:cursor-pointer"
                  />
                  <div className="absolute inset-0" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-time" className="text-right text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                End Time
              </Label>
              <div className="col-span-3">
                <div 
                  className="relative cursor-pointer"
                  onClick={() => handleTimeFieldClick(endTimeRef)}
                >
                  <Input
                    ref={endTimeRef}
                    id="end-time"
                    type="time"
                    value={editedShift.endTime}
                    onChange={(e) =>
                      setEditedShift({ ...editedShift, endTime: e.target.value })
                    }
                    className="cursor-pointer hover:border-[var(--primary-400)] focus:border-[var(--primary-500)] transition-colors duration-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:hover:opacity-70 [&::-webkit-time-picker]:cursor-pointer"
                  />
                  <div className="absolute inset-0" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)] hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)]"
            >
              CANCEL
            </Button>
            <Button 
              onClick={handleEditSubmit}
              className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-[var(--neutral-white)]"
            >
              UPDATE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

