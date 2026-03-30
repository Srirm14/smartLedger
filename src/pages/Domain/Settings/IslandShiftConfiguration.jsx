"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import IslandCard from "./IslandCard";
import { useShiftConfigStore } from "../../../../store/useSettingStore";
import useGlobalDateStore from "../../../../store/useGlobalStore";
import { usePortfolioStore } from "../../../../store/usePortfolioStore";
import { formatDate } from "date-fns";
import Backdrop from "@/components/Backdrop";

export default function IntegratedIslandShiftConfiguration() {
  const {
    shiftConfig,
    fetchShiftConfig,
    AddShiftConfigPortfolio,
    isLoading,
    EditShiftConfigPortfolio,
    deleteShift,
    toggleShiftStatus,
  } = useShiftConfigStore();
  const { IslandSelectedDate } = useGlobalDateStore();
  const { addPortfolio, updatePortfolio, deletePortfolio } = usePortfolioStore();

  // State for islands and search term
  const [islands, setIslands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newIsland, setNewIsland] = useState({ name: "" });
  const [isAddIslandDialogOpen, setIsAddIslandDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(formatDate(new Date(), "yyyy-MM-dd"));
  const [isAddingIsland, setIsAddingIsland] = useState(false);
  
  // Fetch shift config data on initial load and when selectedDate changes
  useEffect(() => {
    fetchShiftConfig(IslandSelectedDate);
  }, [fetchShiftConfig, IslandSelectedDate]);


  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.split(".")[0].slice(0, 5) || "";
  };
  const parseTimeForAPI = (timeString) => {
    return `${timeString}:00` || "";
  };

  // Transform the shiftConfig data to match the Island format
  const transformedData = useMemo(() => {
    if (!shiftConfig) return [];
    return shiftConfig
      .filter((portfolio) => portfolio && portfolio.portfolio_id) // Filter out null values
      .map((portfolio) => ({
        id: portfolio.portfolio_id,
        name: portfolio.portfolio_name,
        isExpanded: false,
        shifts: (portfolio.shifts || [])
          .filter(shift => shift && shift.shift_name) // Ensure shift data is valid
          .map((shift) => ({
            id: shift.shift_id,
            name: shift.shift_name,
            startTime: formatTime(shift.shift_start_time),
            endTime: formatTime(shift.shift_end_time),
            startDate: shift.start_date,
            endDate: shift.end_date || "9999-12-31",
            islandId: portfolio.portfolio_name,
            daySpan: shift.day_span || "same_day",
            active: shift.active,
            status: shift.active ? "active" : "inactive"
          })),
      }));
  }, [shiftConfig]);
  
  useEffect(() => {
    setIslands(transformedData);
  }, [transformedData]);


  // Toggle island expansion
  const handleToggleIslandExpansion = (islandId) => {
    setIslands(
      islands.map((island) =>
        island.id === islandId
          ? { ...island, isExpanded: !island.isExpanded }
          : island
      )
    );
  };
  // Add new island (portfolio)
  const handleAddIsland = async () => {
    if (!newIsland.name.trim()) {
      console.error("Island name is required");
      return;
    }
    
    setIsAddingIsland(true);
    try {
      await addPortfolio(newIsland.name);
      fetchShiftConfig(IslandSelectedDate);
      setNewIsland({ name: "" });
      setIsAddIslandDialogOpen(false);
    } catch (error) {
      console.error("Error adding portfolio:", error);
    } finally {
      setIsAddingIsland(false);
    }
  };
  // Delete island (portfolio)
  const handleDeleteIsland = async (islandId) => {
    try {
      await deletePortfolio(islandId);
      fetchShiftConfig(IslandSelectedDate);
    } catch (error) {
      console.error("Error deleting portfolio:", error);
    }
  };
  
  // Add shift to an island (portfolio)
  const handleAddShift = async (islandId, shiftData) => {
    if (!shiftData.name.trim() || !shiftData.startTime || !shiftData.endTime) {
      console.error("Shift name, start time, and end time are required");
      return false;
    }

    if (!validateShiftTime(islandId, shiftData.startTime, shiftData.endTime)) {
      console.error("Shift times overlap with an existing shift");
      return false;
    }

    const shiftConfig = {
      portfolio_id: islandId,
      shift_name: shiftData.name,
      shift_start_time: parseTimeForAPI(shiftData.startTime),
      shift_end_time: parseTimeForAPI(shiftData.endTime),
      day_span: shiftData.daySpan || "same_day"
    };

    try {
      await AddShiftConfigPortfolio(shiftConfig);
      fetchShiftConfig(IslandSelectedDate);
      return true;
    } catch (error) {
      console.error("Error adding shift:", error);
      return false;
    }
  };
  // Edit shift
  const handleEditShift = async (islandId, shiftId, shiftData) => {
    if (!shiftData || !shiftData.name || !shiftData.name.trim() || !shiftData.startTime || !shiftData.endTime) {
      console.error("Shift name, start time, and end time are required");
      return false;
    }
    if (!validateShiftTime(islandId, shiftData.startTime, shiftData.endTime, shiftId)) {
      console.error("Shift times overlap with an existing shift");
      return false;
    }

    const addConfig = {
      shift_id: shiftId,
      portfolio_id: islandId,
      shift_name: shiftData.name,
      shift_start_time: parseTimeForAPI(shiftData.startTime),
      shift_end_time: parseTimeForAPI(shiftData.endTime),
      day_span: shiftData.daySpan || "same_day"
    };
    
    try {
      await EditShiftConfigPortfolio(addConfig);
      fetchShiftConfig(IslandSelectedDate);
      return true;
    } catch (error) {
      console.error("Error updating shift:", error);
      return false;
    }
  };
  // Delete shift
  const handleDeleteShift = async (shiftId) => {
    try {
      await deleteShift(shiftId);
    } catch (error) {
      console.error("Error deleting shift:", error);
    }
  };

  // Discontinue shift
  const handleDiscontinueShift = async (islandId, shiftId, currentActive) => {
    try {
      await toggleShiftStatus(islandId, shiftId, currentActive);
    } catch (error) {
      console.error("Error updating shift status:", error);
    }
  };

  // Validate shift time to prevent overlaps
  const validateShiftTime = (islandId, startTime, endTime, shiftId = null) => {
    if (!startTime || !endTime) return true;

    const island = islands.find((i) => i.id === islandId);
    if (!island) return true;

    for (const shift of island.shifts) {
      // Skip validation for the current shift being edited
      if (shiftId && shift.id === shiftId) continue;

      if (
        (startTime >= shift.startTime && startTime < shift.endTime) ||
        (endTime > shift.startTime && endTime <= shift.endTime) ||
        (startTime <= shift.startTime && endTime >= shift.endTime)
      ) {
        return false; // Overlap detected
      }
    }

    return true; // No overlap
  };

  // Filter islands based on search term
  const filteredIslands = islands.filter(
    (island) =>
      island.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      island.shifts.some(
        (shift) =>
          shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shift.startTime.includes(searchTerm) ||
          shift.endTime.includes(searchTerm)
      )
  );

  // Handle edit island
  const handleEditIsland = async (islandId, newName) => {
    try {
      await updatePortfolio(islandId, newName);
      fetchShiftConfig(IslandSelectedDate);
    } catch (error) {
      console.error("Error updating island:", error);
    }
  };

  if (isLoading) {
    return <IslandShiftConfigSkeleton />;
  }

  return (
    <div className="container  py-6 px-6">
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
            <Input
              placeholder="Search shifts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {isAddIslandDialogOpen && <Backdrop />}
          <Dialog
            open={isAddIslandDialogOpen}
            onOpenChange={setIsAddIslandDialogOpen}
          >
            <DialogTrigger asChild>
              <Button 
                onClick={handleAddIsland}
                className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-[var(--neutral-white)]"
              >
                <CirclePlus className="h-4 w-4 mr-[2px]" />
                ISLAND
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]">
              <DialogHeader>
                <DialogTitle className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">Add New Island</DialogTitle>
                <DialogDescription className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">
                  Create a new island for shift configuration.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="island-name" className="text-right text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                    Island Name
                  </Label>
                  <Input
                    id="island-name"
                    value={newIsland.name}
                    onChange={(e) =>
                      setNewIsland({ ...newIsland, name: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="Enter island name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddIslandDialogOpen(false)}
                  className="text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)] hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)]"
                >
                  CANCEL
                </Button>
                <Button 
                  onClick={handleAddIsland}
                  disabled={isAddingIsland}
                  className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-[var(--neutral-white)]"
                >
                  {isAddingIsland ? (
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
        </div>
      </div>

      {filteredIslands.length === 0 ? (
        <Card className="bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">No Islands Found</h3>
              <p className="text-sm text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">
                Add your first island to get started with shift configuration.
              </p>
            </div>
            <Button
              className="mt-5 text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)] hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)]"
              variant="outline"
              onClick={() => setIsAddIslandDialogOpen(true)}
            >
              <CirclePlus className="h-4 w-4 mr-1" />
              ADD ISLAND
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-2xl bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] w-full h-fit px-2 border-[1.25px] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
          {filteredIslands.map((island) => (
            <IslandCard
              key={island.id}
              island={island}
              onToggleExpand={handleToggleIslandExpansion}
              onDeleteIsland={handleDeleteIsland}
              onAddShift={handleAddShift}
              onEditShift={handleEditShift}
              onDeleteShift={handleDeleteShift}
              onDiscontinueShift={handleDiscontinueShift}
              onEditIsland={handleEditIsland}
              validateShiftTime={validateShiftTime}
              searchTerm={searchTerm}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Skeleton loader component
function IslandShiftConfigSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden shadow-none">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}