"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { FormDialogWrapper } from "@/components/FormDialogWrapper"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Barcode, CalendarDays, IndianRupee, Package2, FileText, Truck, Hash } from "lucide-react"
import { InputTextField } from "@/components/CommonFields/InputTextField"
import { DatePickerField } from "@/components/CommonFields/DatePickerField"
import { TextareaField } from "@/components/CommonFields/TextareaField"
import { createZodForm } from "@/lib/utils/form-utils"
import { Form } from "@/components/ui/form"
import { addStockSchema } from "@/lib/schemas/inventory-schema"

export const AddStockForm = ({ isOpen, onSave, onClose, inventory, heading, selectedData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUserMadeChanges, setHasUserMadeChanges] = useState(false)
  
  // Create form with empty initial values
  const form = createZodForm(addStockSchema, {
    transaction_id: "",
    quantity: "",
    amount: "",
    date: new Date(),
    source: "",
    reference: "",
    notes: ""
  }, "onChange")

  // Watch form state for validation and dirty checking
  const { formState: { isValid, isDirty, errors }, watch } = form

  // Reset hasUserMadeChanges when modal opens/closes or selectedData changes
  useEffect(() => {
    setHasUserMadeChanges(false)
  }, [isOpen, selectedData])

  // Watch for actual user changes (not initial data loading)
  useEffect(() => {
    if (isDirty && isOpen) {
      setHasUserMadeChanges(true)
    }
  }, [isDirty, isOpen])

  // Handle form reset when selectedData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedData) {
        // Edit mode - populate with existing data
        form.reset({
          transaction_id: selectedData.transaction_id || "",
          quantity: selectedData.quantity?.toString() || "",
          amount: selectedData.amount?.toString() || "",
          date: selectedData.date ? new Date(selectedData.date) : new Date(),
          source: selectedData.source || "",
          reference: selectedData.reference || "",
          notes: selectedData.notes || ""
        }, { keepDefaultValues: false })
      } else {
        // Add mode - reset to empty values
        form.reset({
          transaction_id: "",
          quantity: "",
          amount: "",
          date: new Date(),
          source: "",
          reference: "",
          notes: ""
        }, { keepDefaultValues: false })
      }
      setHasUserMadeChanges(false)
    }
  }, [isOpen, selectedData, form])

  const handleSave = async (data) => {
    if (!isValid || !hasUserMadeChanges) {
      return
    }

    try {
      setIsSubmitting(true)
      const formattedData = {
        stock_id: inventory?.id || 0,
        transaction_type: "inbound",
        ...data,
        quantity: Number(data.quantity),
        amount: Number(data.amount),
        date: format(data.date, "yyyy-MM-dd")
      }
      await onSave(formattedData)
    } catch (error) {
      console.error("Failed to add stock:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderFormContent = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            control={form.control}
            name="transaction_id"
            label="Reference Number"
            placeholder="Enter reference number"
            required
            startIcon={<Barcode className="h-4 w-4 text-neutral-gray500" />}
          />

          <InputTextField
            control={form.control}
            name="quantity"
            label={`Quantity (${inventory?.uom || "units"})`}
            placeholder="Enter quantity"
            type="number"
            required
            startIcon={<Package2 className="h-4 w-4 text-neutral-gray500" />}
          />

          <InputTextField
            control={form.control}
            name="amount"
            label="Amount"
            placeholder="Enter amount"
            type="number"
            required
            startIcon={<IndianRupee className="h-4 w-4 text-neutral-gray500" />}
          />

          <DatePickerField
            control={form.control}
            name="date"
            label="Date"
            required
          />
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="advanced-fields">
            <AccordionTrigger>Advanced Fields</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <InputTextField
                  control={form.control}
                  name="source"
                  label="Source"
                  placeholder="Supplier/Manufacturer"
                  startIcon={<Truck className="h-4 w-4 text-neutral-gray500" />}
                />

                <InputTextField
                  control={form.control}
                  name="reference"
                  label="Additional Reference"
                  placeholder="PO/Reference number"
                  startIcon={<Hash className="h-4 w-4 text-neutral-gray500" />}
                />

                <div className="col-span-1 md:col-span-2">
                  <TextareaField
                    control={form.control}
                    name="notes"
                    label="Notes"
                    placeholder="Additional notes"
                    rows={4}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </Form>
  )

  return (
    <FormDialogWrapper
      open={isOpen}
      onClose={onClose}
      title={heading}
      onSubmit={form.handleSubmit(handleSave)}
      submitLabel="Add Stock"
      maxWidth="xl"
      isSubmitting={isSubmitting}
      isFormValid={isValid}
      isFormDirty={hasUserMadeChanges}
    >
      {renderFormContent()}
    </FormDialogWrapper>
  )
}
