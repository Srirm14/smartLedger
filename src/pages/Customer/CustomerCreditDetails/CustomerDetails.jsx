import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useCreditCustomerStore } from "../../../../store/useCreditCustomerStore";
import { useCustomerStore } from "../../../../store/useCustomerStore";
import toast from "react-hot-toast";
import { format as formatDate } from "date-fns";
import CreditActionDialog from "@/components/Form/CreditActionDialog";
import VehicleDetailsForm from "../../../components/Form/VehicleDetailsForm";
import CustomerForm from "@/components/Form/customerForm";
import { BaseTable } from "@/components/Table/BaseTable";
import { Button } from "@/components/ui/button";
import {
  CirclePlus,
  Pencil,
  Trash2,
  Eye,
  FileText,
  MoreVertical,
  UserIcon,
  IndianRupeeIcon,
  ReceiptIcon,
  CalendarIcon,
  CarIcon,
  BriefcaseIcon,
  ClockIcon,
  PackageIcon,
  TagIcon,
  HashIcon,
  CreditCardIcon,
  FileTextIcon,
  TruckIcon,
  TypeIcon,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import TableDataPagination from "@/components/Table/TableDataPagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CustomerBillingDetails,
  getCustomerReportPreview,
  generateCreditReport,
} from "../api/CustomerService";
import { CreditReportPreview } from "@/components/Templates/CreditReportPreview";
import { CreditBillTemplate } from "@/components/Templates/CreditBillTemplate";
import { createRoot } from "react-dom/client";
import html2pdf from "html2pdf.js";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Import custom components
import CustomerHeader from "../components/CustomerHeader";
import CustomerDetailsCard from "../components/CustomerDetailsCard";
import VehicleActions from "../components/VehicleActions";
import TransactionForms from "../components/TransactionForms";
import BillDateRangePicker from "../components/BillDateRangePicker";
import Backdrop from "@/components/Backdrop";
import WarningPrompt from "@/components/WarningPrompt";
import { invalidateAllCashflowQueries } from "@/queryHooks/storeCachedQueries/useCashflowTabQuery";
import { queryClient } from "@/utils/queryClient";


