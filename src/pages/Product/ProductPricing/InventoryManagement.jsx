import { useEffect, useState } from "react";
import { ContentHeader } from "@/components/Header/ContentHeader";
import { 
  MoreVertical, 
  CirclePlus,
  PackageIcon,
  TagIcon,
  IndianRupeeIcon,
  ScaleIcon,
  CircleDotIcon,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import useGlobalDateStore from "../../../../store/useGlobalStore";
import { useNavigate } from "react-router-dom";
import { InventoryActionDialog } from "../Component/InventoryActionDialog";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/Table/BaseTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { formatINR } from "@/lib/utils/formatters";
import { getResponsiveWidth } from '@/lib/utils/responsiveWidth';
import { Card, CardContent } from "@/components/ui/card";
import TableDataPagination from "@/components/Table/TableDataPagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FUEL_UOM_OPTIONS, GENERAL_UOM_OPTIONS } from "../Component/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useInventoryProducts,
  useAddInventoryProduct,
  useUpdateInventoryPrice,
  useDeleteInventoryProduct,
  useUpdateProductStatus,
} from "@/queryHooks/storeCachedQueries/useInventoryQueries";

/**
 * InventoryManagement Component
 * Manages product inventory, pricing, and related operations
 */
export const InventoryManagement = () => {
  const navigate = useNavigate();
  const selectedDate = useGlobalDateStore((state) => state.selectedDate);
  const responsiveWidth = getResponsiveWidth();

  // React Query hooks
  const { 
    data: inventoryProducts = [], 
    isLoading: inventoryLoading 
  } = useInventoryProducts(selectedDate);
  
  const addProductMutation = useAddInventoryProduct();
  const updatePriceMutation = useUpdateInventoryPrice();
  const deleteProductMutation = useDeleteInventoryProduct();
  const updateStatusMutation = useUpdateProductStatus();

  // Component state
  const [dataArray, setDataArray] = useState([]);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Update data array when inventory products change
  useEffect(() => {
    setDataArray(inventoryProducts);
  }, [inventoryProducts]);

  /**
   * Get paginated data for current page
   * @returns {Array} Array of items for current page
   */
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return dataArray.slice(startIndex, endIndex);
  };

  /**
   * Handle modify price action for a product
   * @param {Object} product - Product to modify price
   * @param {Event} e - Event object
   */
  const handleModifyPrice = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setActionType("edit");
    setOpenActionDialog(true);
  };

  /**
   * Handle create action for new product
   */
  const handleCreate = () => {
    setSelectedProduct(null);
    setActionType("add");
    setOpenActionDialog(true);
  };

  /**
   * Handle delete action for a product
   * @param {Object} product - Product to delete
   * @param {Event} e - Event object
   */
  const handleDelete = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setActionType("delete");
    setOpenActionDialog(true);
  };

  /**
   * Handle status toggle for a product (Active/Inactive)
   * @param {Object} product - Product to toggle status
   * @param {Event} e - Event object
   */
  const handleToggleStatus = async (product, e) => {
    e.stopPropagation();
    try {
      const newStatus = !product.discontinued;
      await updateStatusMutation.mutateAsync({
        id: product.id,
        isDiscontinued: newStatus,
        date: selectedDate
      });
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  /**
   * Handle form submission for add/edit/delete actions
   * @param {Object} formData - Form data submitted
   */
  const handleFormSubmit = async (formData) => {
    setOpenActionDialog(false);
    
    try {
      switch (actionType) {
        case "edit":
          await updatePriceMutation.mutateAsync({
            id: selectedProduct.id,
            name: formData.product,
            price: formData.price,
            date: selectedDate
          });
          break;
        case "add":
          await addProductMutation.mutateAsync(formData);
          break;
        case "delete":
          await deleteProductMutation.mutateAsync({
            productId: selectedProduct.id,
            date: selectedDate
          });
          break;
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  /**
   * Handle row click navigation to product details
   * @param {Object} rowData - Row data clicked
   */
  const handleRowClick = (rowData) => {
    navigate(`/product-management/${encodeURIComponent(rowData.product)}`, {
      state: rowData,
    });
  };

  // Table column definitions
  const columns = [
    {
      accessorKey: "product",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <PackageIcon className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
          <span className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">Product</span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
          <span className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">Category</span>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <IndianRupeeIcon className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
          <span className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">Price</span>
        </div>
      ),
      cell: ({ row }) => formatINR(row.original.price),
    },
    {
      accessorKey: "uom",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <ScaleIcon className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
          <span className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">UOM</span>
        </div>
      ),
      cell: ({ row }) => {
        const uomValue = row.original.uom;
        const allUomOptions = [...FUEL_UOM_OPTIONS, ...GENERAL_UOM_OPTIONS];
        const uomOption = allUomOptions.find(option => option.value === uomValue);
        const tooltipLabel = uomOption?.label || uomValue;
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-medium text-gray-600 w-20 block">
                  {uomValue || "-"}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-neutral-gray900 text-neutral-white px-3 py-1.5 text-sm rounded-md shadow-lg">
                {tooltipLabel}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "discontinued",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <CircleDotIcon className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
          <span className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">Status</span>
        </div>
      ),
      cell: ({ row }) => (
        <StatusBadge status={row.original.discontinued ? "Inactive" : "Active"} />
      ),
    },
    {
      id: "actions",
      header: () => <span className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">Actions</span>,
      cell: ({ row }) => {
        const product = row.original;
        const isActive = !product.discontinued;
        
        return (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)] transition-colors">
                  <MoreVertical className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-[180px] bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] border border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] rounded-lg shadow-lg p-1 z-50"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={(e) => handleModifyPrice(product, e)}
                  className="cursor-pointer px-3 py-2 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray300)] hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)] rounded-md transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Edit className="h-4 w-4" />
                  Modify Price
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => handleToggleStatus(product, e)}
                  className="cursor-pointer px-3 py-2 text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)] hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)] rounded-md transition-colors flex items-center gap-2 text-sm font-medium"
                  disabled={updateStatusMutation.isPending}
                >
                  {isActive ? (
                    <ToggleLeft className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
                  ) : (
                    <ToggleRight className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
                  )}
                  <span className="whitespace-nowrap">
                    {isActive ? "Make Inactive" : "Make Active"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => handleDelete(product, e)}
                  className="cursor-pointer px-3 py-2 text-[var(--danger-600)] dark:text-[var(--danger-400)] hover:bg-[var(--danger-50)] dark:hover:bg-[var(--danger-950)] hover:text-[var(--danger-700)] dark:hover:text-[var(--danger-300)] rounded-md transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <ContentHeader
        title="Product"
        description="Manage your product list and pricing"
        showBackButton={false}
        isLoading={inventoryLoading}
      />
      <div className={`container mx-auto px-4 py-4 my-auto ${responsiveWidth.base} ${responsiveWidth.lg} ${responsiveWidth.xl}`}>
        <Card className="bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]">
          <CardContent className="p-0 flex flex-col">
            {/* Header Section */}
            <div className="flex items-center justify-between pt-4 px-6">
              <div className="flex items-center gap-3">
                <span className="text-md font-poppins font-medium text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)] flex items-center gap-2">
                  Product List <span className="text-sm font-normal text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">as of</span>
                  <span className="inline-flex items-center px-3 py-1 bg-[var(--neutral-gray50)] dark:bg-[var(--neutral-gray800)] border border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] rounded-lg">
                    <span className="text-xs font-semibold text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">{selectedDate}</span>
                  </span>
                </span>
              </div>
              <Button
                onClick={handleCreate}
                className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-[var(--neutral-white)]"
              >
                <CirclePlus className="w-4 h-4 mr-2" />
                Products
              </Button>
            </div>

            {/* Table Section */}
            <div className="p-6">
              <BaseTable
                columns={columns}
                data={getCurrentPageData()}
                loading={inventoryLoading}
                onRowClick={handleRowClick}
                isRowClickable={true}
                isStatusAvailable={true}
                getRowClassName={(row) => row.original.discontinued === true ? 'text-[var(--neutral-gray400)]' : ''}
                isEmpty={getCurrentPageData().length === 0}
                emptyTitle="No products available"
                emptyDescription="Create and Add your first inventory product to start managing inventory"
                emptyActionLabel="Create Product"
                onEmptyAction={handleCreate}
              />
            </div>

            {/* Pagination Controls */}
            {getCurrentPageData().length > 0 && (
              <div className="mt-auto">
                <TableDataPagination
                  currentPage={currentPage}
                  totalItems={dataArray.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize);
                    setCurrentPage(1);  // Reset to page 1 when page size changes
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Dialog */}
        {openActionDialog && (
          <>
            <InventoryActionDialog
              action={actionType}
              item={selectedProduct || {}}
              onClose={() => setOpenActionDialog(false)}
              onConfirm={handleFormSubmit}
              heading={
                actionType === "delete"
                  ? "Delete Product"
                  : actionType === "edit"
                  ? "Modify Product Price"
                  : "Create Product"
              }
            />
          </>
        )}
      </div>
    </>
  );
};
