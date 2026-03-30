"use client";

import { useState, useRef } from "react";
import { PlusCircle, ChevronDown, ChevronUp, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import WarningPrompt from "@/components/WarningPrompt";
import ShiftTable from "./ShiftTable";
import Backdrop from "@/components/Backdrop";
import TooltipMessage from "@/components/TooltipMessage";

export default function IslandCard({
  island,
  onToggleExpand,
  onDeleteIsland,
  onEditIsland,
  onAddShift,
  onEditShift,
  onDeleteShift,
  onDiscontinueShift,
  validateShiftTime,
  searchTerm,
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState(false);
  const [isEditIslandDialogOpen, setIsEditIslandDialogOpen] = useState(false);
  const [newShift, setNewShift] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });
  const [editedIslandName, setEditedIslandName] = useState(island.name);
  const [startTimeWarning, setStartTimeWarning] = useState("");
  const [endTimeWarning, setEndTimeWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  // Handle time change for new shift
  const handleTimeChange = (event) => {
    const { name, value } = event.target;

    if (name === "startTime") {
      const isValid = validateShiftTime(island.id, value, newShift.endTime);
      setStartTimeWarning(
        isValid ? "" : "Start time overlaps with an existing shift."
      );
      setNewShift({ ...newShift, startTime: value });
    } else if (name === "endTime") {
      const isValid = validateShiftTime(island.id, newShift.startTime, value);
      setEndTimeWarning(
        isValid ? "" : "End time overlaps with an existing shift."
      );
      setNewShift({ ...newShift, endTime: value });
    }
  };

  const handleTimeFieldClick = (ref) => {
    if (ref.current) {
      ref.current.showPicker();
    }
  };

  // Handle delete island
  const handleDeleteIsland = () => {
    onDeleteIsland(island.id);
    setIsDeleteDialogOpen(false);
  };

  // Handle edit island
  const handleEditIsland = () => {
    if (!editedIslandName.trim()) {
      console.error("Island name is required");
      return;
    }
    onEditIsland(island.id, editedIslandName);
    setIsEditIslandDialogOpen(false);
  };

  // Handle add shift
  const handleAddShift = async () => {
    if (!newShift.name.trim()) {
      console.error("Shift name is required");
      return;
    }

    if (!newShift.startTime) {
      console.error("Start time is required");
      return;
    }

    if (!newShift.endTime) {
      console.error("End time is required");
      return;
    }

    if (!validateShiftTime(island.id, newShift.startTime, newShift.endTime)) {
      console.error("Shift times overlap with an existing shift");
      return;
    }

    setIsLoading(true);
    try {
      await onAddShift(island.id, newShift);
      setNewShift({ name: "", startTime: "", endTime: "" });
      setIsAddShiftDialogOpen(false);
    } catch (error) {
      console.error("Error adding shift:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-none dark:shadow-none border-none dark:border-none">
      <CardContent className="p-4 flex items-center justify-between border-b-[1.25px] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
              {island.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[var(--neutral-gray800)] dark:text-[var(--neutral-gray400)] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
                {island.shifts?.length || 0} Shifts
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAddShiftDialogOpen && <Backdrop />}
          <Dialog open={isAddShiftDialogOpen} onOpenChange={setIsAddShiftDialogOpen}>
            <TooltipMessage message="Add shift">
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddShiftDialogOpen(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
                </Button>
              </DialogTrigger>
            </TooltipMessage>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">Add New Shift</DialogTitle>
                <DialogDescription className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">
                  Create a new shift for {island.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shift-name" className="text-right text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                    Shift Name
                  </Label>
                  <Input
                    id="shift-name"
                    value={newShift.name}
                    onChange={(e) =>
                      setNewShift({ ...newShift, name: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="Enter shift name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start-time" className="text-right text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                    Start Time
                  </Label>
                  <div className="col-span-3 relative">
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => handleTimeFieldClick(startTimeRef)}
                    >
                      <Input
                        ref={startTimeRef}
                        id="start-time"
                        type="time"
                        value={newShift.startTime}
                        onChange={(e) => handleTimeChange(e)}
                        name="startTime"
                        className="cursor-pointer hover:border-[var(--primary-400)] focus:border-[var(--primary-500)] transition-colors duration-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:hover:opacity-70 [&::-webkit-time-picker]:cursor-pointer"
                      />
                      <div className="absolute inset-0" />
                    </div>
                    {startTimeWarning && (
                      <p className="absolute -bottom-6 text-sm text-[var(--danger-500)] font-medium">
                        {startTimeWarning}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4 mt-2">
                  <Label htmlFor="end-time" className="text-right text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                    End Time
                  </Label>
                  <div className="col-span-3 relative">
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => handleTimeFieldClick(endTimeRef)}
                    >
                      <Input
                        ref={endTimeRef}
                        id="end-time"
                        type="time"
                        value={newShift.endTime}
                        onChange={(e) => handleTimeChange(e)}
                        name="endTime"
                        className="cursor-pointer hover:border-[var(--primary-400)] focus:border-[var(--primary-500)] transition-colors duration-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:hover:opacity-70 [&::-webkit-time-picker]:cursor-pointer"
                      />
                      <div className="absolute inset-0" />
                    </div>
                    {endTimeWarning && (
                      <p className="absolute -bottom-6 text-sm text-[var(--danger-500)] font-medium">
                        {endTimeWarning}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddShiftDialogOpen(false)}
                  className="text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)] hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)]"
                >
                  CANCEL
                </Button>
                <Button 
                  onClick={handleAddShift}
                  disabled={isLoading}
                  className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-[var(--neutral-white)]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ADDING...
                    </>
                  ) : (
                    "ADD"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isEditIslandDialogOpen && <Backdrop />}
          <Dialog open={isEditIslandDialogOpen} onOpenChange={setIsEditIslandDialogOpen}>
            <DialogTrigger asChild>
              <TooltipMessage message="Edit island">
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditIslandDialogOpen(true);
                    setEditedIslandName(island.name);
                  }}
                >
                  <Edit className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
                </Button>
              </TooltipMessage>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">Edit Island Name</DialogTitle>
                <DialogDescription className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">
                  Update the name of your island.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="island-name" className="text-right text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                    Island Name
                  </Label>
                  <Input
                    id="island-name"
                    value={editedIslandName}
                    onChange={(e) => setEditedIslandName(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter island name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditIslandDialogOpen(false)}
                  className="text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)] hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)]"
                >
                  CANCEL
                </Button>
                <Button 
                  onClick={handleEditIsland}
                  className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-[var(--neutral-white)]"
                >
                  UPDATE
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <WarningPrompt
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="Delete Island"
            description="Are you sure you want to delete this island? This action is irreversible."
            actionText="DELETE"
            onAction={handleDeleteIsland}
            onCancel={() => setIsDeleteDialogOpen(false)}
            triggerButton={
              <TooltipMessage message="Delete island">
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:text-[var(--danger-500)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipMessage>
            }
          />

          <Button
            variant="outline"
            size="icon"
            onClick={() => onToggleExpand(island.id)}
            className="border-none shadow-none hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)]"
          >
            {island.isExpanded ? (
              <ChevronUp className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
            )}
          </Button>
        </div>
      </CardContent>
      {island.isExpanded && (
        <ShiftTable
          shifts={island.shifts}
          islandId={island.id}
          onEditShift={onEditShift}
          onDeleteShift={onDeleteShift}
          onDiscontinueShift={onDiscontinueShift}
          searchTerm={searchTerm}
        />
      )}
    </Card>
  );
}
