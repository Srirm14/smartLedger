import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  MinusCircle,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  Trash2,
  X,
  Plus,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { EditInventoryForm } from "./forms/edit-inventory-form";
import { AddStockForm } from "./forms/add-stock-form";
import { TrackSalesForm } from "./forms/track-sales-form";
import { LinkSalesUnitForm } from "./forms/link-sales-unit-form";
import { UnlinkSalesUnitForm } from "./forms/unlink-sales-unit-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ContentHeader } from "@/components/Header/ContentHeader";
import { toast } from "react-hot-toast";
import { useStockDetailsStore } from "../../../store/useStockManagement";
import useGlobalDateStore from "../../../store/useGlobalStore";
import { getResponsiveWidth } from "@/lib/utils/responsiveWidth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  linkSalesUnitToStock,
  unlinkSalesUnitFromStock,
  getSalesUnitProduct,
  updateStockDetails,
} from "./api/inventoryService";
import Backdrop from "@/components/Backdrop";
import TooltipMessage from "@/components/TooltipMessage";
import noDataPresentSvg from "../../assets/illustrations/noDataPresent.svg";

export const InventoryDetails = () => {
  const { management: inventoryId } = useParams();
  const navigate = useNavigate();
  const selectedDate = useGlobalDateStore((state) => state.selectedDate);
  const responsiveWidth = getResponsiveWidth();

  // Get store state and actions
  const {
    stockDetails,
    stockHeader,
    stockTransactions,
    stockSalesHistory,
    stockDetailsLoading,
    stockHeaderLoading,
    stockTransactionsLoading,
    stockSalesHistoryLoading,
    stockDetailsError,
    stockHeaderError,
    stockTransactionsError,
    stockSalesHistoryError,
    fetchStockDetails,
    fetchStockHeader,
    fetchStockTransactions,
    fetchStockSalesHistory,
    updateLowStockAlert,
    getStockDetails,
    getStockHeader,
    getStockTransactions,
    getStockSalesHistory,
    addStockTransaction,
    updateStockTransaction,
    deleteStockTransaction,
  } = useStockDetailsStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddStockForm, setShowAddStockForm] = useState(false);
  const [showTrackSalesForm, setShowTrackSalesForm] = useState(false);

  // Low Stock Alert State
  const [lowStockAlert, setLowStockAlert] = useState({
    enabled: false,
    threshold: 0,
  });
  const [isLowStockAlertDirty, setIsLowStockAlertDirty] = useState(false);
  const [visibleTransactions, setVisibleTransactions] = useState(10);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showEditTransactionForm, setShowEditTransactionForm] = useState(false);
  const [showLinkSalesUnitDialog, setShowLinkSalesUnitDialog] = useState(false);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [salesUnitToUnlink, setSalesUnitToUnlink] = useState(null);
  const [salesUnitNameToUnlink, setSalesUnitNameToUnlink] = useState("");

  useEffect(() => {
    if (inventoryId) {
      fetchStockDetails(inventoryId);
      fetchStockHeader(inventoryId, selectedDate);
      fetchStockTransactions(inventoryId);
      fetchStockSalesHistory(inventoryId, selectedDate);
    }
  }, [
    inventoryId,
    selectedDate,
    fetchStockDetails,
    fetchStockHeader,
    fetchStockTransactions,
    fetchStockSalesHistory,
  ]);

  // Get current data from store
  const currentStockDetails = getStockDetails();
  const currentStockHeader = getStockHeader();
  const currentTransactions = getStockTransactions();
  const currentSalesHistory = getStockSalesHistory();

  // Initialize low stock alert settings when stock details are loaded
  useEffect(() => {
    if (currentStockDetails) {
      setLowStockAlert({
        enabled: currentStockDetails.low_stock_alert,
        threshold: currentStockDetails.low_stock_limit,
      });
      setIsLowStockAlertDirty(false);
    }
  }, [currentStockDetails]);

  const handleLowStockToggle = async (checked) => {
    setLowStockAlert((prev) => ({ ...prev, enabled: checked }));
    setIsLowStockAlertDirty(true);
  };

  const handleLowStockThresholdChange = (e) => {
    const value = e.target.value;
    setLowStockAlert((prev) => ({
      ...prev,
      threshold: value === "" ? "" : Number(value),
    }));
    setIsLowStockAlertDirty(true);
  };

  const handleSaveLowStockAlert = async () => {
    try {
      const thresholdValue = Number(lowStockAlert.threshold);
      if (isNaN(thresholdValue) || thresholdValue < 0) {
        toast.error("Please enter a valid positive number for the threshold.");
        return;
      }

      await updateLowStockAlert(
        inventoryId,
        lowStockAlert.enabled,
        thresholdValue
      );
      setIsLowStockAlertDirty(false);
      toast.success("Low stock alert settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save low stock alert settings.");
    }
  };

  const handleCancelLowStockAlert = () => {
    const details = getStockDetails();
    setLowStockAlert({
      enabled: details.low_stock_alert,
      threshold: details.low_stock_limit,
    });
    setIsLowStockAlertDirty(false);
  };

  const formatDate = (date) => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date value");
      }
      return format(dateObj, "dd MMM yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleShowMoreTransactions = () => {
    const transactions = getStockTransactions();
    if (showAllTransactions) {
      setVisibleTransactions(10);
      setShowAllTransactions(false);
    } else {
      setVisibleTransactions(transactions.length);
      setShowAllTransactions(true);
    }
  };

  const stockPercentage =
    stockHeader?.capacity > 0
      ? Math.round((stockHeader.stock_level / stockHeader.capacity) * 100)
      : 0;

  const stockStats = {
    stockIn: stockHeader?.inbound || 0,
    stockOut: stockHeader?.outbound || 0,
  };

  const handleAddStock = async (data) => {
    try {
      const response = await addStockTransaction(data);
      if (response.status === "success") {
        setShowAddStockForm(false);
        // Refresh stock header to update summary cards
        await fetchStockHeader(inventoryId, selectedDate);
      }
    } catch (error) {}
  };

  const handleTrackSales = async (data) => {
    try {
      const response = await addStockTransaction(data);
      if (response.status === "success") {
        setShowTrackSalesForm(false);
        // Refresh stock header to update summary cards
        await fetchStockHeader(inventoryId, selectedDate);
      }
    } catch (error) {}
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowEditTransactionForm(true);
  };

  const handleEditTransactionSubmit = async (data) => {
    try {
      const response = await updateStockTransaction({
        ...data,
        stock_id: inventoryId,
        id: selectedTransaction.reference_no, // Use the transaction's database ID
        transaction_type: selectedTransaction.type, // Include transaction type for API
      });
      if (response.status === "success") {
        setShowEditTransactionForm(false);
        setSelectedTransaction(null);
        // Refresh stock header to update summary cards
        await fetchStockHeader(inventoryId, selectedDate);
      }
    } catch (error) {
      // Error is already handled in the store
    }
  };

  const handleDeleteTransaction = (transaction) => {
    console.log(transaction , "transaction");
    setSelectedTransaction(transaction);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return;

    try {
      const response = await deleteStockTransaction({
        id: selectedTransaction.reference_no,
        stock_id: inventoryId,
      });
      if (response.status === "success") {
        setShowDeleteDialog(false);
        setSelectedTransaction(null);
        // Refresh stock header to update summary cards
        await fetchStockHeader(inventoryId, selectedDate);
      }
    } catch (error) {
      // Error is already handled in the store
    }
  };
  const handleLinkSalesUnit = async (salesUnitId) => {
    try {
      const response = await linkSalesUnitToStock({
        sales_unit_id: salesUnitId,
        stock_id: currentStockDetails.id,
      });
      if (response.status === "success") {
        toast.success("Sales unit linked successfully");
        fetchStockDetails(inventoryId); // Refresh the details
      }
    } catch (error) {
      toast.error("Failed to link sales unit");
    }
  };

  const handleUnlinkSalesUnit = async (salesUnitId) => {
    try {
      const response = await unlinkSalesUnitFromStock({
        sales_unit_id: salesUnitId,
        stock_id: currentStockDetails.id,
      });
      if (response.status === "success") {
        toast.success("Sales unit unlinked successfully");
        fetchStockDetails(inventoryId); // Refresh the details
      }
    } catch (error) {
      toast.error("Failed to unlink sales unit");
    }
  };

  // --- Render Component ---
  return (
    <>
      <ContentHeader
        isLoading={
          stockDetailsLoading ||
          stockHeaderLoading ||
          stockTransactionsLoading ||
          stockSalesHistoryLoading
        }
        title={
          stockDetailsLoading || stockHeaderLoading || !currentStockDetails
            ? "Loading Inventory..."
            : `Inventory: ${currentStockDetails.stock_name}`
        }
        description={
          stockDetailsLoading || stockHeaderLoading || !currentStockDetails
            ? "Fetching details..."
            : `Details and transaction history for ${currentStockDetails.product_name}`
        }
        showBackButton={true}
        onBack={() => navigate("/inventory-management")}
        displayDatePicker={false}
      />
      <div
        className={`container mx-auto px-4 py-4 my-auto ${responsiveWidth.base} ${responsiveWidth.lg} ${responsiveWidth.xl}`}
      >
        {/* --- Error State --- */}
        {(stockDetailsError ||
          stockHeaderError ||
          stockTransactionsError ||
          stockSalesHistoryError) && (
          <Card className="mt-1 shadow-sm">
            <CardContent className="p-6">
              <p className="font-semibold">Error</p>
              <p>
                {stockDetailsError ||
                  stockHeaderError ||
                  stockTransactionsError ||
                  stockSalesHistoryError}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate("/inventory-management")}
              >
                Back to List
              </Button>
            </CardContent>
          </Card>
        )}
        {/* --- Loading State (Skeleton) --- */}
        {(stockDetailsLoading ||
          stockHeaderLoading ||
          stockTransactionsLoading ||
          stockSalesHistoryLoading) && (
          <Card className="mt-6 shadow-sm">
            <CardContent className="p-6 space-y-6">
              {/* Header Skeleton */}
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-6 w-48" />
              </div>
              {/* Summary Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="border shadow-sm col-span-1 md:col-span-3">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-2 w-full" />
                    <div className="flex justify-between items-center mt-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs Skeleton */}
              <div className="space-y-4">
                <div className="flex justify-start">
                  <Skeleton className="h-10 w-32 rounded-full mr-2" />
                  <Skeleton className="h-10 w-40 rounded-full mr-2" />
                  <Skeleton className="h-10 w-32 rounded-full" />
                </div>

                {/* Content Area Skeleton */}
                <div className="mt-4">
                  <Card className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-1 md:col-span-2">
                          <Skeleton className="h-6 w-32 mb-4" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[...Array(6)].map((_, i) => (
                              <div key={i}>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-6 w-32" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Skeleton className="h-6 w-32 mb-4" />
                          <Skeleton className="h-10 w-full mb-4" />
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* --- Data Loaded State --- */}
        {!stockDetailsError &&
          !stockDetailsLoading &&
          !stockHeaderLoading &&
          !stockTransactionsLoading &&
          !stockSalesHistoryLoading &&
          currentStockDetails && (
            <Card className="mt-6 shadow-sm">
              <CardContent className="p-6">
                {/* Top Section: Summary Cards */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-800">
                    Stock Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Current Stock Card */}
                  <Card className="border shadow-sm col-span-1 md:col-span-3">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm text-gray-500">
                          Current stock
                        </h3>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddStockForm(true)}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Stock
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowTrackSalesForm(true)}
                          >
                            <MinusCircle className="mr-2 h-4 w-4" />
                            Track Sales
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-semibold">
                          {currentStockHeader?.stock_level}{" "}
                          {currentStockDetails.uom}
                        </span>
                        <span className="text-gray-500 ml-2">
                          / {currentStockHeader?.capacity}{" "}
                          {currentStockDetails.uom}
                        </span>
                        {currentStockHeader?.stock_level >
                          currentStockHeader?.capacity && (
                          <Badge
                            variant="warning"
                            className="ml-2"
                          >
                            Excess Quantity
                          </Badge>
                        )}
                        {lowStockAlert.enabled &&
                          currentStockHeader?.stock_level <
                            lowStockAlert.threshold && (
                            <Badge
                              variant="destructive"
                              className="ml-2"
                            >
                              Low Stock Alert
                            </Badge>
                          )}
                      </div>
                      <div className="mt-2 bg-gray-200 h-2 rounded-full w-full">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.min(stockPercentage, 100)}%`,
                            backgroundColor:
                              stockPercentage < 30
                                ? "var(--danger-600)"
                                : stockPercentage < 60
                                ? "var(--warning-600)"
                                : "var(--success-600)",
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.min(stockPercentage, 100)}%
                        </div>
                        <div className="text-xs text-gray-700 mt-1 flex items-center space-x-1">
                          <span className="text-gray-500 font-medium">till date</span>
                          <span className="text-gray-300 font-bold">•</span>
                          <span className="text-success-700 font-medium">
                            + {stockStats.stockIn} {currentStockDetails.uom} In
                          </span>
                          <span className="text-gray-300 font-bold">•</span>
                          <span className="text-danger-700 font-medium">
                            - {stockStats.stockOut} {currentStockDetails.uom} Out
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs Section */}
                <div className="space-y-4">
                  <div className="flex justify-start">
                    <div className="inline-flex rounded-full bg-gray-100 p-1">
                      <button
                        onClick={() => setActiveTab("overview")}
                        className={`rounded-full px-6 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                          activeTab === "overview"
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setActiveTab("transaction-history")}
                        className={`rounded-full px-6 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                          activeTab === "transaction-history"
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Stock Movement
                      </button>
                      <button
                        onClick={() => setActiveTab("sales-history")}
                        className={`rounded-full px-6 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                          activeTab === "sales-history"
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Nozzle Sales
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Inventory Details Card */}
                          <Card className="col-span-1 md:col-span-2 border shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">
                                  Inventory Details
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowEditForm(true)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Details
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                <div>
                                  <h4 className="text-sm text-gray-500">
                                    Inventory Name
                                  </h4>
                                  <p className="font-medium">
                                    {currentStockDetails.stock_name}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm text-gray-500">
                                    Product Name
                                  </h4>
                                  <p className="font-medium">
                                    {currentStockDetails.product_name}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm text-gray-500">
                                    Type
                                  </h4>
                                  <p className="font-medium">
                                    {currentStockDetails.type}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm text-gray-500">UOM</h4>
                                  <p className="font-medium">
                                    {currentStockDetails.uom}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm text-gray-500">
                                    Capacity
                                  </h4>
                                  <p className="font-medium">
                                    {currentStockDetails.capacity}{" "}
                                    {currentStockDetails.uom}
                                  </p>
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                  <h4 className="text-sm text-gray-500 mb-2">
                                    Linked Sales Units
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {currentStockDetails.sales_unit_names &&
                                    currentStockDetails.sales_unit_names
                                      .length > 0 ? (
                                      <>
                                        {currentStockDetails.sales_unit_names.map(
                                          (unit, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="px-3 py-1 flex items-center gap-1"
                                            >
                                              {unit}
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-transparent"
                                                onClick={() => {
                                                  setSalesUnitToUnlink(
                                                    currentStockDetails
                                                      .sales_unit_ids[index]
                                                  );
                                                  setSalesUnitNameToUnlink(
                                                    currentStockDetails
                                                      .sales_unit_names[index]
                                                  );
                                                  setShowUnlinkDialog(true);
                                                }}
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            </Badge>
                                          )
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            setShowLinkSalesUnitDialog(true)
                                          }
                                          className="h-8 w-8 p-0 hover:bg-gray-100"
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm text-gray-400">
                                          No sales units linked
                                        </p>
                                        <TooltipMessage message="Link sales unit">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            setShowLinkSalesUnitDialog(true)
                                          }
                                          className="h-8 w-8 "
                                        >
                                            <Plus className="h-4 w-4" />
                                          </Button>
                                        </TooltipMessage>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Low Stock Alert Card */}
                          <Card className="border shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">
                                  Low Stock Alert
                                </h3>
                                <Switch
                                  id="low-stock-enabled"
                                  checked={lowStockAlert.enabled}
                                  onCheckedChange={handleLowStockToggle}
                                  aria-label="Toggle low stock alert"
                                />
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <Label
                                    htmlFor="threshold"
                                    className={
                                      !lowStockAlert.enabled
                                        ? "text-gray-400"
                                        : ""
                                    }
                                  >
                                    Notify when stock is below
                                  </Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Input
                                      id="threshold"
                                      type="number"
                                      value={lowStockAlert.threshold}
                                      onChange={handleLowStockThresholdChange}
                                      disabled={!lowStockAlert.enabled}
                                      min="0"
                                      className={
                                        !lowStockAlert.enabled
                                          ? "disabled:opacity-70"
                                          : ""
                                      }
                                      placeholder="e.g., 1000"
                                    />
                                    <span
                                      className={`text-sm ${
                                        !lowStockAlert.enabled
                                          ? "text-gray-400"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {currentStockDetails.uom}
                                    </span>
                                  </div>
                                  {!lowStockAlert.enabled && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      Enable the switch to set a threshold.
                                    </p>
                                  )}
                                </div>

                                {isLowStockAlertDirty && (
                                  <div className="flex justify-end items-center pt-4 border-t mt-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mr-2 text-gray-600 hover:text-gray-800"
                                      onClick={handleCancelLowStockAlert}
                                    >
                                      <RotateCcw className="h-4 w-4 mr-1" />
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={handleSaveLowStockAlert}
                                    >
                                      <Save className="h-4 w-4 mr-1" />
                                      Save Changes
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}

                    {activeTab === "transaction-history" && (
                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <h3 className="text-lg font-medium mb-4">
                            Transaction History
                          </h3>
                          {currentTransactions &&
                          currentTransactions.length > 0 ? (
                            <div className="space-y-2">
                              <Accordion type="multiple" className="w-full">
                                {currentTransactions
                                  .slice(0, visibleTransactions)
                                  .map((transaction) => (
                                    <AccordionItem
                                      key={transaction.id}
                                      value={`transaction-${transaction.id}`}
                                      className="border-b last:border-b-0"
                                    >
                                      <div className="flex items-center justify-between py-3 hover:bg-gray-50/50 rounded-md -mx-2 px-2">
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                          <div
                                            className="p-2 rounded-full"
                                            style={{
                                              backgroundColor:
                                                transaction.type === "inbound"
                                                  ? "var(--success-100)"
                                                  : "var(--danger-100)",
                                            }}
                                          >
                                            {transaction.type === "inbound" ? (
                                              <ArrowDownRight
                                                className="h-5 w-5"
                                                style={{
                                                  color: "var(--success-600)",
                                                }}
                                              />
                                            ) : (
                                              <ArrowUpRight
                                                className="h-5 w-5"
                                                style={{
                                                  color: "var(--danger-600)",
                                                }}
                                              />
                                            )}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">
                                              {transaction.type === "inbound"
                                                ? "Stock In"
                                                : "Stock Out"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {formatDate(transaction.date)}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="text-right ml-4 flex-shrink-0">
                                          <p
                                            className="font-medium text-sm"
                                            style={{
                                              color:
                                                transaction.type === "inbound"
                                                  ? "var(--success-600)"
                                                  : "var(--danger-600)",
                                            }}
                                          >
                                            {transaction.type === "inbound"
                                              ? "+"
                                              : "-"}{" "}
                                            {transaction.quantity}{" "}
                                            {currentStockDetails.uom}
                                          </p>
                                          <p className="text-xs text-neutral-gray500 truncate max-w-[150px]">
                                            {transaction.reference_no || (
                                              <span className="italic">
                                                No reference
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-gray-100"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditTransaction(
                                                transaction
                                              );
                                            }}
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteTransaction(
                                                transaction
                                              );
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                          <AccordionTrigger className="py-0 px-2 [&[data-state=open]>svg]:rotate-180" />
                                        </div>
                                      </div>

                                      <AccordionContent className="pt-3 pb-4 pl-12 pr-4 bg-gray-50 rounded-b-md">
                                        <h4 className="text-xs uppercase text-gray-500 font-semibold mb-2">
                                          Details
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                          <div>
                                            <p className="text-gray-500">
                                              Amount:
                                            </p>
                                            <p className="font-medium">
                                              ₹{transaction.amount}
                                            </p>
                                          </div>
                                          {transaction.notes && (
                                            <div className="col-span-1 sm:col-span-2">
                                              <p className="text-gray-500">
                                                Notes:
                                              </p>
                                              <p className="font-medium whitespace-pre-wrap">
                                                {transaction.notes}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                              </Accordion>
                              {currentTransactions.length > 10 && (
                                <div className="flex justify-center pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={handleShowMoreTransactions}
                                    className="text-sm"
                                  >
                                    {showAllTransactions ? (
                                      <>
                                        <ChevronUp className="h-4 w-4 mr-2" />
                                        Show Less
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="h-4 w-4 mr-2" />
                                        Show More (
                                        {currentTransactions.length -
                                          visibleTransactions}{" "}
                                        more)
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-neutral-gray400 flex flex-col gap-2 items-center">
                              <img 
                                src={noDataPresentSvg} 
                                alt="No data available" 
                                width={180} 
                                height={180}
                                priority
                              />
                              <div className="flex flex-col gap-1">
                              <p className="text-sm font-medium">
                                No transaction history available for this item.
                              </p>
                              <p className="text-sm">
                                Add stock or track sales to start recording
                                history.
                              </p>
                              </div>
                            
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {activeTab === "sales-history" && (
                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <h3 className="text-lg font-medium mb-4">
                            Sales History
                          </h3>
                          {currentSalesHistory &&
                          currentSalesHistory.length > 0 ? (
                            <div className="space-y-0">
                              {currentSalesHistory.map((sale, index) => (
                                <div
                                  key={index}
                                  className="border-b last:border-b-0"
                                >
                                  <div className="flex items-center justify-between py-3 hover:bg-gray-50/50 rounded-md -mx-2 px-2">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-2 rounded-full bg-blue-100">
                                        <ArrowUpRight className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">
                                          Sales
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {formatDate(sale.date)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Sales Unit {sale.sales_unit_id}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-sm text-blue-600">
                                        - {sale.sold_quantity}{" "}
                                        {currentStockDetails.uom}
                                      </p>
                                      <p className="text-sm font-medium">
                                        ₹{sale.amount.toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-neutral-gray400 flex flex-col gap-2 items-center">
                              <img 
                                src={noDataPresentSvg} 
                                alt="No data available" 
                                width={180} 
                                height={180}
                                priority
                              />
                              <p>No sales history available for this period.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
      </div>

      {/* Edit Transaction Form */}
      {showEditTransactionForm &&
        selectedTransaction &&
        (selectedTransaction.type === "inbound" ? (
          <>
            <Backdrop />
            <AddStockForm
              isOpen={showEditTransactionForm}
              onSave={handleEditTransactionSubmit}
              onClose={() => {
                setShowEditTransactionForm(false);
                setSelectedTransaction(null);
              }}
              heading={`Edit Stock In - ${currentStockDetails.stock_name}`}
              inventory={currentStockDetails}
              selectedData={{
                transaction_id: selectedTransaction.reference_no || "",
                amount: selectedTransaction.amount.toString(),
                quantity: selectedTransaction.quantity.toString(),
                date: format(new Date(selectedTransaction.date), "yyyy-MM-dd"),
                type: selectedTransaction.type,
                source: "", // Not available in transaction history API
                reference: "", // Not available in transaction history API  
                notes: selectedTransaction.notes || "",
              }}
            />
          </>
        ) : (
          <>
            <Backdrop />
            <TrackSalesForm
              isOpen={showEditTransactionForm}
              onSave={handleEditTransactionSubmit}
              onClose={() => {
                setShowEditTransactionForm(false);
                setSelectedTransaction(null);
              }}
              heading={`Edit Stock Out - ${currentStockDetails.stock_name}`}
              inventory={currentStockDetails}
              selectedData={{
                transaction_id: selectedTransaction.reference_no || "",
                amount: selectedTransaction.amount.toString(),
                quantity: selectedTransaction.quantity.toString(),
                date: format(new Date(selectedTransaction.date), "yyyy-MM-dd"),
                type: selectedTransaction.type,
                salesUnit: "", // Not available in transaction history API
                reference: "", // Not available in transaction history API
                notes: selectedTransaction.notes || "",
              }}
            />
          </>
        ))}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && <Backdrop />}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-danger-500 hover:bg-danger-400 active:bg-danger-500 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Forms */}
      {showEditForm && currentStockDetails && (
        <>
          <Backdrop />
          <EditInventoryForm
            isOpen={showEditForm}
            onSave={async (updatedData) => {
              try {
                const response = await updateStockDetails({
                  ...updatedData,
                  id: currentStockDetails.id,
                });
                if (response.status === "success") {
                  toast.success("Inventory details updated successfully");
                  // Refresh both stock details and header
                  await Promise.all([
                    fetchStockDetails(inventoryId),
                    fetchStockHeader(inventoryId, selectedDate),
                  ]);
                  setShowEditForm(false);
                }
              } catch (error) {
                toast.error("Failed to update inventory details");
              }
            }}
            onClose={() => setShowEditForm(false)}
            heading={`Edit Inventory - ${currentStockDetails.stock_name}`}
            selectedData={currentStockDetails}
            stockHeader={currentStockHeader} // Pass the stock header data
            disabled={false}
          />
        </>
      )}
      {showAddStockForm && currentStockDetails && (
        <>
          <AddStockForm
            isOpen={showAddStockForm}
            onSave={handleAddStock}
            onClose={() => setShowAddStockForm(false)}
            heading={`Add Stock - ${currentStockDetails.stock_name}`}
            inventory={currentStockDetails}
          />
        </>
      )}
      {showTrackSalesForm && currentStockDetails && (
        <>
          <TrackSalesForm
            isOpen={showTrackSalesForm}
            onSave={handleTrackSales}
            onClose={() => setShowTrackSalesForm(false)}
            heading={`Track Sales - ${currentStockDetails.stock_name}`}
            inventory={currentStockDetails}
          />
        </>
      )}

      {/* Link Sales Unit Form */}
      <LinkSalesUnitForm
        isOpen={showLinkSalesUnitDialog}
        onClose={() => setShowLinkSalesUnitDialog(false)}
        onConfirm={handleLinkSalesUnit}
        currentStockDetails={currentStockDetails}
      />

      {/* Unlink Sales Unit Form */}
      <UnlinkSalesUnitForm
        isOpen={showUnlinkDialog}
        onClose={() => {
          setShowUnlinkDialog(false);
          setSalesUnitToUnlink(null);
          setSalesUnitNameToUnlink("");
        }}
        onConfirm={() => {
          handleUnlinkSalesUnit(salesUnitToUnlink);
          setShowUnlinkDialog(false);
          setSalesUnitToUnlink(null);
          setSalesUnitNameToUnlink("");
        }}
        salesUnitName={salesUnitNameToUnlink}
      />
    </>
  );
};
