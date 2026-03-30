"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Trash2, CirclePlus, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IslandDynamicTable } from "../Component/IslandDynamicTable";
import { SummaryCard } from "./cashflow-summary-card";
import useGlobalDateStore from "../../../../store/useGlobalStore";
import { formatINR } from "@/lib/utils/formatters";
import useBankAccountStore from "../../../../store/useBankAccountStore";
import { toast } from "react-hot-toast";
import { CASHFLOW_CATEGORIES } from "@/pages/constants";
import WarningPrompt from "@/components/WarningPrompt";
import TooltipMessage from "@/components/TooltipMessage";
import { useCashflowTabQuery } from "@/queryHooks/storeCachedQueries/useCashflowTabQuery";
import { useCashflowStore } from "../../../../store/usePortfolioStore";
import { useCreditNavigationStore } from "../../../../store/useCreditNavigationStore";
import { useNavigate, useParams } from "react-router-dom";

export function CashflowTab({ shift }) {
  const { IslandSelectedDate } = useGlobalDateStore();
  const { getModeList, modeList } = useBankAccountStore();
  const { cashflowSummary: storeCashflowSummary } = useCashflowStore();
  const { navigateToCreditEntries } = useCreditNavigationStore();
  const navigate = useNavigate();
  
  // Get portfolio name from URL params
  const { portfolioName } = useParams();
  
  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [cashflow, setCashflow] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [showActions, setShowActions] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState(null);

  // React Query hook
  const {
    cashflowData,
    cashflowSummary,
    isCashflowLoading,
    isSummaryLoading,
    isUpserting,
    isDeleting,
    upsertCashflow,
    deleteCashflowMutation,
  } = useCashflowTabQuery(shift.portfolio_id, shift.shift_id, IslandSelectedDate);

  // Compute loading state
  const isLoading = useMemo(() => 
    isCashflowLoading || isSummaryLoading || isUpserting || isDeleting,
    [isCashflowLoading, isSummaryLoading, isUpserting, isDeleting]
  );

  // Fetch payment modes on component mount
  useEffect(() => {
    getModeList();
  }, [getModeList]);

  // Update local state when cashflowData changes
  useEffect(() => {
    if (Array.isArray(cashflowData)) {
      setCashflow(cashflowData);
      setOriginalData(cashflowData);
    } else if (cashflowData && typeof cashflowData === 'object') {
      // Handle case where data might be an object instead of array
      const dataArray = Object.values(cashflowData);
      setCashflow(dataArray);
      setOriginalData(dataArray);
    } else {
      setCashflow([]);
      setOriginalData([]);
    }
  }, [cashflowData]);

  // Calculate mode breakdown for the summary cards
  const breakdownByMode = useMemo(() => {
    const modeBreakdown = {
      income: {},
      expense: {},
      credit: {},
      total: {},
    };

    if (Array.isArray(cashflowData)) {
      cashflowData.forEach((entry) => {
        const amount = entry.amount || 0;
        const mode = entry.mode
          ? entry.mode.charAt(0).toUpperCase() + entry.mode.slice(1)
          : "Cash";
        if (entry.type === "net income") {
          modeBreakdown.income[mode] =
            (modeBreakdown.income[mode] || 0) + amount;
        } else if (entry.type === "expense") {
          modeBreakdown.expense[mode] =
            (modeBreakdown.expense[mode] || 0) + amount;
        }
      });
    }

    const formatBreakdown = (modeData) => {
      return Object.entries(modeData).map(([mode, amount]) => ({
        mode,
        amount: formatINR(amount),
      }));
    };
    return {
      income: formatBreakdown(modeBreakdown.income),
      expense: formatBreakdown(modeBreakdown.expense),
      credit: formatBreakdown(modeBreakdown.credit),
      total: formatBreakdown(modeBreakdown.total),
    };
  }, [cashflowData]);

  /**
   * Opens the delete confirmation dialog
   * @param {Object} data - Data to delete
   */
  const handleDialogOpen = useCallback((data) => {
    if (!data) return;
    setDialogOpen(true);
    setDialogData(data);
  }, []);

  /**
   * Deletes a cashflow entry after confirmation
   */
  const handleDelete = useCallback(async () => {
    try {
      setDialogOpen(false);
      setDialogData(null);
      await deleteCashflowMutation(dialogData);
      setShowActions(false);
    } catch (error) {
      console.error("Error deleting cashflow:", error);
    }
  }, [dialogData, deleteCashflowMutation]);

  /**
   * Adds a new cashflow entry to the table
   */
  const handleAddCashflow = useCallback(() => {
    const uniqueId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    const newCashflow = {
      id: uniqueId,
      type: " ",
      amount: " ",
      mode: " ",
      category: " ",
      description: " ",
    };
    setCashflow((prev) => [newCashflow, ...prev]);
    setShowActions(true);
    setCurrentPage(1);
  }, []);

  /**
   * Updates a row in the table
   * @param {number} rowIndex - Index of the row to update
   * @param {string} columnId - ID of the column to update
   * @param {any} value - New value for the cell
   */
  const handleUpdateRow = useCallback((rowIndex, columnId, value) => {
    let processedValue = value;

    if (columnId === "amount" && value !== "" && value !== " ") {
      processedValue = value.toString().replace(/[^\d.-]/g, "");

      if (isNaN(Number.parseFloat(processedValue)) || processedValue === "") {
        processedValue = "";
      }
    }

    setCashflow(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));

      if (rowIndex >= 0 && rowIndex < newData.length) {
        newData[rowIndex] = {
          ...newData[rowIndex],
          [columnId]: processedValue,
        };

        return newData;
      }
      return prevData;
    });
    
    setShowActions(true);
  }, []);

  /**
   * Deletes a row from the table
   * @param {number} rowIndex - Index of the row to delete
   * @param {string|number} id - ID of the row
   */
  const handleDeleteRow = useCallback((rowIndex, id) => {
    const entryToDelete = cashflow[rowIndex];
    if (
      entryToDelete &&
      entryToDelete.id &&
      typeof entryToDelete.id === "string" &&
      entryToDelete.id.startsWith("temp-")
    ) {
      setCashflow(prev => {
        const newData = [...prev];
        newData.splice(rowIndex, 1);
        return newData;
      });
      setShowActions(true);
    } else if (entryToDelete && entryToDelete.id) {
      handleDialogOpen(id);
    }
  }, [cashflow, handleDialogOpen]);

  /**
   * Checks if an entry has changed from its original state
   * @param {Object} original - Original entry data
   * @param {Object} current - Current entry data
   * @returns {boolean} True if entry has changed
   */
  const hasEntryChanged = useCallback((original, current) => {
    if (!original) return true;

    return ["type", "amount", "mode", "category", "description"].some(
      (field) => original[field] !== current[field]
    );
  }, []);

  /**
   * Saves all changes to the cashflow data
   * @param {Array} data - Data to save
   */
  const handleSave = useCallback(async (data) => {
    // Track validation errors for each row
    const validationErrors = new Map();
    
    // Validate entries before saving
    data.forEach((entry, index) => {
      const errors = [];
      
      if (!entry.type || entry.type.trim() === "") {
        errors.push("Type");
      }
      
      if (!entry.amount || entry.amount === " " || isNaN(Number.parseFloat(entry.amount))) {
        errors.push("Amount");
      }
      
      if (!entry.mode || entry.mode.trim() === "") {
        errors.push("Mode");
      }
      
      if (errors.length > 0) {
        validationErrors.set(index, errors);
      }
    });

    if (validationErrors.size > 0) {
      const errorMessages = Array.from(validationErrors.entries()).map(([index, errors]) => {
        const entry = data[index];
        const rowNumber = index + 1;
        return {
          rowNumber,
          missingFields: errors.join(", ")
        };
      });

      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Missing Required Fields:</span>
          {errorMessages.map(({ rowNumber, missingFields }) => (
            <span key={rowNumber} className="text-sm">
              • <span className="font-semibold">Cashflow Entry {rowNumber}:</span> {missingFields}
            </span>
          ))}
        </div>,
        { duration: 5000 }
      );
      
      return;
    }

    // Find changed entries
    const changedEntries = data.filter((entry) => {
      if (typeof entry.id === "string" && entry.id.startsWith("temp-")) {
        return true;
      }

      const originalEntry = originalData.find((orig) => orig.id === entry.id);
      return hasEntryChanged(originalEntry, entry);
    });

    if (changedEntries.length === 0) {
      setShowActions(false);
      return;
    }

    // Format data for API
    const formattedEntries = changedEntries.map((entry) => {
      let cleanedAmount = entry.amount;
      if (typeof entry.amount === "string") {
        cleanedAmount = entry.amount.replace(/[^\d.-]/g, "");
      }
      
      return {
        ...(typeof entry.id === "number" ? { id: entry.id } : {}),
        type: entry.type.trim(),
        amount: Number.parseFloat(cleanedAmount) || 0,
        mode: entry.mode.trim(),
        category: (entry.category || "").trim(),
        description: (entry.description || "").trim(),
        portfolio_id: shift.portfolio_id,
        shift_id: shift.shift_id,
        date: IslandSelectedDate
      };
    });
    
    try {
      await upsertCashflow({ cashflow: formattedEntries });
      setShowActions(false);
    } catch (error) {
      console.error("Error details:", error);
    }
  }, [originalData, hasEntryChanged, shift.portfolio_id, shift.shift_id, IslandSelectedDate, upsertCashflow]);

  /**
   * Resets the table data to its original state
   */
  const handleReset = useCallback(() => {
    setCashflow([...originalData]);
    setShowActions(false);
  }, [originalData]);

  /**
   * Navigates to credit entries with current filters
   */
  const handleNavigateToCreditEntries = useCallback(() => {
    try {
      const filters = {
        dateRange: {
          startDate: IslandSelectedDate,
          endDate: IslandSelectedDate,
        },
        portfolioName: portfolioName || null,
        shiftName: shift?.label || null, // Use 'label' instead of 'shift_name'
        islandName: portfolioName || null,
      };
      
      navigateToCreditEntries(filters, "cashflowTab");
      navigate("/global-credit");
    } catch (error) {
      console.error("Error navigating to credit entries:", error);
      toast.error("Failed to navigate to credit entries");
    }
  }, [IslandSelectedDate, shift, navigateToCreditEntries, navigate]);

  // Memoized table column definitions
  const columns = useMemo(() => [
    {
      id: "type",
      header: "Type",
      renderCell: ({ value, onChange }) => (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]">
            <SelectItem value="net income" className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">Income</SelectItem>
            <SelectItem value="expense" className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">Expense</SelectItem>
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
          className="h-9 text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]"
          placeholder="Enter amount"
        />
      ),
      renderEmptyCell: ({ placeholder, onChange }) => (
        <Input
          type="number"
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
        />
      ),
    },
    {
      id: "mode",
      header: "Mode",
      renderCell: ({ value, onChange }) => (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]">
            {Array.isArray(modeList) && modeList.length > 0 ? (
              modeList.map((mode) => (
                <SelectItem key={mode.id} value={mode.mode_name} className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                  {mode.mode_name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="Cash" className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">Cash</SelectItem>
            )}
          </SelectContent>
        </Select>
      ),
      renderEmptyCell: ({ onChange }) => (
        <Select onValueChange={onChange}>
          <SelectTrigger className="h-9">
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
      renderCell: ({ value, onChange, row }) => (
        <div className="flex items-center gap-2">
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]">
              {row && row.type === "net income" 
                ? CASHFLOW_CATEGORIES.income.map((option) => (
                    <SelectItem key={option} value={option} className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                      {option}
                    </SelectItem>
                  ))
                : CASHFLOW_CATEGORIES.expense.map((option) => (
                    <SelectItem key={option} value={option} className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                      {option}
                    </SelectItem>
                  ))
              }
            </SelectContent>
          </Select>
        </div>
      ),
      renderEmptyCell: ({ onChange, row }) => (
        <Select onValueChange={onChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {row && row.type === "net income"
              ? CASHFLOW_CATEGORIES.income.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))
              : CASHFLOW_CATEGORIES.expense.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))
            }
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "description",
      header: "Description",
      renderCell: ({ value, onChange }) => (
        <Input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]"
          placeholder="Enter description"
        />
      ),
      renderEmptyCell: ({ onChange }) => (
        <Input
          placeholder="Enter description"
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      renderCell: ({ rowIndex, columnId, value, row }) => (
        <TooltipMessage message="Delete cashflow">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => handleDeleteRow(rowIndex , row?.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        </TooltipMessage>
      ),
      renderEmptyCell: ({ rowIndex }) => (
        <TooltipMessage message="Delete cashflow">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => handleDeleteRow(rowIndex)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        </TooltipMessage>
      ),
    },
  ], [modeList, handleDeleteRow]);

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <SummaryCard
          title="Net Income"
          value={formatINR(cashflowSummary?.net_income || 0)}
          icon="income"
          details={breakdownByMode.income}
          loading={isLoading}
        />
        <SummaryCard
          title="Expense"
          value={formatINR(cashflowSummary?.expense || 0)}
          icon="expense"
          details={breakdownByMode.expense}
          loading={isLoading}
        />
        <SummaryCard
          title="Credit"
          value={formatINR(cashflowSummary?.credit || 0)}
          icon="credit"
          details={breakdownByMode.credit}
          loading={isLoading}
          onClick={handleNavigateToCreditEntries}
        />
        <div className="relative">
          <SummaryCard
            title="Net Cashflow"
            value={formatINR(cashflowSummary?.total_cashflow || 0)}
            icon="total"
            details={breakdownByMode.total}
            secondaryAmount={formatINR(storeCashflowSummary?.totalSales || 0)}
            untrackedAmount={
              cashflowSummary?.total_cashflow < storeCashflowSummary?.totalSales
                ? Math.abs(
                    (storeCashflowSummary?.totalSales || 0) - (cashflowSummary?.total_cashflow || 0)
                  )
                : 0
            }
            ledgerBalanced={
              cashflowSummary?.total_cashflow !== 0 &&
              storeCashflowSummary?.totalSales === cashflowSummary?.total_cashflow
                ? "Balanced"
                : null
            }
            excessAmount={
              cashflowSummary?.total_cashflow > storeCashflowSummary?.totalSales
                ? Math.abs(
                    (storeCashflowSummary?.totalSales || 0) - (cashflowSummary?.total_cashflow || 0)
                  )
                : 0
            }
            isTotal={true}
            loading={isLoading}
          />
          <Popover>
            <PopoverTrigger asChild>
              <button className="absolute top-3 right-3 p-1 rounded-md hover:bg-gray-100 transition-colors z-10">
                <Info className="h-4 w-4 text-gray-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4 shadow-lg -translate-x-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-xs text-gray-900">Net Cashflow Overview</h4>
                <div className="space-y-2 text-xs">
                  <div className="text-center py-2 px-3 bg-gray-50 rounded-md">
                    <div className="text-gray-600 mb-1.5 text-[10px]">Tracked Amount / Total Sales</div>
                    <div className="font-medium text-gray-900 text-sm">
                      {formatINR(cashflowSummary?.total_cashflow || 0)} / {formatINR(storeCashflowSummary?.totalSales || 0)}
                    </div>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <p className="text-[11px] text-gray-500 font-medium mb-1.5">Status:</p>
                    <ul className="text-[11px] text-gray-500 space-y-1">
                      <li>• <span className="font-medium text-green-600 text-[12px]">Balanced:</span> Amounts match</li>
                      <li>• <span className="font-medium text-red-600 text-[12px]">Untracked:</span> Missing entries</li>
                      <li>• <span className="font-medium text-orange-600 text-[12px]">Excess:</span> More cashflow</li>
                    </ul>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 md:mb-4 gap-2 sm:gap-0">
        <h2 className="text-base md:text-lg font-medium md:font-semibold text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">Cashflow</h2>

        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {showActions && (
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                onClick={() => handleSave(cashflow)}
                className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm rounded-lg bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-[var(--neutral-white)]"
                disabled={isLoading}
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm rounded-lg text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)] hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)]"
                disabled={isLoading}
              >
                Reset
              </Button>
            </div>
          )}
          <Button
            onClick={handleAddCashflow}
            className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm rounded-lg flex items-center space-x-1 md:space-x-2 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-[var(--neutral-white)]"
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
        parentComponent={"cashflowTab"}
      />

      {dialogOpen && (
        <WarningPrompt
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Delete Cashflow Entry"
          description="Are you sure you want to delete this cashflow entry? This action cannot be undone."
          actionText="DELETE"
          onAction={() => {
            handleDelete();
            setDialogOpen(false);
          }}
          onCancel={() => setDialogOpen(false)}
          variant="danger"
        />
      )}
    </div>
  );
}
