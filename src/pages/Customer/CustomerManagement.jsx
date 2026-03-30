import { useNavigate } from "react-router-dom";
import { ContentHeader } from "@/components/Header/ContentHeader";
import { createRoot } from "react-dom/client";
import html2pdf from "html2pdf.js";
import { CreditBillTemplate } from "@/components/Templates/CreditBillTemplate";

import { useEffect, useState } from "react";

import { useCustomerStore } from "../../../store/useCustomerStore";
import { BaseTable } from "@/components/Table/BaseTable";
import { Button } from "@/components/ui/button";
import CustomerForm from "@/components/Form/customerForm";
import {
  CirclePlus,
  FileText,
  Trash2,
  MoreVertical,
  UserIcon,
  MailIcon,
  IndianRupeeIcon,
  Edit,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { formatINR } from "@/lib/utils/formatters";
import { Card, CardContent } from "@/components/ui/card";
import TableDataPagination from "@/components/Table/TableDataPagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  sendCreditReportEmail,
  getCustomerReportPreview,
  generateCreditReport,
} from "./api/CustomerService";
import toast from "react-hot-toast";
import { getResponsiveWidth } from "@/lib/utils/responsiveWidth";
import { format } from "date-fns";
import { CreditReportPreview } from "@/components/Templates/CreditReportPreview";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Backdrop from "@/components/Backdrop";
import WarningPrompt from "@/components/WarningPrompt";
import { CustomerReportGenerator } from "./components/CustomerReport/CustomerReportGenerator";

