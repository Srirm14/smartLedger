// src/pages/InventoryStockManagement.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CirclePlus,
  Trash2,
  PackageIcon,
  TagIcon,
  ScaleIcon,
  DatabaseIcon,
  ContainerIcon,
  Loader2,
} from "lucide-react";
import { AddInventoryForm } from "./forms/add-inventory-form";
import TableDataPagination from "@/components/Table/TableDataPagination";
import { ContentHeader } from "@/components/Header/ContentHeader";
import { BaseTable } from "@/components/Table/BaseTable";
import { useStockManagementStore } from "../../../store/useStockManagement";
import { getResponsiveWidth } from "@/lib/utils/responsiveWidth";
import Backdrop from "@/components/Backdrop";
import TooltipMessage from "@/components/TooltipMessage";
import WarningPrompt from "@/components/WarningPrompt";
import { toast } from "react-hot-toast";

export const InventoryStockManagement = () => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [selectedItemToDelete, setSelectedItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const responsiveWidth = getResponsiveWidth();
  // Get store state and actions
  const {
    stockItems,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    setCurrentPage,
    setPageSize,
    fetchStockItems,
    addStockItem,
    deleteStockItem,
    getPaginatedItems,
  } = useStockManagementStore();

  // Fetch stock items on component mount and when pagination changes
  useEffect(() => {
    fetchStockItems();
  }, [fetchStockItems, currentPage, pageSize]);

  console.log(stockItems , "stockItems");

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return stockItems?.slice(startIndex, endIndex) || [];
  };
  const handleDeleteProduct = useCallback((product, event) => {
    event.stopPropagation();
    setSelectedItemToDelete(product);
    setShowDeleteWarning(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedItemToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteStockItem(selectedItemToDelete.id);
    
    } catch (error) {
      // Error is already handled in the store with toast
      console.error("Failed to delete stock:", error);
      setShowDeleteWarning(false);
      setSelectedItemToDelete(null);
    } finally {
      setIsDeleting(false);
      setShowDeleteWarning(false);
      setSelectedItemToDelete(null);
    }
  }, [selectedItemToDelete, deleteStockItem]);

  const handleCancelDelete = useCallback(() => {
    if (!isDeleting) {
      setShowDeleteWarning(false);
      setSelectedItemToDelete(null);
    }
  }, [isDeleting]);

  

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "stock_name",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <PackageIcon className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">Stock Name</span>
          </div>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm min-w-[10rem] block">
            {getValue() || "-"}
          </span>
        ),
      },
      {
        accessorKey: "product_name",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">Product Name</span>
          </div>
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          const displayValue = value ? value.charAt(0).toUpperCase() + value.slice(1) : "-";
          return (
            <span
              className="inline-block px-2 py-0.5 rounded bg-neutral-gray100 text-neutral-gray900 text-xs font-semibold"
              style={{ textTransform: "capitalize" }}
            >
              {displayValue}
            </span>
          );
        },
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <DatabaseIcon className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">Type</span>
          </div>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm min-w-[6rem] block">
            {getValue() || "-"}
          </span>
        ),
      },
      {
        accessorKey: "uom",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <ScaleIcon className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">UOM</span>
          </div>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-gray-600 w-20 block">
            {getValue() || "-"}
          </span>
        ),
      },
      {
        accessorKey: "capacity",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <ContainerIcon className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">Capacity</span>
          </div>
        ),
        cell: ({ row, getValue }) => {
          const uom = row.original.uom || "";
          const value = getValue();
          return (
            <div className="flex items-baseline space-x-1 min-w-[9rem]">
              <span className="text-sm font-semibold">
                {value !== null && value !== undefined && value !== ""
                  ? value
                  : "-"}
              </span>
              {uom && (
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                  {uom}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "total_stock",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <DatabaseIcon className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">Current Stock</span>
          </div>
        ),
        cell: ({ row, getValue }) => {
          const uom = row.original.uom || "";
          const value = getValue();
          const lowStockLimit = row.original.low_stock_limit;
          const isNegative = value < 0;
          const isLowStock = lowStockLimit && value <= lowStockLimit;
          
          return (
            <div className="flex items-baseline space-x-1 min-w-[9rem]">
              <span
                className={`text-md font-semibold ${
                  isNegative 
                    ? "text-danger-600" 
                    : isLowStock 
                      ? "text-yellow-500" 
                      : "text-success-600"
                }`}
              >
                {value !== null && value !== undefined && value !== ""
                  ? value
                  : "-"}
              </span>
              {uom && (
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isNegative 
                      ? "text-danger-600" 
                      : isLowStock 
                        ? "text-yellow-500" 
                        : "text-success-600"
                  }`}
                >
                  {uom}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="text-gray-600">Actions</span>,
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center justify-center space-x-2">
              <TooltipMessage message="Delete stock">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteProduct(product, e)}
                  className="hover:text-[var(--danger-500)]"
                  aria-label={`Delete ${product.stock_name}`}
                  disabled={isDeleting && selectedItemToDelete?.id === product.id || loading}
                >
                  {isDeleting && selectedItemToDelete?.id === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipMessage>
            </div>
          );
        },
        size: 80,
      },
    ],
    [handleDeleteProduct]
  );

  const handleRowClick = useCallback(
    (row) => {
      navigate(`/inventory-management/${row.id}`);
    },
    [navigate]
  );

  const handleAddProduct = useCallback(() => {
    setShowAddForm(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (formData) => {
      try {
        await addStockItem(formData);
        await fetchStockItems();
        setShowAddForm(false);
      } catch (error) {
        console.error("Failed to add stock:", error);
      }
    },
    [addStockItem, fetchStockItems]
  );

  return (
    <>
      <ContentHeader
        title="Inventory Stock Management"
        description="Manage your inventory stock levels and transactions"
        showBackButton={false}
        isLoading={loading}
      />

      <div
        className={`container mx-auto px-4 py-4 my-auto ${responsiveWidth.base} ${responsiveWidth.lg} ${responsiveWidth.xl}`}
      >
        <Card className=" shadow-sm border border-gray-200">
          <CardContent className="p-0 flex flex-col">
            <div className="flex items-center justify-between pt-4  px-6 ">
              <span className="text-lg font-semibold text-gray-700">
               Inventory List
              </span>
              <Button
                onClick={handleAddProduct}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                <CirclePlus className="w-4 h-4 mr-2" />
                Inventory
              </Button>
            </div>

            <div className="p-6">
              <BaseTable
                columns={columns}
                data={getCurrentPageData()}
                loading={loading}
                onRowClick={handleRowClick}
                isRowClickable={true}
                isEmpty={getCurrentPageData().length === 0}
                emptyTitle="No inventory items available"
                emptyDescription="Create and Add your first inventory item to start managing stock"
                emptyActionLabel="Add Inventory"
                onEmptyAction={handleAddProduct}
              />
            </div>

            {getCurrentPageData().length > 0 && ( 
            <div className="mt-auto">
              <TableDataPagination
                currentPage={currentPage}
                totalItems={stockItems?.length || 0}
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

      {showAddForm && (
        <>
          <Backdrop />
          <AddInventoryForm
            isOpen={showAddForm}
            onSave={handleFormSubmit}
            onClose={() => setShowAddForm(false)}
            heading="Create Inventory"
          />
        </>
      )}

      <WarningPrompt
        open={showDeleteWarning}
        title="Delete Stock Item"
        description={`Are you sure you want to delete "${selectedItemToDelete?.stock_name}"? This action cannot be undone and will permanently remove this stock item from your inventory.`}
        actionText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onAction={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
        disabled={isDeleting}
      />
    </>
  );
};
