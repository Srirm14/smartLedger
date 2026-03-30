import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, CirclePlus, Calendar } from 'lucide-react';
import { IslandDynamicTable } from '@/pages/Island/Component/IslandDynamicTable';
import { toast } from 'react-hot-toast';
import useGlobalEntriesStore from '../../../../store/useGlobalEntriesStore';
import useBankAccountStore from '../../../../store/useBankAccountStore';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import WarningPrompt from "@/components/WarningPrompt";

const GlobalEntriesSection = () => {
  const [cashflow, setCashflow] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [showActions, setShowActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const { 
    globalEntries,
    isLoading,
    fetchGlobalEntries,
    updateGlobalEntry,
    deleteGlobalEntry,
    addGlobalEntry 
  } = useGlobalEntriesStore();

  const { getModeList, modeList } = useBankAccountStore();

  // Fetch payment modes on component mount
  useEffect(() => {
    getModeList();
  }, [getModeList]);

  // Fetch global entries
  useEffect(() => {
    fetchGlobalEntries();
  }, [fetchGlobalEntries]);

  // Update local state when globalEntries changes
  useEffect(() => {
    if (globalEntries) {
      // Convert object to array if it's not already an array
      const entriesArray = Array.isArray(globalEntries) 
        ? globalEntries 
        : Object.values(globalEntries);

      const formattedEntries = entriesArray.map(entry => ({
        ...entry,
        type: entry.type || "",
        amount: entry.amount || "",
        mode: entry.mode || "",
        category: entry.category || "",
        description: entry.description || ""
      }));
      setCashflow(formattedEntries);
      setOriginalData(formattedEntries);
    }
  }, [globalEntries]);


  // Table column definitions
  const columns = [
    {
      id: "date",
      header: "Date",
      renderCell: ({ value, onChange }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-9 w-[200px] justify-start text-left font-normal",
                !value && "text-[var(--neutral-gray500)]"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {value ? format(new Date(value), "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      ),
      renderEmptyCell: ({ onChange }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-9 w-[200px] justify-start text-left font-normal",
                "text-[var(--neutral-gray500)]"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Pick a date
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      ),
    },
    {
      id: "type",
      header: "Type",
      renderCell: ({ value, onChange }) => (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className="h-9 w-32 bg-[var(--neutral-white)] border-[var(--neutral-gray200)]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      ),
      renderEmptyCell: ({ onChange }) => (
        <Select onValueChange={onChange}>
          <SelectTrigger className="h-9 w-32 bg-[var(--neutral-white)] border-[var(--neutral-gray200)]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      placeholder: "₹00.00",
      renderCell: ({ value, onChange }) => (
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 bg-[var(--neutral-white)] border-[var(--neutral-gray200)]"
        />
      ),
      renderEmptyCell: ({ placeholder, onChange }) => (
        <Input
          type="number"
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 bg-[var(--neutral-white)] border-[var(--neutral-gray200)]"
        />
      ),
    },
    {
      id: "mode",
      header: "Mode",
      renderCell: ({ value, onChange }) => (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className="h-9 w-32 bg-[var(--neutral-white)] border-[var(--neutral-gray200)]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(modeList) && modeList.length > 0 ? (
              modeList.map((mode) => (
                <SelectItem key={mode.id} value={mode.mode_name}>
                  {mode.mode_name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="Cash">Cash</SelectItem>
            )}
          </SelectContent>
        </Select>
      ),
      renderEmptyCell: ({ onChange }) => (
        <Select onValueChange={onChange}>
          <SelectTrigger className="h-9 w-32 bg-[var(--neutral-white)] border-[var(--neutral-gray200)]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(modeList) && modeList.length > 0 ? (
              modeList.map((mode) => (
                <SelectItem key={mode.id} value={mode.mode_name}>
                  {mode.mode_name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="Cash">Cash</SelectItem>
            )}
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "category",
      header: "Category",
      renderCell: ({ value, onChange }) => (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className="h-9 w-32 bg-[var(--neutral-white)] border-[var(--neutral-gray200)]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Category">Category</SelectItem>
            <SelectItem value="Fuel">Fuel</SelectItem>
            <SelectItem value="Consumables">Consumables</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Staff">Staff</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      ),
      renderEmptyCell: ({ onChange }) => (
        <Select onValueChange={onChange}>
          <SelectTrigger className="h-9 w-32 bg-[var(--neutral-white)] border-[var(--neutral-gray200)]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Category">Category</SelectItem>
            <SelectItem value="Fuel">Fuel</SelectItem>
            <SelectItem value="Consumables">Consumables</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Staff">Staff</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "description",
      header: "Description",
      renderCell: ({ value, onChange }) => (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 bg-[var(--neutral-white)] border-[var(--neutral-gray200)]"
        />
      ),
      renderEmptyCell: ({ onChange }) => (
        <Input
          placeholder="Enter description"
          onChange={(e) => onChange(e.target.value)}
          className="h-9 bg-[var(--neutral-white)] border-[var(--neutral-gray200)]"
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      renderCell: ({ rowIndex, columnId, value, row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => handleDeleteRow(rowIndex, row.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const handleAddEntry = () => {
    const uniqueId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const newEntry = {
      id: uniqueId,
      date: format(new Date(), "yyyy-MM-dd"),
      type: " ",
      amount: " ",
      mode: " ",
      category: " ",
      description: " ",
    };
    setCashflow((prev) => [newEntry, ...prev]);
    setShowActions(true);
    setCurrentPage(1);
  };

  const handleUpdateRow = (rowIndex, columnId, value) => {
    let processedValue = value;

    if (columnId === "amount" && value !== "" && value !== " ") {
      processedValue = value.toString().replace(/[^\d.-]/g, "");
      if (isNaN(Number.parseFloat(processedValue)) || processedValue === "") {
        processedValue = "";
      }
    }

    const newData = JSON.parse(JSON.stringify(cashflow));
    if (rowIndex >= 0 && rowIndex < newData.length) {
      newData[rowIndex] = {
        ...newData[rowIndex],
        [columnId]: processedValue,
      };
      setCashflow(newData);
      setShowActions(true);
    }
  };

  const handleDeleteRow = (rowIndex, id) => {
    const entry = cashflow[rowIndex];
    setEntryToDelete({ rowIndex, id, entry });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!entryToDelete) return;

    const { rowIndex, id, entry } = entryToDelete;
    if (entry && entry.id && String(entry.id).startsWith("temp-")) {
      const newData = [...cashflow];
      newData.splice(rowIndex, 1);
      setCashflow(newData);
      setShowActions(true);
      toast.success('Entry deleted successfully');
    } else if (entry && entry.id) {
      deleteGlobalEntry(String(id));
      toast.success('Entry deleted successfully');
    }
    setEntryToDelete(null);
  };

  const hasEntryChanged = (original, current) => {
    if (!original) return true;
    return ["type", "amount", "mode", "category"].some(
      (field) => original[field] !== current[field]
    );
  };

  const handleSave = async () => {
    const validationErrors = new Map();
    
    cashflow.forEach((entry, index) => {
      const errors = [];
      if (!entry.type || entry.type.trim() === "") errors.push("Type");
      if (!entry.amount || entry.amount === " " || isNaN(Number.parseFloat(entry.amount))) errors.push("Amount");
      if (!entry.mode || entry.mode.trim() === "") errors.push("Mode");
      if (errors.length > 0) validationErrors.set(index, errors);
    });

    if (validationErrors.size > 0) {
      const errorMessages = Array.from(validationErrors.entries()).map(([index, errors]) => ({
        rowNumber: index + 1,
        missingFields: errors.join(", ")
      }));

      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Missing Required Fields:</span>
          {errorMessages.map(({ rowNumber, missingFields }) => (
            <span key={rowNumber} className="text-sm">
              • <span className="font-semibold">Entry {rowNumber}:</span> {missingFields}
            </span>
          ))}
        </div>,
        { duration: 5000 }
      );
      return;
    }

    const changedEntries = cashflow.filter((entry) => {
      // Convert id to string for comparison
      const entryId = String(entry.id);
      if (entryId.startsWith("temp-")) return true;
      const originalEntry = originalData.find((orig) => String(orig.id) === entryId);
      return hasEntryChanged(originalEntry, entry);
    });

    if (changedEntries.length === 0) {
      setShowActions(false);
      return;
    }

    const formattedEntries = changedEntries.map((entry) => {
      let cleanedAmount = entry.amount;
      if (typeof entry.amount === "string") {
        cleanedAmount = entry.amount.replace(/[^\d.-]/g, "");
      }
      
      return {
        ...(typeof entry.id === "number" ? { id: entry.id } : {}),
        date: entry.date || format(new Date(), "yyyy-MM-dd"),
        type: entry.type.trim(),
        amount: Number.parseFloat(cleanedAmount) || 0,
        mode: entry.mode.trim(),
        category: (entry.category || "").trim(),
        description: (entry.description || "").trim(),
        portfolio_id: null,
      };
    });
    
    try {
      await addGlobalEntry(formattedEntries);
      setShowActions(false);
    } catch (error) {
      console.error("Error updating global entries:", error);
    }
  };

  const handleReset = () => {
    setCashflow([...originalData]);
    setShowActions(false);
  };

  return (
    <div className="space-y-4">
      <WarningPrompt
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Entry"
        description="Are you sure you want to delete this entry? This action cannot be undone."
        actionText="DELETE"
        onAction={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        variant="danger"
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 md:mb-4 gap-2 sm:gap-0">
        <h2 className="text-base md:text-lg font-medium md:font-semibold">Global Entries</h2>

        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {showActions && (
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                onClick={handleSave}
                className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm rounded-lg"
                disabled={isLoading}
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm rounded-lg"
                disabled={isLoading}
              >
                Reset
              </Button>
            </div>
          )}
          <Button
            onClick={handleAddEntry}
            className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm rounded-lg flex items-center space-x-1 md:space-x-2"
            disabled={isLoading}
          >
            <CirclePlus className="h-3 w-3 md:h-4 md:w-4" />
            <span>Track Cashflow</span>
          </Button>
        </div>
      </div>

      <IslandDynamicTable
        columns={columns}
        data={cashflow}
        onUpdateRow={handleUpdateRow}
        onDeleteRow={handleDeleteRow}
        loading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        parentComponent={"globalEntries"}
      />
    </div>
  );
};

export default GlobalEntriesSection; 