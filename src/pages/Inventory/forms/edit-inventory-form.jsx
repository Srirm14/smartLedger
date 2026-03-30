import React, { useState, useEffect, useCallback, useMemo } from "react"
import { FormDialogWrapper } from "@/components/FormDialogWrapper"
import { Package2, PackageSearch, Scale, Database, AlertTriangle, Building2, Store } from "lucide-react"
import { InputTextField, SelectField } from "@/components/CommonFields"
import { getInventory } from "@/services/apiService"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ALLL_TYPE_OPTIONS, ALLL_UOM_OPTIONS } from "../constants"
import { editInventorySchemaWithRefinement } from "@/lib/schemas/inventory-schema"

// Custom hook for edit form state management
const useEditInventoryForm = (selectedData, stockHeader) => {
  const [formState, setFormState] = useState({
    products: [],
    loading: false,
    saving: false,
    error: null
  })

  // Initialize form values for edit mode
  const defaultValues = useMemo(() => {
    if (!selectedData) return null

    // Get current stock level from stockHeader, fallback to 0 if not available
    const currentStock = stockHeader?.stock_level?.toString() || "0"

    return {
      id: selectedData.id,
      stock_name: selectedData.stock_name || "",
      product_id: selectedData.product_id ? String(selectedData.product_id) : "",
      capacity: selectedData.capacity?.toString() || "",
      stock: currentStock,
      low_stock_limit: selectedData.low_stock_limit?.toString() || "0",
      uom: selectedData.uom || "",
      type: selectedData.type || ""
    }
  }, [selectedData, stockHeader])

  const form = useForm({
    resolver: zodResolver(editInventorySchemaWithRefinement),
    defaultValues: defaultValues || {},
    mode: "onChange",
    shouldUnregister: false
  })

  // Reset form when selectedData or stockHeader changes
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues, { keepDirty: false, keepErrors: false, keepTouched: false })
      // Trigger validation after reset
      setTimeout(() => {
        form.trigger()
      }, 100)
    }
  }, [defaultValues, form])

  // Update stock field when stockHeader becomes available
  useEffect(() => {
    if (stockHeader?.stock_level !== undefined && form.getValues("stock") === "0") {
      const currentStock = stockHeader.stock_level.toString()
      form.setValue("stock", currentStock, { shouldValidate: true, shouldDirty: false })
    }
  }, [stockHeader, form])

  // Watch form values
  const watchedValues = form.watch()
  const { formState: { isValid, errors, isDirty } } = form

  // Custom dirty check that works with manual value setting
  const customIsDirty = useMemo(() => {
    if (!defaultValues) return false

    return Object.keys(defaultValues).some(key => {
      const currentValue = watchedValues[key]
      const originalValue = defaultValues[key]
      
      // Handle null/undefined values properly
      const currentStr = currentValue != null ? String(currentValue).trim() : ""
      const originalStr = originalValue != null ? String(originalValue).trim() : ""
      return currentStr !== originalStr
    })
  }, [watchedValues, defaultValues])

  const canSubmit = (isDirty || customIsDirty) && isValid && !formState.loading && defaultValues

  return {
    form,
    formState,
    setFormState,
    watchedValues,
    isValid,
    isDirty: isDirty || customIsDirty,
    canSubmit,
    errors,
    defaultValues
  }
}

// Custom hook for data fetching
const useEditInventoryData = (productId, selectedData) => {
  const [data, setData] = useState({
    products: [],
    loading: false,
    error: null
  })

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getInventory()
        if (response && typeof response === "object") {
          const productList = Object.values(response).map(item => ({
            value: String(item.id),
            label: item.product,
            category: item.category,
            uom: item.uom
          }))
          setData(prev => ({ ...prev, products: productList }))
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
        setData(prev => ({ ...prev, error: "Failed to load products" }))
      }
    }

    fetchProducts()
  }, [])

  return data
}

// Custom hook for business logic
const useEditInventoryLogic = (form, products) => {
  const capacityValue = form.watch("capacity")
  const isCapacityFilled = capacityValue && parseInt(capacityValue) > 0

  // Reset dependent fields when capacity is cleared or changed
  useEffect(() => {
    if (!isCapacityFilled) {
      form.setValue("low_stock_limit", "0")
      form.setValue("stock", "0")
    }
  }, [isCapacityFilled, form])

  return {
    capacityValue,
    isCapacityFilled
  }
}



