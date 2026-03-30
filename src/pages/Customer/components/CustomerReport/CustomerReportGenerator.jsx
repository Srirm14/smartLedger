"use client";

import { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { subDays } from "date-fns";
import { useToaster } from "react-hot-toast";
import { getCustomerReportPreview } from "../../api/CustomerService";
import { CustomerSelection } from "./CustomerSelection";
import { ReportPreview } from "./ReportPreview";
import { ProcessingStatus } from "./ProcessingStatus";

// PropTypes definition
CustomerReportGenerator.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  customers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      customer_name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onDownload: PropTypes.func.isRequired,
  onSendNotifications: PropTypes.func.isRequired,
  isDownloading: PropTypes.bool.isRequired,
};

// Utility functions
const getDefaultDateRange = () => ({
  from: subDays(new Date(), 15),
  to: new Date(),
});

export function CustomerReportGenerator({ 
  open, 
  onOpenChange, 
  customers, 
  onDownload, 
  onSendNotifications, 
  isDownloading 
}) {
  const { toast } = useToaster();
  
  // State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [date, setDate] = useState(getDefaultDateRange());
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [allCompleted, setAllCompleted] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDataMap, setPreviewDataMap] = useState({});
  const [activePreviewCustomer, setActivePreviewCustomer] = useState(null);
  const [isLoadingPreviewMap, setIsLoadingPreviewMap] = useState({});
  const [processingOpen, setProcessingOpen] = useState(false);

  // Computed values
  const customersWithSuccessfulPreviews = useMemo(() => 
    selectedCustomers.filter(customer => !previewDataMap[customer.id]?.error),
    [selectedCustomers, previewDataMap]
  );

  // Customer Management
  const handleCustomerSelect = useCallback((customer, isChecked) => {
    if (isChecked) {
      setSelectedCustomers(prev => [
        ...prev,
        { ...customer, status: "idle" },
      ]);
      setSelectedCustomer(customer.id.toString());
    } else {
      setSelectedCustomers(prev => 
        prev.filter((c) => c.id !== customer.id)
      );
      if (selectedCustomer === customer.id.toString()) {
        setSelectedCustomer("");
      }
    }
  }, [selectedCustomer]);

  const handleSelectAll = useCallback((isChecked) => {
    if (isChecked) {
      const allCustomers = customers.map((customer) => ({
        id: customer.id,
        name: customer.customer_name,
        status: "idle",
      }));
      setSelectedCustomers(allCustomers);
      if (customers.length > 0) {
        setSelectedCustomer(customers[0].id.toString());
      }
    } else {
      setSelectedCustomers([]);
      setSelectedCustomer("");
    }
  }, [customers]);

  // Date Management
  const handleDateChange = useCallback((newDate) => {
    setDate(newDate);
    // Delay the toast to avoid interfering with calendar closing
    setTimeout(() => {
      toast({
        title: "Date range updated",
        description: `Selected: ${newDate.from.toLocaleDateString()} - ${newDate.to.toLocaleDateString()}`,
        variant: "default",
      });
    }, 100);
  }, [toast]);

  // Dialog Management
  const handleDialogClose = useCallback(() => {
    setShowPreview(false);
    setPreviewData(null);
    setSelectedCustomer("");
    setSelectedCustomers([]);
    const defaultRange = getDefaultDateRange();
    setDate(defaultRange);
    setIsLoadingPreview(false);
    setIsLoadingPreviewMap({});
    setPreviewDataMap({});
    onOpenChange(false);
  }, [onOpenChange]);

  const resetProcess = useCallback(() => {
    setProcessingOpen(false);
    setIsProcessing(false);
    setAllCompleted(false);
    setCurrentAction(null);
    setSelectedCustomers((prev) =>
      prev.map((customer) => ({ ...customer, status: "idle" }))
    );
  }, []);

  // Preview Management
  const handlePreview = useCallback(async () => {
    if (selectedCustomers.length === 0 || !date.from || !date.to) {
      toast({
        title: "Error",
        description: "Please select at least one customer and date range",
        variant: "destructive",
      });
      return;
    }

    setShowPreview(true);
    setActivePreviewCustomer(selectedCustomers[0]?.id);
    setIsLoadingPreview(true);

    const loadingMap = {};
    selectedCustomers.forEach((customer) => {
      loadingMap[customer.id] = true;
    });
    setIsLoadingPreviewMap(loadingMap);
    setPreviewDataMap({});

    try {
      const formattedStartDate = date.from.toISOString().split('T')[0];
      const formattedEndDate = date.to.toISOString().split('T')[0];

      const previewResults = {};
      for (const customer of selectedCustomers) {
        try {
          const response = await getCustomerReportPreview(
            formattedStartDate,
            formattedEndDate,
            customer.id
          );

          if (response.status) {
            previewResults[customer.id] = response.data;
          }
        } catch (error) {
          console.error(
            `Error getting preview for customer ${customer.id}:`,
            error
          );
          previewResults[customer.id] = {
            error: true,
            message: error.response?.data?.detail || "Failed to load preview",
          };
        } finally {
          setIsLoadingPreviewMap((prev) => ({
            ...prev,
            [customer.id]: false,
          }));
        }
      }
      
      setPreviewDataMap(previewResults);
    } catch (error) {
      console.error("Error getting previews:", error);
      toast({
        title: "Error",
        description: "Failed to get report previews",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPreview(false);
    }
  }, [selectedCustomers, date, toast]);

  // Processing Management
  const startProcessing = useCallback((action) => {
    if (selectedCustomers.length === 0 || !date.from || !date.to) {
      toast({
        title: "Error",
        description: "Please select at least one customer and a date range",
        variant: "destructive",
      });
      return;
    }

    setAllCompleted(false);
    setCurrentAction(action);
    setSelectedCustomers((prev) =>
      prev.map((customer) => ({ ...customer, status: "idle" }))
    );

    onOpenChange(false);
    setProcessingOpen(true);
    processCustomers(action);
  }, [selectedCustomers, date, onOpenChange, toast]);

  const processCustomers = useCallback(async (action) => {
    setIsProcessing(true);

    const customersToProcess = customersWithSuccessfulPreviews;

    if (customersToProcess.length === 0) {
      toast({
        title: "No customers to process",
        description: "No customers have successfully loaded previews to download",
        variant: "destructive",
      });
      setIsProcessing(false);
      setProcessingOpen(false);
      return;
    }

    setSelectedCustomers(customersToProcess.map((c) => ({ ...c, status: "idle" })));

    for (let i = 0; i < customersToProcess.length; i++) {
      setSelectedCustomers(prev => 
        prev.map((customer, index) => 
          index === i ? { ...customer, status: "loading" } : customer
        )
      );

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const formattedStartDate = date.from.toISOString().split('T')[0];
        const formattedEndDate = date.to.toISOString().split('T')[0];

        if (action === "download") {
          await onDownload(customersToProcess[i].id, {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            format: "pdf"
          });
        } else {
          await onSendNotifications(customersToProcess[i].id, {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          });
        }

        setSelectedCustomers(prev => 
          prev.map((customer, index) => 
            index === i ? { ...customer, status: "success" } : customer
          )
        );
      } catch (error) {
        setSelectedCustomers(prev => 
          prev.map((customer, index) => 
            index === i ? { ...customer, status: "error" } : customer
          )
        );
        
        console.error(`Error processing customer ${customersToProcess[i].name}:`, error);
        
        if (error.response?.status === 400) {
          console.warn(`Customer ${customersToProcess[i].name}: ${error.response?.data?.detail || "Bill already exists in the mentioned period"}`);
        }
      }
      
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsProcessing(false);
    setAllCompleted(true);

    const currentCustomers = selectedCustomers;
    const successCount = currentCustomers.filter((c) => c.status === "success").length;
    const errorCount = currentCustomers.filter((c) => c.status === "error").length;

    if (errorCount > 0) {
      toast({
        title: `Process completed with errors`,
        description: `Successfully ${
          action === "download" ? "downloaded" : "sent"
        } reports for ${successCount} of ${
          currentCustomers.length
        } customers with successful previews. ${errorCount} failed. Check the processing dialog for details.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: `Process completed successfully`,
        description: `Successfully ${
          action === "download" ? "downloaded" : "sent"
        } reports for ${successCount} of ${currentCustomers.length} customers with successful previews.`,
        variant: "default",
      });
    }
  }, [customersWithSuccessfulPreviews, date, onDownload, onSendNotifications, selectedCustomers, toast]);

  const handleRetryFailed = useCallback(async () => {
    const failedCustomers = selectedCustomers.filter((c) => c.status === "error");

    if (failedCustomers.length === 0) {
      toast({
        title: "No failed reports",
        description: "There are no failed reports to retry",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setAllCompleted(false);

    setSelectedCustomers((prev) =>
      prev.map((customer) =>
        customer.status === "error" ? { ...customer, status: "idle" } : customer
      )
    );

    for (const customer of failedCustomers) {
      setSelectedCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id ? { ...c, status: "loading" } : c
        )
      );

      try {
        const formattedStartDate = date.from.toISOString().split('T')[0];
        const formattedEndDate = date.to.toISOString().split('T')[0];

        if (currentAction === "download") {
          await onDownload(customer.id, {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          });
        } else {
          await onSendNotifications(customer.id, {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          });
        }

        setSelectedCustomers((prev) =>
          prev.map((c) =>
            c.id === customer.id ? { ...c, status: "success" } : c
          )
        );
      } catch (error) {
        console.error(`Error retrying customer ${customer.name}:`, error);
        setSelectedCustomers((prev) =>
          prev.map((c) =>
            c.id === customer.id ? { ...c, status: "error" } : c
          )
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsProcessing(false);
    setAllCompleted(true);

    const successCount = selectedCustomers.filter((c) => c.status === "success").length;
    const actionText = currentAction === "download" ? "downloaded" : "sent";

    toast({
      title: `Retry completed`,
      description: `Successfully ${actionText} reports for ${successCount} of ${failedCustomers.length} failed customers.`,
      variant: successCount === failedCustomers.length ? "default" : "destructive",
    });
  }, [selectedCustomers, date, currentAction, onDownload, onSendNotifications, toast]);

  // Event Handlers
  const handlePreviewDownload = useCallback(() => {
    startProcessing("download");
  }, [startProcessing]);

  return (
    <>
      {/* Customer Selection Dialog */}
      <CustomerSelection
        open={open}
        onOpenChange={onOpenChange}
        customers={customers}
        selectedCustomers={selectedCustomers}
        onCustomerSelect={handleCustomerSelect}
        onSelectAll={handleSelectAll}
        onPreview={handlePreview}
        isLoadingPreview={isLoadingPreview}
        date={date}
        onDateChange={handleDateChange}
        onDialogClose={handleDialogClose}
      />

      {/* Report Preview Dialog */}
      <ReportPreview
        open={showPreview}
        onOpenChange={setShowPreview}
        selectedCustomers={selectedCustomers}
        previewDataMap={previewDataMap}
        isLoadingPreviewMap={isLoadingPreviewMap}
        activePreviewCustomer={activePreviewCustomer}
        onActiveCustomerChange={setActivePreviewCustomer}
        onDownload={handlePreviewDownload}
        isDownloading={isDownloading}
      />

      {/* Processing Status Dialog */}
      <ProcessingStatus
        open={processingOpen}
        onOpenChange={setProcessingOpen}
        selectedCustomers={selectedCustomers}
        currentAction={currentAction}
        isProcessing={isProcessing}
        allCompleted={allCompleted}
        date={date}
        onRetryFailed={handleRetryFailed}
        onResetProcess={resetProcess}
      />
    </>
  );
} 