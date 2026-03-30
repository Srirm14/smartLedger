"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { z } from "zod"
import { Link, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { FormDialogWrapper } from "@/components/FormDialogWrapper"
import { SelectField } from "@/components/CommonFields/SelectField"
import { createZodForm } from "@/lib/utils/form-utils"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { getSalesUnitProduct } from "../api/inventoryService"

const linkSalesUnitSchema = z.object({
  sales_unit_id: z.string().min(1, "Please select a sales unit")
})

export const LinkSalesUnitForm = ({ isOpen, onClose, onConfirm, currentStockDetails }) => {
  const [salesUnits, setSalesUnits] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const form = createZodForm(linkSalesUnitSchema, {
    sales_unit_id: ""
  })

  // Watch form state for validation
  const { formState: { isValid, isDirty } } = form

  // Memoized fetch function
  const fetchSalesUnits = useCallback(async () => {
    if (currentStockDetails?.product_id) {
      setLoading(true)
      try {
        const units = await getSalesUnitProduct(currentStockDetails.product_id)
        // Filter out already linked units
        const availableUnits = units.filter(unit => 
          !currentStockDetails.sales_unit_ids?.includes(unit.id)
        )
        setSalesUnits(availableUnits.map(unit => ({
          value: unit.id.toString(),
          label: unit.name
        })))
      } catch (error) {
        setSalesUnits([])
      } finally {
        setLoading(false)
      }
    }
  }, [currentStockDetails])

  // Memoized submit handler
  const handleSubmit = useCallback(async (data) => {
    try {
      await onConfirm(data.sales_unit_id)
      form.reset()
      onClose() // Close modal after successful linking
    } catch (error) {
      // Error handling will be done by the parent component
    }
  }, [onConfirm, onClose, form])

  // Memoized navigation handler
  const handleNavigateToIslandManagement = useCallback(() => {
    onClose() // Close the current modal
    navigate('/island-management') // Navigate to island management
  }, [onClose, navigate])

  // Memoized close handler
  const handleClose = useCallback(() => {
    onClose()
    form.reset()
  }, [onClose, form])

  // Memoized form validity
  const isFormValid = useMemo(() => 
    isValid && salesUnits.length > 0, 
    [isValid, salesUnits.length]
  )

  // Memoized description
  const dialogDescription = useMemo(() => 
    salesUnits.length === 0 && !loading ? 
      "No sales units are available to link" : 
      "Select a sales unit to link with this inventory item",
    [salesUnits.length, loading]
  )

  // Memoized empty state content
  const emptyStateContent = useMemo(() => (
    <div className="py-8 text-center">
      <div className="flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <Link className="h-7 w-7 text-gray-400" />
        </div>
        <div className="space-y-3">
          <p className="text-lg font-semibold text-gray-900">No sales units available</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            All available sales units for this product are already linked.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Navigate to Island Management to create new sales units
          </p>
        </div>
        <Button
          onClick={handleNavigateToIslandManagement}
          className="mt-2 flex items-center gap-2 px-6 py-2.5"
          variant="outline"
          size="default"
        >
          <ArrowRight className="h-4 w-4" />
          Manage Islands
        </Button>
      </div>
    </div>
  ), [handleNavigateToIslandManagement])

  // Memoized form content
  const formContent = useMemo(() => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <SelectField
          control={form.control}
          name="sales_unit_id"
          label="Sales Unit"
          placeholder={loading ? "Loading..." : "Select a sales unit"}
          options={salesUnits}
          disabled={loading || salesUnits.length === 0}
          required
          startIcon={<Link className="h-4 w-4 text-neutral-gray500" />}
          emptyMessage={loading ? "Loading sales units..." : "No sales units available"}
        />
      </form>
    </Form>
  ), [form, handleSubmit, loading, salesUnits])

  // Memoized render content
  const renderFormContent = useCallback(() => {
    // Show message when no units are available
    if (!loading && salesUnits.length === 0) {
      return emptyStateContent
    }

    return formContent
  }, [loading, salesUnits.length, emptyStateContent, formContent])

  useEffect(() => {
    fetchSalesUnits()
  }, [fetchSalesUnits])

  return (
    <FormDialogWrapper
      open={isOpen}
      onClose={handleClose}
      title="Link Sales Unit"
      description={dialogDescription}
      onSubmit={form.handleSubmit(handleSubmit)}
      submitLabel="Link Unit"
      maxWidth="sm"
      isFormValid={isFormValid}
      isFormDirty={isDirty}
      isSubmitting={loading}
    >
      {renderFormContent()}
    </FormDialogWrapper>
  )
} 