// Main edit form component
export const EditInventoryForm = ({ 
  isOpen, 
  onSave, 
  onClose, 
  selectedData, 
  stockHeader, // Add stockHeader prop to get current stock level
  heading, 
  disabled = false 
}) => {
  if (!selectedData?.id) {
    console.error("EditInventoryForm requires selectedData with id")
    return null
  }

  // Form management
  const {
    form,
    formState,
    setFormState,
    watchedValues,
    isValid,
    isDirty,
    canSubmit,
    errors,
    defaultValues
  } = useEditInventoryForm(selectedData, stockHeader) // Pass stockHeader to the hook

  // Data fetching
  const { products, loading, error } = useEditInventoryData(
    watchedValues.product_id,
    selectedData
  )

  // Business logic
  const {
    capacityValue,
    isCapacityFilled
  } = useEditInventoryLogic(form, products)



  // Handle form submission
  const handleSave = useCallback(async (data) => {
    setFormState(prev => ({ ...prev, saving: true, error: null }))
    
    try {
      const formattedData = {
        ...data,
        product_id: String(data.product_id),
        capacity: Number(data.capacity),
        stock: Number(data.stock),
        low_stock_limit: Number(data.low_stock_limit),
        id: selectedData.id
      }
      
      await onSave(formattedData)
    } catch (error) {
      console.error("Failed to save inventory:", error)
      setFormState(prev => ({ 
        ...prev, 
        error: "Failed to save inventory. Please try again." 
      }))
    } finally {
      setFormState(prev => ({ ...prev, saving: false }))
    }
  }, [onSave, selectedData.id, setFormState])

  // Handle form close
  const handleClose = useCallback(() => {
    form.reset()
    setFormState(prev => ({ ...prev, error: null }))
    onClose()
  }, [form, onClose, setFormState])

  // Memoized options
  const productOptions = useMemo(() => products, [products])
  const typeOptions = useMemo(() => ALLL_TYPE_OPTIONS, [])
  const uomOptions = useMemo(() => ALLL_UOM_OPTIONS, [])

  // Check if form is ready
  const isFormReady = defaultValues && watchedValues.product_id && watchedValues.stock_name && Object.keys(watchedValues).length > 0

  return (
    <FormDialogWrapper
      open={isOpen}
      onClose={handleClose}
      title={heading}
      onSubmit={form.handleSubmit(handleSave)}
      submitLabel={formState.saving ? "Saving..." : "Save Changes"}
      submitDisabled={!canSubmit || !isFormReady || disabled}
      isFormValid={isValid}
      isFormDirty={isDirty}
      maxWidth="xl"
      isSubmitting={formState.saving}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {formState.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{formState.error}</p>
        </div>
      )}

      <Form {...form}>
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <InputTextField
              control={form.control}
              name="stock_name"
              label="Stock Name"
              placeholder="Enter name (3-15 chars)"
              required={true}
              disabled={disabled}
              startIcon={<Package2 className="h-4 w-4 text-neutral-gray500" />}
            />

            <SelectField
              control={form.control}
              name="product_id"
              label="Product"
              placeholder="Select product"
              options={productOptions}
              required={true}
              disabled={true} // Product cannot be changed in edit mode
              startIcon={<PackageSearch className="h-4 w-4 text-neutral-gray500" />}
            />

            <InputTextField
              control={form.control}
              name="capacity"
              label="Capacity"
              type="number"
              placeholder="Enter maximum capacity"
              required={true}
              disabled={disabled}
              startIcon={<Database className="h-4 w-4 text-neutral-gray500" />}
            />

            <InputTextField
              control={form.control}
              name="stock"
              label="Current Stock"
              type="number"
              placeholder="Current stock level (read-only)"
              required={true}
              disabled={true} // Always disabled - users cannot edit current stock
              min="0"
              startIcon={<Store className="h-4 w-4 text-neutral-gray500" />}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <InputTextField
              control={form.control}
              name="low_stock_limit"
              label="Low Stock Limit"
              type="number"
              placeholder={isCapacityFilled ? `Enter threshold (max: ${capacityValue})` : "Set capacity first"}
              required={true}
              disabled={!isCapacityFilled || disabled}
              min="1"
              max={isCapacityFilled ? capacityValue : undefined}
              startIcon={<AlertTriangle className="h-4 w-4 text-neutral-gray500" />}
            />

            <SelectField
              control={form.control}
              name="uom"
              label="Unit of Measurement"
              placeholder="Select UOM"
              options={uomOptions}
              required={true}
              disabled={true} // Always disabled - users cannot edit UOM
              startIcon={<Scale className="h-4 w-4 text-neutral-gray500" />}
            />

            <SelectField
              control={form.control}
              name="type"
              label="Type"
              placeholder="Select storage type"
              options={typeOptions}
              required={true}
              disabled={disabled}
              startIcon={<Building2 className="h-4 w-4 text-neutral-gray500" />}
            />
          </div>
        </div>
      </Form>
    </FormDialogWrapper>
  )
} 