const CustomerOrganization = () => {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const navigate = useNavigate();
  const {
    customers,
    fetchCustomers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
  } = useCustomerStore();

  const responsiveWidth = getResponsiveWidth();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSaveCustomer = async (customer) => {
    setShowCustomerForm(false);
    try {
      if (selectedCustomer) {
        await updateCustomer({
          id: selectedCustomer.id,
          name: customer.name,
          email: customer.email,
          contact_phone: customer.contact_phone,
          credit_limit: customer.credit_limit,
        });
      } else {
        await addCustomer({
          ...customer,
          name: customer.name // Name is already formatted by the form component
        });
      }
      await fetchCustomers();
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error(error.response?.data?.detail || "Failed to save customer");
    }
  };

  const handleRowClick = (item) => {
    const name = item.customer_name || "No Name";
    // For URL, we'll keep spaces but encode them properly
    const encodedName = encodeURIComponent(name);
    navigate(`${document.location.pathname}/${encodedName}/${item.id}`);
  };

  const handleEditCustomer = (customer, e) => {
    e.stopPropagation();
    setSelectedCustomer({
      customer_name: customer.customer_name,
      email: customer.email,
      contact_phone: customer.contact_phone,
      credit_limit: customer.credit_limit,
      id: customer.id,
    });
    setShowCustomerForm(true);
  };

  const handleDeleteCustomer = async (customerId, e) => {
    e.stopPropagation();
    const customer = customers.find((c) => c.id === customerId);
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await deleteCustomer(customerToDelete.id);
      toast.success("Customer deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete customer");
    }
  };

  const handleToggleStatus = async (customerId, e) => {
    e.stopPropagation();
    try {
      await toggleCustomerStatus(customerId);
      toast.success("Customer status updated successfully");
    } catch (error) {
      toast.error("Failed to update customer status");
    }
  };

  const handleDownloadReport = async (
    customerId,
    dateRange,
    downloadFormat = "pdf"
  ) => {
    if (!customerId || !dateRange?.startDate || !dateRange?.endDate) {
      toast.error("Please select a customer and date range");
      return;
    }

    setIsDownloading(true);
    try {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      const response = await generateCreditReport({
        customer_id: customerId,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        interest: 0,
        bill_id: null,
        date: format(new Date(), "yyyy-MM-dd"),
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
              customerName={customer.customer_name}
            />
          );

          // Wait for the content to be rendered
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Configure html2pdf options
          const opt = {
            margin: 10,
            filename: `credit_bill_${customer.customer_name}_${format(dateRange.startDate, "yyyy-MM-dd")}.pdf`,
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
    } catch (error) {
      console.error("Error downloading report:", error);
      if (error.response?.status === 400) {
        toast.error(
          error.response?.data?.detail ||
            "Bill already exists in the mentioned period"
        );
      } else {
        toast.error("Failed to download PDF report");
      }
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreviewReport = async (customerId, dateRange) => {
    if (!customerId || !dateRange?.startDate || !dateRange?.endDate) {
      toast.error("Please select a customer and date range");
      return;
    }

    try {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      const response = await getCustomerReportPreview(
        dateRange.startDate,
        dateRange.endDate,
        customerId
      );

      if (response.status) {
        setPreviewData(response);
        setShowPreview(true);
      } else {
        toast.error(response.detail || "Failed to preview report");
      }
    } catch (error) {
      console.error("Error previewing report:", error);
      toast.error("Failed to preview report");
    }
  };

  const handleSendNotifications = async (customerId, dateRange) => {
    if (!customerId || !dateRange?.startDate || !dateRange?.endDate) {
      toast.error("Please select a customer and date range");
      return;
    }

    try {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      await sendCreditReportEmail(
        dateRange.startDate,
        dateRange.endDate,
        customerId,
        customer.customer_name,
        format(new Date(), "yyyy-MM-dd")
      );

      toast.success("Credit report sent successfully via email");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send credit report via email");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return customers?.slice(startIndex, endIndex);
  };

  const columns = [
    {
      accessorKey: "customer_name",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-neutral-gray600" />
          <span className="text-neutral-gray600">Name</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <MailIcon className="h-4 w-4 text-neutral-gray600" />
          <span className="text-neutral-gray600">Email</span>
        </div>
      ),
    },
    {
      accessorKey: "outstanding",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <IndianRupeeIcon className="h-4 w-4 text-neutral-gray600" />
          <span className="text-neutral-gray600">Outstanding</span>
        </div>
      ),
      cell: ({ row }) => {
        const outstanding = row.original.outstanding;
        return (
          <span
            className={`font-medium ${
              outstanding > 0 ? "text-[var(--success-600)]" : "text-[var(--warning-600)]"
            }`}
          >
            {formatINR(Math.abs(outstanding))}
          </span>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <span className="text-neutral-gray600">Status</span>
        </div>
      ),
      cell: ({ row }) => {
        const isActive = row.original.is_active;
        return <StatusBadge status={isActive} />;
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <span className="text-neutral-gray600">Actions</span>
        </div>
      ),
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem
                  onClick={(e) => handleEditCustomer(customer, e)}
                  className="cursor-pointer p-1 hover:bg-neutral-gray100 border-none"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => handleToggleStatus(customer.id, e)}
                  className="cursor-pointer p-1 hover:bg-neutral-gray100 border-none"
                >
                  {customer.is_active ? (
                    <ToggleLeft className="h-4 w-4 mr-2" />
                  ) : (
                    <ToggleRight className="h-4 w-4 mr-2" />
                  )}
                  {customer.is_active ? "Make Inactive" : "Make Active"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => handleDeleteCustomer(customer.id, e)}
                  className="cursor-pointer text-danger-500 focus:text-danger-600 p-1 hover:bg-neutral-gray100 border-none"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 80,
    },
  ];

  const headerContent = (
    <div className="flex items-center bg-neutral-white rounded-t-lg justify-between py-4 px-4 border border-neutral-gray200 border-b-0">
      <span className="text-md font-poppins font-medium text-neutral-gray700 pl-3">
        Customers
      </span>

      <div className="flex items-center gap-2">
        {getCurrentPageData().length > 0 && (
        <Button
          onClick={() => setShowReportDialog(true)}
          variant="outline"
          className="border-primary-500 text-primary-500 hover:bg-primary-100"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Bill
        </Button>
        )}
        <Button
          type="submit"
          onClick={() => setShowCustomerForm(true)}
          className="bg-primary-500 hover:bg-primary-600 text-neutral-white"
        >
          <CirclePlus className="w-4 h-4 mr-2" />
          Customer
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <ContentHeader
        title="Customer Management"
        description="Manage your customers and their details"
        showBackButton={false}
        isLoading={loading}
      />

      <div
        className={`flex-col ${responsiveWidth.full} ${responsiveWidth.base} ${responsiveWidth.lg} ${responsiveWidth.xl}`}
      >
        {showCustomerForm && (
          <>
            <Backdrop />
            <CustomerForm
              isOpen={showCustomerForm}
              onSave={handleSaveCustomer}
              onClose={() => {
                setShowCustomerForm(false);
                setSelectedCustomer(null);
              }}
              heading={selectedCustomer ? "Edit Customer" : "Add New Customer"}
              selectedData={selectedCustomer}
            />
          </>
        )}
      </div>

      <div
        className={`container mx-auto px-4 py-4 my-auto ${responsiveWidth.full} ${responsiveWidth.base} ${responsiveWidth.lg} ${responsiveWidth.xl}`}
      >
        <Card className="border border-neutral-gray200">
          <CardContent className="p-0 pb-5 flex flex-col">
            {/* Header Section */}
            {headerContent}

            {/* Table Section */}
            <div className="px-6">
              <BaseTable
                columns={columns}
                data={getCurrentPageData()}
                loading={loading}
                onRowClick={handleRowClick}
                isRowClickable={true}
                initialPageSize={pageSize}
                getRowClassName={(row) =>
                  !row.original.is_active ? "text-neutral-gray400" : ""
                }
                isEmpty={getCurrentPageData().length === 0}
                emptyTitle="No customers available"
                emptyDescription="Add your first customer to start managing customer relationships"
                emptyActionLabel="Add Customer"
                onEmptyAction={() => setShowCustomerForm(true)}
              />
            </div>

            {/* Pagination Section */}
            {getCurrentPageData().length > 0 && (
            <div className="mt-4">
              <TableDataPagination
                currentPage={currentPage}
                totalItems={customers?.length || 0}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newPageSize) => {
                  setPageSize(newPageSize);
                  setCurrentPage(1);
                }}
              />
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CustomerReportGenerator
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        customers={customers}
        onDownload={handleDownloadReport}
        onPreview={handlePreviewReport}
        onSendNotifications={handleSendNotifications}
        isDownloading={isDownloading}
      />

      <CreditReportPreview
        open={showPreview}
        onOpenChange={setShowPreview}
        previewData={previewData}
        customerName={previewData?.data?.preview[0]?.customer_name}
        dateRange={{
          from: previewData?.data?.preview[0]?.date,
          to: previewData?.data?.preview[previewData?.data?.preview.length - 1]
            ?.date,
        }}
      />

      <WarningPrompt
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Customer"
        description={`Are you sure you want to delete this customer? This action cannot be undone.`}
        actionText="DELETE"
        onAction={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        variant="danger"
      />
    </>
  );
};

export default CustomerOrganization;
