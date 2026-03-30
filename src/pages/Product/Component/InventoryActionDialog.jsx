import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addInventorySchema, editInventorySchema } from "@/lib/schemas/product-schema";
import { Form } from "@/components/ui/form";
import { InputTextField } from "@/components/CommonFields/InputTextField";
import { SelectField } from "@/components/CommonFields/SelectField";
import { CATEGORY_OPTIONS, getUOMOptionsByCategory } from "./constants";
import WarningPrompt from "@/components/WarningPrompt";
import { FormDialogWrapper } from "@/components/FormDialogWrapper";
import { Package, Tags, IndianRupee, Scale } from "lucide-react";

export const InventoryActionDialog = ({ action, item, onClose, onConfirm }) => {
  const initialUOMOptions = useMemo(() => 
    item ? getUOMOptionsByCategory(item.category) : getUOMOptionsByCategory("Others"),
    [item]
  );
  
  const [uomOptions, setUOMOptions] = useState(initialUOMOptions);

  // Store original values for proper dirty checking
  const originalValues = useMemo(() => {
    if (action === "edit" && item) {
      return { ...item }; // Create a copy to avoid reference issues
    }
    return {
      product: "",
      category: "",
      price: "",
      uom: ""
    };
  }, [item, action]);

  const form = useForm({
    resolver: zodResolver(action === "add" ? addInventorySchema : editInventorySchema),
    defaultValues: originalValues,
    mode: "onChange" // Enable real-time validation
  });

  // Watch all form values for custom dirty checking
  const currentValues = form.watch();
  const { formState: { isValid } } = form;

  // Custom dirty check that properly handles reverts
  const isActuallyDirty = useMemo(() => {
    // For add action, any non-empty values mean it's dirty
    if (action === "add") {
      return Object.values(currentValues).some(value => value !== "");
    }
    
    // For edit action, compare current values with original values
    if (!item) return false;
    
    return Object.keys(originalValues).some(key => {
      const currentValue = currentValues[key];
      const originalValue = originalValues[key];
      
      // Handle numeric comparison for price field
      if (key === "price") {
        const currentNum = parseFloat(currentValue) || 0;
        const originalNum = parseFloat(originalValue) || 0;
        return Math.abs(currentNum - originalNum) > 0.001;
      }
      
      // Handle string comparison with null/undefined safety
      const currentStr = String(currentValue || "");
      const originalStr = String(originalValue || "");
      return currentStr !== originalStr;
    });
  }, [currentValues, originalValues, action, item]);

  const shouldEnableSubmitButton = isActuallyDirty && isValid;

  // Memoized UOM update function
  const updateUOMOptions = useCallback((category) => {
    setUOMOptions(getUOMOptionsByCategory(category));
  }, []);

  useEffect(() => {
    if (item && action === "edit") {
      // Only reset if the form values don't match the item (prevents unnecessary resets)
      const currentFormValues = form.getValues();
      const needsReset = Object.keys(item).some(key => currentFormValues[key] !== item[key]);
      
      if (needsReset) {
        form.reset(item);
      }
      updateUOMOptions(item.category);
    }
  }, [item, form, action, updateUOMOptions]);

  // Watch for category changes
  const selectedCategory = form.watch("category");
  useEffect(() => {
    if (selectedCategory) {
      updateUOMOptions(selectedCategory);
      
      // Only reset UOM when category changes in ADD mode
      // In EDIT mode, preserve the original UOM unless category actually changed
      if (action === "add") {
        form.setValue("uom", "");
      } else if (action === "edit" && item && selectedCategory !== item.category) {
        form.setValue("uom", "");
      }
    }
  }, [selectedCategory, form, action, item, updateUOMOptions]);

  const onSubmit = useCallback((data) => {
    onConfirm(data);
  }, [onConfirm]);

  const renderDialogContent = useCallback(() => {
    switch (action) {
      case "add":
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <InputTextField
                control={form.control}
                name="product"
                label="Product Name"
                placeholder="Enter product name"
                required={true}
                startIcon={<Package className="h-4 w-4 text-neutral-gray500" />}
              />

              <SelectField
                control={form.control}
                name="category"
                label="Category"
                placeholder="Select Category"
                options={CATEGORY_OPTIONS}
                required={true}
                startIcon={<Tags className="h-4 w-4 text-neutral-gray500" />}
              />

              <InputTextField
                control={form.control}
                name="price"
                label="Price"
                placeholder="Enter price (₹1 - ₹1,00,000)"
                type="number"
                step="0.01"
                min="1"
                max="100000"
                required={true}
                startIcon={<IndianRupee className="h-4 w-4 text-neutral-gray500" />}
              />

              <SelectField
                control={form.control}
                name="uom"
                label="UOM"
                placeholder="Select UOM"
                options={uomOptions}
                required={true}
                startIcon={<Scale className="h-4 w-4 text-neutral-gray500" />}
              />
            </form>
          </Form>
        );

      case "edit":
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <InputTextField
                control={form.control}
                name="product"
                label="Product Name"
                placeholder="Enter product name"
                readonly={true}
                startIcon={<Package className="h-4 w-4 text-neutral-gray500" />}
              />

              <SelectField
                control={form.control}
                name="category"
                label="Category"
                placeholder="Category"
                options={CATEGORY_OPTIONS}
                readonly={true}
                startIcon={<Tags className="h-4 w-4 text-neutral-gray500" />}
              />

              <InputTextField
                control={form.control}
                name="price"
                label="Price"
                placeholder="Enter price (₹1 - ₹1,00,000)"
                type="number"
                step="0.01"
                min="1"
                max="100000"
                required={true}
                startIcon={<IndianRupee className="h-4 w-4 text-neutral-gray500" />}
              />

              <SelectField
                control={form.control}
                name="uom"
                label="UOM"
                placeholder={item?.uom || "Select UOM"}
                options={uomOptions}
                readonly={true}
                startIcon={<Scale className="h-4 w-4 text-neutral-gray500" />}
              />
            </form>
          </Form>
        );

      case "delete":
        return (
          <WarningPrompt
            open={true}
            onOpenChange={onClose}
            title="Delete Inventory Item"
            description={
              <>
                Are you sure you want to delete <b>{item.product}</b>? This action cannot be undone.
              </>
            }
            actionText="DELETE"
            onAction={onSubmit}
            onCancel={onClose}
            variant="danger"
          />
        );

      default:
        return null;
    }
  }, [action, form, onSubmit, uomOptions, item, onClose]);

  return action === "delete" ? (
    renderDialogContent()
  ) : (
    <FormDialogWrapper
      open={true}
      onClose={onClose}
      title={action === "add" ? "Create Product" : "Modify Product Price"}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={action === "add" ? "Create" : "Save"}
      submitDisabled={false}
      isFormValid={isValid}
      isFormDirty={isActuallyDirty}
    >
      {renderDialogContent()}
    </FormDialogWrapper>
  );
};
