"use client"

import React, { useEffect, useCallback, useMemo } from "react"
import { FormDialogWrapper } from "@/components/FormDialogWrapper"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { InputTextField } from "@/components/CommonFields/InputTextField"
import { SelectField } from "@/components/CommonFields/SelectField"
import { UserIcon, BriefcaseIcon, PhoneIcon, MailIcon, IndianRupeeIcon, Hash } from "lucide-react"
import { ROLE_OPTIONS } from "./components/Constants"
import WarningPrompt from "@/components/WarningPrompt"
import { employeeActionSchema } from "@/lib/schemas/staff-schema"

export const EmployeeActionDialog = ({ action, employee, onClose, onConfirm }) => {
  // Store original values for proper dirty checking
  const originalValues = useMemo(() => {
    if (action === "edit" && employee) {
      return {
        employee_id: employee.employee_id || "",
        name: employee.name || "",
        role: employee.role || "",
        contact_number: employee.contact_number?.toString() || "",
        email: employee.email || "",
        salary: employee.salary?.toString() || ""
      };
    }
    return {
      employee_id: "",
      name: "",
      role: "",
      contact_number: "",
      email: "",
      salary: ""
    };
  }, [employee, action]);

  const form = useForm({
    resolver: zodResolver(employeeActionSchema),
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
    if (!employee) return false;
    
    return Object.keys(originalValues).some(key => {
      const currentValue = currentValues[key];
      const originalValue = originalValues[key];
      
      // Handle string comparison with null/undefined safety
      const currentStr = String(currentValue || "");
      const originalStr = String(originalValue || "");
      return currentStr !== originalStr;
    });
  }, [currentValues, originalValues, action, employee]);

  const shouldEnableSubmitButton = isActuallyDirty && isValid;

  useEffect(() => {
    if (employee && action === "edit") {
      // Only reset if the form values don't match the employee (prevents unnecessary resets)
      const currentFormValues = form.getValues();
      const needsReset = Object.keys(originalValues).some(key => currentFormValues[key] !== originalValues[key]);
      
      if (needsReset) {
        form.reset(originalValues);
      }
    }
  }, [employee, form, action, originalValues]);

  const handleSave = useCallback(async (data) => {
    try {
      // Ensure id is included for updates
      if (action === "edit" && employee?.id) {
        data.id = employee.id
      }
      onConfirm(data)
    } catch (error) {
      console.error("Failed to save employee:", error)
    }
  }, [action, employee?.id, onConfirm]);

  const roleOptions = useMemo(() => 
    ROLE_OPTIONS.map(role => ({
      value: role.value,
      label: role.text
    })), 
    []
  );

  const renderFormContent = useCallback(() => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            control={form.control}
            name="employee_id"
            label="Employee ID"
            placeholder="Enter alphanumeric ID"
            required={true}
            startIcon={<Hash className="h-4 w-4 text-neutral-gray500" />}
          />

          <InputTextField
            control={form.control}
            name="name"
            label="Employee Name"
            placeholder="Enter name (3-15 chars)"
            required={true}
            startIcon={<UserIcon className="h-4 w-4 text-neutral-gray500" />}
          />

          <SelectField
            control={form.control}
            name="role"
            label="Role"
            placeholder="Select role"
            options={roleOptions}
            required={true}
            startIcon={<BriefcaseIcon className="h-4 w-4 text-neutral-gray500" />}
          />

          <InputTextField
            control={form.control}
            name="contact_number"
            label="Contact Number"
            placeholder="Enter 10-digit number"
            required={true}
            startIcon={<PhoneIcon className="h-4 w-4 text-neutral-gray500" />}
          />

          <InputTextField
            control={form.control}
            name="email"
            label="Email"
            placeholder="Enter email address"
            type="email"
            required={true}
            startIcon={<MailIcon className="h-4 w-4 text-neutral-gray500" />}
          />

          <InputTextField
            control={form.control}
            name="salary"
            label="Salary"
            placeholder="Enter positive amount"
            type="number"
            required={true}
            startIcon={<IndianRupeeIcon className="h-4 w-4 text-neutral-gray500" />}
          />
        </div>
      </form>
    </Form>
  ), [form, handleSave, roleOptions]);

  const handleDelete = useCallback(() => {
    onConfirm(employee);
  }, [onConfirm, employee]);

  if (action === "delete") {
    return (
      <WarningPrompt
        open={true}
        onOpenChange={onClose}
        title="Delete Employee"
        description={
          <>
            Are you sure you want to delete <b>{employee?.name}</b>? This action cannot be undone.
          </>
        }
        actionText="DELETE"
        onAction={handleDelete}
        onCancel={onClose}
        variant="danger"
      />
    );
  }

  return (
    <FormDialogWrapper
      open={true}
      onClose={onClose}
      title={action === "edit" ? "Edit Employee" : "Add New Employee"}
      onSubmit={form.handleSubmit(handleSave)}
      submitLabel={action === "edit" ? "Save Changes" : "Add Employee"}
      submitDisabled={false}
      isFormValid={isValid}
      isFormDirty={isActuallyDirty}
      maxWidth="xl"
    >
      {renderFormContent()}
    </FormDialogWrapper>
  )
}

export default EmployeeActionDialog
