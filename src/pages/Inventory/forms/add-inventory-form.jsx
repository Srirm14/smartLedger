import React, { useState, useEffect, useCallback, useMemo } from "react"
import { FormDialogWrapper } from "@/components/FormDialogWrapper"
import { Package2, PackageSearch, Scale, Database, AlertTriangle, Store, Building2, Link } from "lucide-react"
import { InputTextField, SelectField } from "@/components/CommonFields"
import { getInventory } from "@/services/apiService"
import { getSalesUnitProduct } from "../api/inventoryService"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ALLL_TYPE_OPTIONS, ALLL_UOM_OPTIONS } from "../constants"
import { addInventorySchemaWithRefinement } from "@/lib/schemas/inventory-schema"

// Custom hook for add form state management
const useAddInventoryForm = () => {
  const [formState, setFormState] = useState({
    products: [],
    salesUnits: [],
    selectedSalesUnits: [],
    loading: false,
    saving: false,
    error: null
  })

  const defaultValues = {
    stock_name: "",
    product_id: "",
    capacity: "",
    stock: "0",
    low_stock_limit: "0",
    sales_unit_id: [],
    uom: "",
    type: ""
  }

  const form = useForm({
    resolver: zodResolver(addInventorySchemaWithRefinement),
    defaultValues,
    mode: "onChange"
  })

  // Watch form values
  const watchedValues = form.watch()
  const { formState: { isValid } } = form

  // Check if form is dirty (has any values filled)
  const isDirty = useMemo(() => {
    return Object.keys(watchedValues).some(key => {
      const value = watchedValues[key]
      if (key === "sales_unit_id") {
        return Array.isArray(value) && value.length > 0
      }
      return value !== "" && value !== "0"
    })
  }, [watchedValues])

  const canSubmit = isDirty && isValid

  return {
    form,
    formState,
    setFormState,
    watchedValues,
    isValid,
    isDirty,
    canSubmit
  }
}