const CustomerDetails = () => {
  const { customerName, customer_id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  // Dialog states
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showVehicleDetailsForm, setShowVehicleDetailsForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);


  // Pagination states
  const [creditPagination, setCreditPagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [paymentPagination, setPaymentPagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [vehiclePagination, setVehiclePagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showBillForm, setShowBillForm] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [billInterest, setBillInterest] = useState(0);

  const dataretrival = useRef(1);
  const {
    creditCustomers,
    fetchCreditCustomers,
    transactions,
    fetchTransactions,
    addVehicleDetails,
    deleteVehicleDetails,
    generateBill,
    addPayment,
    deleteTransaction,
    loading,
    insertCreditCustomer,
    deleteCreditCustomer,
    loadingDelete,
    loadingAdd,
    total_count_credit,
    loading_credit,
    upsertCreditCustomer,
    // Replace vehicle functions
    fetchVehicleDetails,
    vehicleDetails,
    loadingVehicles,
    // Add customer details function
    fetchCustomerDetails,
    customerDetails: creditCustomerDetails
  } = useCreditCustomerStore();

  

  

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Add this state near other state declarations
  const [transactionType, setTransactionType] = useState(null);

  // Add customer store
  const { customers, fetchCustomers, loading: customerLoading, updateCustomer } = useCustomerStore();
  
  // Combined loading state for better UX
  const isDataLoading = loading || customerLoading || loading_credit || loadingVehicles;

  // Add this near other state declarations
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);

  // Add state for vehicles
  const [vehicles, setVehicles] = useState([]);

 

  // Add useEffect for fetching vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        await fetchVehicleDetails(parseInt(customer_id));
      } catch (error) {
        console.error('Error loading vehicles:', error);
        toast.error('Failed to load vehicle details');
      }
    };

    if (customer_id) {
      loadVehicles();
    }
  }, [customer_id, fetchVehicleDetails]);

  // Update vehicles when vehicleDetails changes
  useEffect(() => {
    if (vehicleDetails) {
      setVehicles(vehicleDetails);
    }
  }, [vehicleDetails]);

  // Add this function to handle customer details refresh
  const refreshCustomerDetails = async () => {
    try {
      // Use the dedicated function to fetch fresh customer details
      await fetchCustomerDetails(parseInt(customer_id));
    } catch (error) {
      console.error("Error refreshing customer details:", error);
      toast.error("Failed to refresh customer details");
    }
  };

  // Update the initial data loading useEffect
  useEffect(() => {
    // Initial data loading
    const loadInitialData = async () => {
      try {
        // Load customer details using the dedicated function
        await fetchCustomerDetails(parseInt(customer_id));
        
        // Parallel load of credit customers and transactions
        await Promise.all([
          fetchCreditCustomers(1, customerName),
          fetchTransactions(customer_id)
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load some customer data');
      }
    };

    loadInitialData();
  }, [customer_id, customerName, fetchCustomerDetails, fetchCreditCustomers, fetchTransactions]);

  // Add effect to update customer details when credit customer details change
  useEffect(() => {
    if (creditCustomerDetails) {
      setCustomerDetails(creditCustomerDetails);
    }
  }, [creditCustomerDetails]);

  // Event handlers
  const handleBackNavigation = () => {
    navigate("/customer-management");
  };

  const handleAddCredit = () => {
    setSelectedItem(null);
    setShowCreditForm(true);
  };

  const handlePreviewTransaction = async (transaction) => {
    if (transaction.type !== "bill") {
      toast.error("Preview is only available for bills");
      return;
    }

    try {
      // Format dates once
      const formattedDates = formatDateRange(transaction.start_date, transaction.end_date);
      if (!formattedDates) return;

      // Show preview dialog with loading state
      setShowPreview(true);
      setPreviewData({
        status: true,
        data: {
          preview: [],
          total_entries: 0,
          total_amount: 0,
          base_amount: 0,
          interest: 0,
          start_date: transaction.start_date,
          end_date: transaction.end_date
        }
      });

      const response = await getCustomerReportPreview(
        formattedDates.startDate,
        formattedDates.endDate,
        customer_id,
        transaction.id
      );

      if (response.status) {
        setPreviewData({
          ...response,
          data: {
            ...response.data,
            start_date: transaction.start_date,
            end_date: transaction.end_date
          }
        });
      } else {
        throw new Error(response.message || "Failed to preview bill");
      }
    } catch (error) {
      console.error("Error previewing bill:", error);
      toast.error(error.message || "Failed to preview bill");
      setShowPreview(false);
    }
  };

  // Helper function to format date range
  const formatDateRange = (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date range");
      }

      return {
        startDate: formatDate(start, "yyyy-MM-dd"),
        endDate: formatDate(end, "yyyy-MM-dd")
      };
    } catch (error) {
      console.error("Error formatting dates:", error);
      toast.error("Invalid date range format");
      return null;
    }
  };

  const handleDownloadTransaction = async (transaction, format = "csv") => {
    if (transaction.type !== "bill") {
      toast.error("Download is only available for bills");
      return;
    }

    setIsDownloading(true);
    try {
      // Validate and format the dates
      let formattedStartDate, formattedEndDate;
      try {
        const startDate = new Date(transaction.start_date);
        const endDate = new Date(transaction.end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date range");
        }

        formattedStartDate = formatDate(startDate, "yyyy-MM-dd");
        formattedEndDate = formatDate(endDate, "yyyy-MM-dd");
      } catch (error) {
        console.error("Error formatting dates:", error);
        toast.error("Invalid date range format");
        return;
      }

      if (format === "csv") {
        await CustomerBillingDetails(
          formattedStartDate,
          formattedEndDate,
          customer_id,
          customerName,
          formatDate(new Date(), "yyyy-MM-dd"),
          transaction.id
        );
        toast.success("Bill downloaded successfully");
      } else {
        const response = await generateCreditReport({
          customer_id: customer_id,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          interest: 0,
          bill_id: transaction.id,
          date: formatDate(new Date(), "yyyy-MM-dd"),
        });

        if (response.status) {
          try {
            // Create a temporary div and append it to body
            const tempDiv = document.createElement("div");
            document.body.appendChild(tempDiv);

            const root = createRoot(tempDiv);
            root.render(
              <CreditBillTemplate
                billData={response.data}
                customerName={customerName}
              />
            );

            // Wait for the content to be rendered
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Configure html2pdf options
            const opt = {
              margin: 10,
              filename: `credit_bill_${customerName}_${formattedStartDate}.pdf`,
              image: { type: "jpeg", quality: 0.98 },
              html2canvas: {
                scale: 2,
                useCORS: true,
                logging: true,
              },
              jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            };

            // Generate PDF
            await html2pdf().from(tempDiv).set(opt).save();

            // Clean up
            setTimeout(() => {
              root.unmount();
              if (document.body.contains(tempDiv)) {
                document.body.removeChild(tempDiv);
              }
            }, 1000);

            toast.success("PDF bill downloaded successfully");
          } catch (pdfError) {
            console.error("Error generating PDF:", pdfError);
            toast.error("Error generating PDF. Please try again.");
          }
        } else {
          toast.error(response.message || "Failed to generate PDF bill");
        }
      }
    } catch (error) {
      console.error("Error downloading bill:", error);
      if (error.response?.status === 400) {
        toast.error("Bill already exists in the mentioned period");
      } else {
        toast.error("Failed to download bill. Please try again.");
      }
    } finally {
      setIsDownloading(false);
    }
  };


  const handleAddVehicle = () => {
    setSelectedItem(null);
    setShowVehicleDetailsForm(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedItem(vehicle);
    setShowVehicleDetailsForm(true);
  };

  const handleDeleteVehicle = (vehicle) => {
    setSelectedItem({ ...vehicle, type: "vehicle" });
    setShowDeleteConfirmation(true);
  };

  const handleSaveCredit = async (data) => {
    try {
      if (selectedItem) {
        await upsertCreditCustomer(data);
      } else {
        await insertCreditCustomer(data);
      }
      
      // Close form first for better UX
      setShowCreditForm(false);
      setSelectedItem(null);
      
      // Refresh both credit customers and transactions as credit affects both
      await Promise.all([
        fetchCreditCustomers(1, customerName),
        fetchTransactions(customer_id)
      ]);
      
      // Invalidate cashflow queries to refresh data
      await invalidateAllCashflowQueries(queryClient);
      
      toast.success(selectedItem ? 'Credit updated successfully' : 'Credit added successfully');
    } catch (error) {
      console.error("Error handling credit:", error);
      toast.error("Failed to process credit transaction");
    }
  };

  const handleSaveBill = async (billData) => {
    try {
      if (!billData || !customer_id || !customerName) {
        toast.error("Missing required data for bill generation");
        return;
      }
      setIsGeneratingBill(true);

      const formattedDate = formatDate(new Date(), "yyyy-MM-dd");

      const response = await generateCreditReport({
        customer_id: customer_id,
        start_date: billData.start_date || formattedDate,
        end_date: billData.end_date || formattedDate,
        interest: billData.interest || 0,
        bill_id: billData.bill_id || null,
        date: formattedDate,
      });

      if (response.status) {
        toast.success("Bill generated successfully");
        // Refresh transactions after successful bill generation
        await fetchTransactions(customer_id);
        // Only close the form after successful API call
        setShowTransactionForm(false);
        setTransactionType(null);
      } else {
        toast.error(response.message || "Failed to generate bill");
      }
    } catch (error) {
      console.error("Error generating bill:", error);
      toast.error(error.response?.data?.detail || "Failed to generate bill");
    } finally {
      setIsGeneratingBill(false);
    }
  };

  const handleSavePayment = async (paymentData) => {
    try {
      if (!paymentData || !customer_id || !customerName) {
        toast.error("Missing required data for payment");
        return;
      }
      
      const formattedDate = formatDate(new Date(), "yyyy-MM-dd");
      const paymentPayload = {
        ...paymentData,
        customer_id,
        customer_name: customerName,
        type: "payment",
        date: paymentData.date || formattedDate,
        description: paymentData.description || "Payment received",
        id: paymentData.id || Math.floor(10000 + Math.random() * 90000),
        reference_id: paymentData.reference_id
      };

      // Close form first for better UX
      setShowPaymentForm(false);
      setSelectedItem(null);
      
      await addPayment(paymentPayload);
      
      // Refresh all necessary data
      await Promise.all([
        refreshCustomerDetails(),
        fetchTransactions(customer_id),
        fetchCreditCustomers(1, customerName)
      ]);
      
      toast.success("Payment added successfully");
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error(error.response?.data?.detail || "Failed to add payment");
      setShowPaymentForm(true);
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete && !selectedItem) return;

    try {
      if (selectedItem?.type === "vehicle") {
        const vehicleId = selectedItem.id || selectedItem.vehicle_id;
        await deleteVehicleDetails(vehicleId);
        // Refresh vehicle data
        await fetchVehicleDetails(parseInt(customer_id));
      } else {
        await deleteTransaction(transactionToDelete.id);
        // Refresh all necessary data
        await Promise.all([
          refreshCustomerDetails(),
          fetchTransactions(customer_id),
          fetchCreditCustomers(1, customerName)
        ]);
      }
      
      setShowDeleteConfirmation(false);
      setTransactionToDelete(null);
      setSelectedItem(null);
      toast.success(selectedItem?.type === "vehicle" ? "Vehicle deleted successfully" : "Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(selectedItem?.type === "vehicle" ? "Failed to delete vehicle" : "Failed to delete transaction");
    }
  };

  const handleSaveVehicle = async (data) => {
    try {
      const vehicleData = {
        ...data,
        vehicle_number: data.vehicle_no,
        customer_id: parseInt(customer_id),
      };
      
      await addVehicleDetails(vehicleData);
      
      // Close form first for better UX
      setShowVehicleDetailsForm(false);
      setSelectedItem(null);
      
      // Refresh vehicle data
      await fetchVehicleDetails(parseInt(customer_id));
      
      toast.success("Vehicle details added successfully");
    } catch (error) {
      console.error("Error adding vehicle details:", error);
      toast.error("Error adding vehicle details");
      setShowVehicleDetailsForm(true);
    }
  };

  const handleEditCustomer = () => {
    // Get the current customer data from the credit customer details
    const currentCustomerData = creditCustomerDetails || customerDetails;

    if (currentCustomerData) {
      // Format the data according to the form's expected structure
      setSelectedCustomer({
        customer_id: customer_id,
        name: currentCustomerData.customer_name || currentCustomerData.name,
        email: currentCustomerData.email || "",
        contact_phone: currentCustomerData.contact_phone || "",
        credit_limit: currentCustomerData.credit_limit || 0
      });
    } else {
      // Fallback to basic data if customer not found in store
      setSelectedCustomer({
        customer_id: customer_id,
        name: customerName,
        email: "",
        contact_phone: "",
        credit_limit: 0
      });
    }
    setShowCustomerForm(true);
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      // Close the form immediately
      setShowCustomerForm(false);
      setSelectedCustomer(null);

      // Ensure all required fields are included in the update request
      const updatePayload = {
        id: parseInt(customer_id),
        name: customerData.name,
        email: customerData.email || "",
        contact_phone: customerData.contact_phone || "",
        credit_limit: parseFloat(customerData.credit_limit) || 0
      };

      // Update customer data using the customer store's updateCustomer function
      await updateCustomer(updatePayload);
      
      // Refresh customer details using the dedicated function
      await fetchCustomerDetails(parseInt(customer_id));
      
    } catch (error) {
      console.error("Error updating customer:", error);
      // Reopen the form in case of error
      setShowCustomerForm(true);
      setSelectedCustomer(customerData);
      toast.error(error.response?.data?.detail || "Failed to update customer");
    }
  };

  const handleGenerateBill = async () => {
    if (!selectedDateRange.startDate || !selectedDateRange.endDate) {
      toast.error("Please select a date range");
      return;
    }

    setIsGeneratingBill(true);

    try {
      const formattedDates = formatDateRange(
        selectedDateRange.startDate,
        selectedDateRange.endDate
      );
      if (!formattedDates) return;

      const response = await generateCreditReport({
        customer_id,
        start_date: formattedDates.startDate,
        end_date: formattedDates.endDate,
        interest: billInterest,
        bill_id: null,
        date: formatDate(new Date(), "yyyy-MM-dd"),
      });

      if (response.status) {
        // Refresh all necessary data
        await Promise.all([
          refreshCustomerDetails(),
          fetchTransactions(customer_id),
          fetchCreditCustomers(1, customerName)
        ]);
        
        setShowBillForm(false);
        toast.success("Bill generated successfully");
      } else {
        throw new Error(response.message || "Failed to generate bill");
      }
    } catch (error) {
      console.error("Error generating bill:", error);
      toast.error(error.message || "Failed to generate bill");
    } finally {
      setIsGeneratingBill(false);
    }
  };

  // Get current page data
  const getCurrentPageData = (data, pagination) => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return data?.slice(startIndex, endIndex);
  };

  // Credit table columns
  const creditColumns = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <HashIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">ID</span>
        </div>
      ),
      searchable: true,
      enableSorting: true,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Date</span>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "vehicle_no",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <CarIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Vehicle</span>
        </div>
      ),
      searchable: true,
    },
    {
      accessorKey: "portfolio_name",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Portfolio</span>
        </div>
      ),
      searchable: true,
    },
    {
      accessorKey: "shift_name",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Shift</span>
        </div>
      ),
      searchable: true,
    },
    {
      accessorKey: "product_name",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <PackageIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Product</span>
        </div>
      ),
      searchable: true,
      cell: ({ row }) => (
        <div className="flex flex-col">
          {row.original.product_name.map((p, index) => (
            <span key={index} className="block py-[4px]">
              {p}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Price</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          {row.original.price.map((p, index) => (
            <span key={index} className="block py-[4px]">
              {p}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <HashIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Quantity</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          {row.original.quantity.map((q, index) => (
            <span key={index} className="block py-[4px]">
              {q}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <IndianRupeeIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Amount</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          {row.original.amount.map((a, index) => (
            <span key={index} className="block py-[4px]">
              {a}
            </span>
          ))}
        </div>
      ),
    },
  ];


  // Transaction table columns for bills and payments
  const transactionColumns = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <HashIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Transaction ID</span>
        </div>
      ),
      cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
    },
    {
      accessorKey: "transaction_date",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Date</span>
        </div>
      ),
      cell: ({ row }) => {
        const date = row.original.date || row.original.transaction_date;
        return (
          <span>{date ? formatDate(new Date(date), "dd/MM/yyyy") : "-"}</span>
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <FileTextIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Type</span>
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.type === "bill" ? "outline" : "secondary"}>
          {row.original.type.charAt(0).toUpperCase() +
            row.original.type.slice(1)}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <IndianRupeeIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Amount</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">₹{row.original.amount.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "method",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <CreditCardIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Payment Method</span>
        </div>
      ),
      cell: ({ row }) => <span>{row.original.method || "-"}</span>,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Actions</span>
        </div>
      ),
      cell: ({ row }) => {
        const transaction = row.original;
        const isBill = transaction.type === "bill";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 hover:cursor-pointer"
                disabled={loadingDelete}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              {isBill && (
                <>
                  <DropdownMenuItem
                    onClick={() => handlePreviewTransaction(transaction)}
                    className="flex items-center gap-2 hover:cursor-pointer"
                    disabled={loadingDelete}
                  >
                    <Eye className="h-4 w-4" />
                    <span>Preview Bill</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadTransaction(transaction, "csv")}
                    className="flex items-center gap-2 hover:cursor-pointer"
                    disabled={loadingDelete}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Download CSV</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadTransaction(transaction, "pdf")}
                    className="flex items-center gap-2 hover:cursor-pointer"
                    disabled={loadingDelete}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Download PDF</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => handleDeleteTransaction(transaction)}
                className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 hover:cursor-pointer"
                disabled={loadingDelete}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Vehicle table columns
  const vehicleColumns = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <HashIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">ID</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.id}</span>
      ),
    },
    {
      accessorKey: "vehicle_no",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <TruckIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Vehicle Number</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium uppercase">{row.original.vehicle_no}</span>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <TypeIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Vehicle Type</span>
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.type}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Actions</span>
        </div>
      ),
      cell: ({ row }) => {
        const vehicle = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 hover:cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem
                onClick={() => handleEditVehicle(vehicle)}
                className="flex items-center gap-2 hover:cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteVehicle(vehicle)}
                className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 hover:cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Calculate outstanding balance and ensure customer details are available
  const outstandingBalance = creditCustomerDetails?.outstanding || customerDetails?.outstanding || 0;
  const unbilledAmount = creditCustomerDetails?.unbilled_amount || 0;
  
  // Fallback customer details if store data is not available
  const fallbackCustomerDetails = {
    customer_name: customerName,
    email: "-",
    contact_phone: "-",
    credit_limit: 0,
    outstanding: 0,
    unbilled_amount: 0
  };

  // Use customer details from credit store, local state, or fallback
  const displayCustomerDetails = creditCustomerDetails || customerDetails || fallbackCustomerDetails;
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader
        customerName={displayCustomerDetails.customer_name}
        customerId={customer_id}
        onBackClick={handleBackNavigation}
      />

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex justify-between items-center border-b pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">
                    {activeTab === "details" && "Customer Information"}
                    {activeTab === "credit-transactions" &&
                      "Credit Transactions"}
                    {activeTab === "bills-payments" && "Bills and Payments"}
                    {activeTab === "vehicles" && "Vehicle Details"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {activeTab === "details" &&
                      "View and manage customer details"}
                    {activeTab === "credit-transactions" &&
                      "Track credit transactions"}
                    {activeTab === "bills-payments" && "View and manage bills and payments"}
                    {activeTab === "vehicles" && "Manage vehicle information"}
                  </p>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-gray-100 py-[4px] px-[4px] h-auto">
                    <TabsTrigger
                      value="details"
                      className={`px-4 py-2 flex items-center gap-2 ${
                        activeTab === "details" ? "bg-white" : "bg-transparent"
                      }`}
                    >
                      <UserIcon className="h-4 w-4" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="credit-transactions"
                      className={`px-4 py-2 flex items-center gap-2 ${
                        activeTab === "credit-transactions"
                          ? "bg-white"
                          : "bg-transparent"
                      }`}
                    >
                      <CreditCardIcon className="h-4 w-4" />
                      Credit Transactions
                    </TabsTrigger>
                    <TabsTrigger
                      value="bills-payments"
                      className={`px-4 py-2 flex items-center gap-2 ${
                        activeTab === "bills-payments"
                          ? "bg-white"
                          : "bg-transparent"
                      }`}
                    >
                      <ReceiptIcon className="h-4 w-4" />
                      Bills & Payments
                    </TabsTrigger>
                    <TabsTrigger
                      value="vehicles"
                      className={`px-4 py-2 flex items-center gap-2 ${
                        activeTab === "vehicles" ? "bg-white" : "bg-transparent"
                      }`}
                    >
                      <TruckIcon className="h-4 w-4" />
                      Vehicles
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Main Content */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="details" className="mt-4">
                  <div className="px-4">
                    <CustomerDetailsCard
                      customerId={customer_id}
                      customerName={displayCustomerDetails.customer_name}
                      outstandingBalance={outstandingBalance}
                      unbilledAmount={unbilledAmount}
                      email={displayCustomerDetails.email}
                      phone={displayCustomerDetails.contact_phone}
                      creditLimit={displayCustomerDetails.credit_limit}
                      loading={isDataLoading}
                      onEdit={handleEditCustomer}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="credit-transactions" className="mt-4">
                  <div className="px-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-600">All Transactions</h3>
                      </div>
                      <Button
                        onClick={handleAddCredit}
                        className="bg-primary-500 hover:bg-primary-700 text-white"
                      >
                        <CirclePlus className="w-4 h-4 mr-1" />
                        Add Credit
                      </Button>
                    </div>
                    <BaseTable
                      columns={creditColumns}
                      data={getCurrentPageData(
                        creditCustomers,
                        creditPagination
                      )}
                      loading={loading_credit}
                      isEmpty={!creditCustomers?.length}
                      emptyTitle="No credit transactions available"
                      emptyDescription="Add your first credit transaction to start tracking credits"
                      emptyActionLabel="Add Credit"
                      onEmptyAction={handleAddCredit}
                    />
                    {creditCustomers?.length > 0 && (
                      <div className="mt-4">
                        <TableDataPagination
                          currentPage={creditPagination.page}
                          totalItems={creditCustomers?.length || 0}
                          pageSize={creditPagination.pageSize}
                          onPageChange={(page) =>
                            setCreditPagination((prev) => ({ ...prev, page }))
                          }
                          onPageSizeChange={(pageSize) =>
                            setCreditPagination({ page: 1, pageSize })
                          }
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="bills-payments" className="mt-4">
                  <div className="px-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-600">All Transactions</h3>
                        <p className="text-sm text-gray-500"></p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="bg-primary-500 hover:bg-primary-700 text-white">
                            <CirclePlus className="w-4 h-4 mr-1" />
                            Add Transaction
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedItem(null);
                              setShowTransactionForm(true);
                              setTransactionType("bill");
                            }}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <FileTextIcon className="h-4 w-4" />
                            <span>Generate Bill</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedItem(null);
                              setShowTransactionForm(true);
                              setTransactionType("payment");
                            }}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <CreditCardIcon className="h-4 w-4" />
                            <span>Add Payment</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <BaseTable
                      columns={transactionColumns}
                      data={getCurrentPageData(transactions, paymentPagination)}
                      loading={loading}
                      isEmpty={!transactions?.length}
                      emptyTitle="No transactions available"
                      emptyDescription="Add your first bill or payment to start tracking transactions"
                      emptyActionLabel="Generate Bill"
                      onEmptyAction={() => {
                        setSelectedItem(null);
                        setShowTransactionForm(true);
                        setTransactionType("bill");
                      }}
                    />

                    {transactions?.length > 0 && (
                    <div className="mt-4">
                      <TableDataPagination
                        currentPage={paymentPagination.page}
                        totalItems={transactions?.length || 0}
                        pageSize={paymentPagination.pageSize}
                        onPageChange={(page) =>
                          setPaymentPagination((prev) => ({ ...prev, page }))
                        }
                        onPageSizeChange={(pageSize) =>
                          setPaymentPagination({ page: 1, pageSize })
                        }
                      />
                    </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="vehicles" className="mt-4">
                  <div className="px-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-600">Vehicle List</h3>
                      </div>
                      <VehicleActions onAddVehicle={handleAddVehicle} />
                    </div>
                    <BaseTable
                      columns={vehicleColumns}
                      data={getCurrentPageData(vehicles, vehiclePagination)}
                      loading={loadingVehicles}
                      isEmpty={!vehicles?.length}
                      emptyTitle="No vehicles available"
                      emptyDescription="Add your first vehicle to start managing vehicle details"
                      emptyActionLabel="Add Vehicle"
                      onEmptyAction={handleAddVehicle}
                    />
                    {vehicles?.length > 0 && (
                      <div className="mt-4">
                        <TableDataPagination
                          currentPage={vehiclePagination.page}
                          totalItems={vehicles?.length || 0}
                          pageSize={vehiclePagination.pageSize}
                          onPageChange={(page) =>
                            setVehiclePagination((prev) => ({ ...prev, page }))
                          }
                          onPageSizeChange={(pageSize) =>
                            setVehiclePagination({ page: 1, pageSize })
                          }
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {showCreditForm && (
        <>
          <Backdrop />
          <CreditActionDialog
            isOpen={showCreditForm}
            onSave={handleSaveCredit}
            onClose={() => {
              setShowCreditForm(false);
              setSelectedItem(null);
              fetchCreditCustomers(1, customerName);
            }}
            selectedData={selectedItem}
            customerName={customerName}
            customer_id={customer_id}
            loading={loadingAdd}
            isGlobalCreditEntry={false}
          />
        </>
      )}

      {showVehicleDetailsForm && (
        <>
          <Backdrop />
          <VehicleDetailsForm
            isOpen={showVehicleDetailsForm}
            onSave={handleSaveVehicle}
            onClose={() => {
              setShowVehicleDetailsForm(false);
              setSelectedItem(null);
            }}
            selectedData={selectedItem}
            loading={loadingAdd}
          />
        </>
      )}

      {showDeleteConfirmation && (
        <WarningPrompt
          open={showDeleteConfirmation}
          title={selectedItem?.type === "vehicle" ? "Delete Vehicle" : "Delete Transaction"}
          description={
            selectedItem?.type === "vehicle" 
              ? `Are you sure you want to delete this vehicle? This action cannot be undone.`
              : "Are you sure you want to delete this transaction? This action cannot be undone."
          }
          actionText={
            loadingDelete ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>DELETING...</span>
              </div>
            ) : (
              "DELETE"
            )
          }
          onAction={handleConfirmDelete}
          onCancel={() => {
            if (!loadingDelete) {
              setShowDeleteConfirmation(false);
              setTransactionToDelete(null);
              setSelectedItem(null);
            }
          }}
          variant="danger"
          disabled={loadingDelete}
        />
      )}

      <CustomerForm
        isOpen={showCustomerForm}
        onClose={() => {
          setShowCustomerForm(false);
          setSelectedCustomer(null);
        }}
        onSave={handleSaveCustomer}
        selectedData={selectedCustomer}
        heading="Edit Customer"
      />

      <CreditReportPreview
        open={showPreview}
        onOpenChange={setShowPreview}
        previewData={previewData}
        customerName={customerName}
        dateRange={previewData?.data ? {
          from: previewData.data.start_date,
          to: previewData.data.end_date
        } : null}
        isLoading={!previewData?.data?.preview?.length}
      />

      {/* Transaction Form Dialog */}
      {showTransactionForm && <Backdrop />}
      <Dialog 
        open={showTransactionForm} 
        onOpenChange={(open) => {
          if (!loadingAdd) {
            setShowTransactionForm(open);
            if (!open) setTransactionType(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {transactionType === "bill" ? "Generate Bill" : "Add Payment"}
            </DialogTitle>
            <DialogDescription>
              {transactionType === "bill"
                ? "Generate a bill for a specific date range"
                : "Record a payment from this customer"}
            </DialogDescription>
          </DialogHeader>
          <div className="p-0">
            <TransactionForms
              onAddTransaction={async (data) => {
                if (!data || !data.type) {
                  toast.error("Invalid transaction data");
                  return;
                }
                if (data.type === "bill") {
                
                  try {
                    await handleSaveBill({
                      start_date: data.start_date,
                      end_date: data.end_date,
                      interest: data.interest || 0,
                    });
                  } catch (error) {
                    console.error("Error generating bill:", error);
                    toast.error(error.response?.data?.detail || "Failed to generate bill");
                  }
                } else if (data.type === "payment") {
                  handleSavePayment({
                    amount: data.amount,
                    method: data.method,
                    date: data.date,
                    description: data.description,
                    reference_id: data.reference,
                  });
                }
              }}
              existingBills={
                transactions?.filter((t) => t.type === "bill") || []
              }
              type={transactionType}
              loading={loadingAdd || isGeneratingBill}
            />
          </div>
          <DialogFooter className="pt-4 border-t bg-white rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!loadingAdd) {
                  setShowTransactionForm(false);
                  setTransactionType(null);
                }
              }}
              disabled={loadingAdd}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={transactionType === "bill" ? "bill-form" : "payment-form"}
              variant="default"
              disabled={loadingAdd}
            >
              {loadingAdd || isGeneratingBill && <Loader2 className="h-5 w-5 animate-spin text-[var(--primary-100)] mr-2" />}
              {loadingAdd || isGeneratingBill ? "Processing..." : transactionType === "bill" ? "Generate Bill" : "Add Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bill Generation Form */}
      {showBillForm && <Backdrop />}
      <Dialog open={showBillForm} onOpenChange={setShowBillForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Select Date Range
              </label>
              <BillDateRangePicker
                existingBills={
                  transactions?.filter((t) => t.type === "bill") || []
                }
                onDateRangeSelect={setSelectedDateRange}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Interest Rate (%)
              </label>
              <input
                type="number"
                value={billInterest}
                onChange={(e) =>
                  setBillInterest(parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowBillForm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleGenerateBill();
              }}
              className="bg-primary-500 hover:bg-primary-700 text-white"
              disabled={isGeneratingBill}
            >
              {isGeneratingBill ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                  <span>Generating...</span>
                </div>
              ) : (
                "Generate Bill"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerDetails;
