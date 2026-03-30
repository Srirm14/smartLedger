import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Trash2, IndianRupeeIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useInventoryStore from "../../../../store/useInventoryStore";
import { ContentHeader } from "@/components/Header/ContentHeader";
import { getResponsiveWidth } from '@/lib/utils/responsiveWidth';
import { 
  useUpdateProductStatus,
  useUpdateInventoryPrice,
  useDeleteInventoryProduct 
} from "@/queryHooks/storeCachedQueries/useInventoryQueries";
import useGlobalDateStore from "../../../../store/useGlobalStore";
import { formatINR } from "@/lib/utils/formatters";
import WarningPrompt from "@/components/WarningPrompt";

/**
 * Format date to readable format: "Jun 14 2001 4:10 am"
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
const formatCreatedDate = (dateString) => {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleDateString('en-US', options).replace(',', '');
  } catch (error) {
    return dateString; // Return original if error
  }
};

const ProductDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedProduct = location.state;
  const responsiveWidth = getResponsiveWidth();
  const selectedDate = useGlobalDateStore((state) => state.selectedDate);

  const {
    getLinkedPortfolio,
    productlinkedPortfolio,
    linkedPortfolioLoading,
  } = useInventoryStore();

  // State management
  const [status, setStatus] = useState(
    selectedProduct?.discontinued ? "Inactive" : "Active"
  );
  const [price, setPrice] = useState(selectedProduct?.price?.toString() || "");
  const [isPriceEditEnabled, setIsPriceEditEnabled] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Track original values for comparison
  const [originalStatus, setOriginalStatus] = useState(selectedProduct?.discontinued ? "Inactive" : "Active");
  const [originalPrice, setOriginalPrice] = useState(selectedProduct?.price?.toString() || "");

  // React Query mutations
  const updateStatusMutation = useUpdateProductStatus();
  const updatePriceMutation = useUpdateInventoryPrice();
  const deleteProductMutation = useDeleteInventoryProduct();

  useEffect(() => {
    if (selectedProduct?.id) {
      getLinkedPortfolio(selectedProduct.id);
    }
  }, [selectedProduct?.id, getLinkedPortfolio]);

  // Check if any changes have been made
  const hasChanges = status !== originalStatus || (isPriceEditEnabled && price !== originalPrice);

  const handleBackNavigation = () => navigate(-1);

  const handleStatusChange = (value) => {
    setStatus(value);
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
  };

  const handlePriceEditToggle = (enabled) => {
    setIsPriceEditEnabled(enabled);
    if (!enabled) {
      // Reset price to original when disabling edit
      setPrice(originalPrice);
    }
  };

  const handleSaveChanges = async () => {
    try {
      let updatedPrice = originalPrice;
      let updatedStatus = originalStatus;

      // Handle status change first
      if (status !== originalStatus) {
        const isDiscontinued = status === "Inactive";
        await updateStatusMutation.mutateAsync({
          id: selectedProduct.id,
          isDiscontinued,
          date: selectedDate
        });
        // Update local state
        selectedProduct.discontinued = isDiscontinued;
        updatedStatus = status;
        setOriginalStatus(status);
      }

      // Handle price change second
      if (isPriceEditEnabled && price !== originalPrice) {
        await updatePriceMutation.mutateAsync({
          id: selectedProduct.id,
          name: selectedProduct.product,
          price: parseFloat(price),
          date: selectedDate
        });
        // Update local state
        selectedProduct.price = parseFloat(price);
        updatedPrice = price;
        setOriginalPrice(price);
      }

      // Reset edit mode and update original values
      setIsPriceEditEnabled(false);
      
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleResetChanges = () => {
    setStatus(originalStatus);
    setPrice(originalPrice);
    setIsPriceEditEnabled(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProductMutation.mutateAsync({
        productId: selectedProduct.id,
        date: selectedDate
      });
      setShowDeleteDialog(false);
      handleBackNavigation();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const renderLinkedPortfolio = () => {
    if (linkedPortfolioLoading) {
      return <Loader2 color="#6C60FB" className="animate-spin" size={18} />;
    }

    if (
      Array.isArray(productlinkedPortfolio) &&
      productlinkedPortfolio.length > 0
    ) {
      return (
        <div className="flex flex-wrap gap-2">
          {productlinkedPortfolio.map((portfolio, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-sm border-[1px] border-secondary-300"
            >
              {portfolio.portfolioName}
            </Badge>
          ))}
        </div>
      );
    }

    return <span className="italic text-secondary-400">No portfolio linked</span>;
  };

  const isLoading = updateStatusMutation.isPending || updatePriceMutation.isPending || deleteProductMutation.isPending;

  return (
    <>
      <ContentHeader
        title="Product Details"
        description="View and manage product details"
        showBackButton={true}
        isLoading={isLoading}
      />
      <div className={`container mx-auto px-4 py-4 my-auto ${responsiveWidth.base} ${responsiveWidth.lg} ${responsiveWidth.xl}`}>
        <Card className="bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                Product Information
              </CardTitle>
              <div className="flex items-center gap-3">
                {/* Global Save/Reset buttons - show only when changes are made */}
                {hasChanges && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetChanges}
                      disabled={isLoading}
                      className="h-8 px-3"
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveChanges}
                      disabled={isLoading}
                      className="h-8 px-3"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteClick}
                  disabled={isLoading}
                  className="h-8 px-3 text-[var(--danger-500)] border-[var(--danger-500)] hover:bg-[var(--danger-50)] hover:text-[var(--danger-600)]"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="productName" className="text-sm font-medium text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                  Product Name
                </Label>
                <p className="text-[16px] text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                  {selectedProduct?.product}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-sm font-medium text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                  Category
                </Label>
                <p className="text-[16px] text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                  {selectedProduct?.category}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-sm font-medium text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)] flex items-center gap-3">
                  Current Price
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]">
                      Modify Price
                    </span>
                    <Switch
                      id="price-edit-toggle"
                      checked={isPriceEditEnabled}
                      onCheckedChange={handlePriceEditToggle}
                      disabled={isLoading}
                      className="scale-75"
                    />
                  </div>
                </Label>
                {isPriceEditEnabled ? (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <IndianRupeeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--neutral-gray500)]" />
                      <Input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={handlePriceChange}
                        disabled={isLoading}
                        className="pl-10 h-9"
                        placeholder="Enter price"
                      />
                    </div>
                    <span className="text-xs text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]">
                      as of {selectedDate}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-[16px] font-semibold text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                      {formatINR(selectedProduct?.price)}
                    </p>
                    <span className="text-xs text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]">
                      as of {selectedDate}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="uom" className="text-sm font-medium text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                  UOM
                </Label>
                <p className="text-[16px] text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                  {selectedProduct?.uom}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="createdAt" className="text-sm font-medium text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                  Created At
                </Label>
                <p className="text-[16px] text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                  {formatCreatedDate(selectedProduct?.createdAt)}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="linkedPortfolio"
                  className="text-sm font-medium text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]"
                >
                  Linked Portfolio
                </Label>
                <p className="text-[16px] text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                  {renderLinkedPortfolio()}
                </p>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="status" className="text-sm font-medium text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                  Status
                </Label>
                <Select 
                  value={status} 
                  onValueChange={handleStatusChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-[200px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active" className="text-[var(--success-500)]">
                      Active
                    </SelectItem>
                    <SelectItem value="Inactive" className="text-[var(--danger-500)]">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <WarningPrompt
            open={true}
            onOpenChange={setShowDeleteDialog}
            title="Delete Product"
            description={
              <>
                Are you sure you want to delete <b>{selectedProduct?.product}</b>? This action cannot be undone and will remove all related data.
              </>
            }
            actionText="DELETE"
            onAction={handleDeleteConfirm}
            onCancel={() => setShowDeleteDialog(false)}
            variant="danger"
            isLoading={deleteProductMutation.isPending}
          />
        )}
      </div>
    </>
  );
};

export default ProductDetails;