// Custom hook for data fetching
const useAddInventoryData = (productId) => {
  const [data, setData] = useState({
    products: [],
    salesUnits: [],
    loading: false,
    error: null
  })

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const currentDate = new Date().toISOString().split('T')[0]
        const response = await getInventory(currentDate)
        
        if (response && typeof response === "object") {
          const productList = Object.values(response)
            .filter(item => !item.discontinued)  // Filter out discontinued products
            .map(item => ({
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

  // Fetch sales units
  useEffect(() => {
    const fetchSalesUnits = async () => {
      if (!productId) {
        setData(prev => ({ ...prev, salesUnits: [] }))
        return
      }

      setData(prev => ({ ...prev, loading: true, error: null }))
      
      try {
        const salesUnitsData = await getSalesUnitProduct(productId)
        if (salesUnitsData && salesUnitsData.length > 0) {
          const formattedUnits = salesUnitsData.map(unit => ({
            id: unit.id.toString(),
            name: unit.name
          }))
          setData(prev => ({ ...prev, salesUnits: formattedUnits }))
        } else {
          setData(prev => ({ ...prev, salesUnits: [] }))
        }
      } catch (error) {
        console.error("Failed to fetch sales units:", error)
        setData(prev => ({ 
          ...prev, 
          salesUnits: [], 
          error: "Failed to load sales units" 
        }))
      } finally {
        setData(prev => ({ ...prev, loading: false }))
      }
    }

    fetchSalesUnits()
  }, [productId])

  return data
}

// Custom hook for business logic
const useAddInventoryLogic = (form, products) => {
  const capacityValue = form.watch("capacity")
  const isCapacityFilled = capacityValue && parseInt(capacityValue) > 0

  // Auto-set type and UOM based on product selection
  const handleProductSelect = useCallback((value) => {
    const selectedProduct = products.find(p => p.value === value)
    if (!selectedProduct) return

    // Determine type based on category
    const getTypeFromCategory = (category) => {
      const lowerCategory = category.toLowerCase()
      if (lowerCategory.includes("fuel")) return "tank"
      if (lowerCategory.includes("consumable")) return "room"
      return "other"
    }

    const type = getTypeFromCategory(selectedProduct.category)

    form.setValue("product_id", String(value))
    form.setValue("uom", selectedProduct.uom, { 
      shouldValidate: true, 
      shouldDirty: true 
    })
    form.setValue("type", type)
  }, [products, form])

  // Handle UOM change
  const handleUomChange = useCallback((value) => {
    form.setValue("uom", value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
  }, [form])

  // Reset dependent fields when capacity is cleared or changed
  useEffect(() => {
    if (!isCapacityFilled) {
      form.setValue("stock", "0")
      form.setValue("low_stock_limit", "0")
    }
  }, [isCapacityFilled, form])

  return {
    capacityValue,
    isCapacityFilled,
    handleProductSelect,
    handleUomChange: () => {} // No-op since UOM is now read-only
  }
}

// Sales units selector component
const SalesUnitsSelector = ({ 
  salesUnits, 
  selectedSalesUnits, 
  onToggle, 
  loading, 
  disabled, 
  productSelected 
}) => {
  const [openCombobox, setOpenCombobox] = useState(false)

  if (disabled) return null

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Linked Sales Units</Label>
      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCombobox}
            className="w-full justify-between"
            disabled={loading || !productSelected}
          >
            <Link className="h-4 w-4 mr-2 text-neutral-gray500" />
            {loading ? (
              "Loading sales units..."
            ) : selectedSalesUnits.length > 0 ? (
              `${selectedSalesUnits.length} units selected`
            ) : (
              "Select sales units"
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search sales units..." />
            <CommandEmpty>No sales units found.</CommandEmpty>
            <CommandGroup>
              {salesUnits.map((unit) => (
                <CommandItem
                  key={unit.id}
                  onSelect={() => onToggle(unit.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedSalesUnits.some(u => u.id === unit.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {unit.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Main add form component
export const AddInventoryForm = ({ 
  isOpen, 
  onSave, 
  onClose, 
  heading, 
  disabled = false 
}) => {
  // Form management
  const {
    form,
    formState,
    setFormState,
    watchedValues,
    isValid,
    isDirty,
    canSubmit
  } = useAddInventoryForm()

  // Data fetching
  const { products, salesUnits, loading, error } = useAddInventoryData(
    watchedValues.product_id
  )

  // Business logic
  const {
    capacityValue,
    isCapacityFilled,
    handleProductSelect,
    handleUomChange
  } = useAddInventoryLogic(form, products)

  // Sales units management
  const [selectedSalesUnits, setSelectedSalesUnits] = useState([])

  // Handle sales unit toggle
  const handleSalesUnitToggle = useCallback((unitId) => {
    setSelectedSalesUnits(prev => {
      const isSelected = prev.some(unit => unit.id === unitId)
      const unit = salesUnits.find(u => u.id === unitId)
      
      if (isSelected) {
        const newSelection = prev.filter(u => u.id !== unitId)
        form.setValue("sales_unit_id", newSelection.map(u => u.id))
        return newSelection
      } else if (unit) {
        const newSelection = [...prev, unit]
        form.setValue("sales_unit_id", newSelection.map(u => u.id))
        return newSelection
      }
      return prev
    })
  }, [salesUnits, form])

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
        sales_unit_id: selectedSalesUnits.map(unit => String(unit.id))
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
  }, [onSave, selectedSalesUnits, setFormState])

  // Handle form close
  const handleClose = useCallback(() => {
    form.reset()
    setSelectedSalesUnits([])
    setFormState(prev => ({ ...prev, error: null }))
    onClose()
  }, [form, onClose, setFormState])

  // Memoized options
  const productOptions = useMemo(() => products, [products])
  const typeOptions = useMemo(() => ALLL_TYPE_OPTIONS, [])
  const uomOptions = useMemo(() => ALLL_UOM_OPTIONS, [])

  return (
    <FormDialogWrapper
      open={isOpen}
      onClose={handleClose}
      title={heading}
      onSubmit={form.handleSubmit(handleSave)}
      submitLabel={formState.saving ? "Saving..." : "Add Inventory"}
      submitDisabled={!canSubmit}
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
              startIcon={<Package2 className="h-4 w-4 text-neutral-gray500" />}
            />

            <SelectField
              control={form.control}
              name="product_id"
              label="Product"
              placeholder="Select product"
              options={productOptions}
              required={true}
              startIcon={<PackageSearch className="h-4 w-4 text-neutral-gray500" />}
              onValueChange={handleProductSelect}
            />

            <InputTextField
              control={form.control}
              name="capacity"
              label="Capacity"
              type="number"
              placeholder="Enter maximum capacity (required first)"
              required={true}
              startIcon={<Database className="h-4 w-4 text-neutral-gray500" />}
            />

            <InputTextField
              control={form.control}
              name="stock"
              label="Initial Stock"
              type="number"
              placeholder={isCapacityFilled ? `Enter amount (max: ${capacityValue})` : "Set capacity first"}
              required={true}
              disabled={!isCapacityFilled}
              min="0"
              max={isCapacityFilled ? capacityValue : undefined}
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
              disabled={!isCapacityFilled}
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
              disabled={true} // Always disabled
              startIcon={<Scale className="h-4 w-4 text-neutral-gray500" />}
            />

            <SelectField
              control={form.control}
              name="type"
              label="Type"
              placeholder="Select storage type"
              options={typeOptions}
              required={true}
              startIcon={<Building2 className="h-4 w-4 text-neutral-gray500" />}
            />

            <SalesUnitsSelector
              salesUnits={salesUnits}
              selectedSalesUnits={selectedSalesUnits}
              onToggle={handleSalesUnitToggle}
              loading={loading}
              disabled={disabled}
              productSelected={!!watchedValues.product_id}
            />
          </div>
        </div>
      </Form>
    </FormDialogWrapper>
  )
}
