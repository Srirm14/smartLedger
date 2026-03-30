"use client"

import PropTypes from "prop-types";
import { useEffect } from "react";
import { CustomFormPropTypes } from "../../../propTypes";
import { Form } from "@/components/ui/form";
import { createZodForm } from "@/lib/utils/form-utils";
import { baseCustomerSchema } from "@/lib/schemas";
import { InputTextField } from "@/components/CommonFields";
import { NumericField } from "@/components/CommonFields";
import { FormDialogWrapper } from "@/components/FormDialogWrapper";
import { User2, Mail, Phone, Wallet  } from "lucide-react";

const CustomerForm = ({ isOpen, onSave, onClose, selectedData, heading }) => {
  const form = createZodForm(baseCustomerSchema, {
    name: "",
    email: "",
    contact_phone: "",
    credit_limit: "",
  });

  useEffect(() => {
    if (selectedData) {
      form.reset({
        name: selectedData.customer_name || selectedData.name || "",
        email: selectedData.email || "",
        contact_phone: selectedData.contact_phone || "",
        credit_limit: selectedData.credit_limit || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        contact_phone: "",
        credit_limit: "",
      });
    }
  }, [selectedData, form]);

  const handleSubmit = async (data) => {
    try {
      // Only trim leading and trailing spaces, preserve spaces between words
      const formattedData = {
        ...data,
        name: data.name.trim() // Only remove leading/trailing spaces
      };
      await onSave(formattedData);
      form.reset();
    } catch (error) {
      console.error("Failed to save customer:", error);
    }
  };

  const renderFormContent = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            control={form.control}
            name="name"
            label="Customer Name"
            placeholder="Enter customer name"
            required
            startIcon={<User2 className="h-4 w-4 text-neutral-gray500" />}
          />

          <InputTextField
            control={form.control}
            name="email"
            label="Email"
            placeholder="Enter email address"
            required
            startIcon={<Mail className="h-4 w-4 text-neutral-gray500" />}
          />

          <InputTextField
            control={form.control}
            name="contact_phone"
            label="Contact Number"
            placeholder="Enter 10-digit number"
            required
            startIcon={<Phone className="h-4 w-4 text-neutral-gray500" />}
          />

          <NumericField
            control={form.control}
            name="credit_limit"
            label="Credit Limit"
            placeholder="Enter credit limit"
            min={0}
            step={0.01}
            currency
            required
            startIcon={<Wallet  className="h-4 w-4 text-neutral-gray500" />}
          />
        </div>
      </form>
    </Form>
  );

  return (
    <FormDialogWrapper
      open={isOpen}
      onClose={() => {
        onClose();
        form.reset();
      }}
      title={heading || (selectedData ? "Edit Customer" : "Add New Customer")}
      description={selectedData ? "Update customer information" : "Add a new customer to the system"}
      onSubmit={form.handleSubmit(handleSubmit)}
      submitLabel={selectedData ? "Update Customer" : "Add Customer"}
      maxWidth="xl"
      isFormValid={form.formState.isValid}
      isFormDirty={form.formState.isDirty}
      isSubmitting={form.formState.isSubmitting}
    >
      {renderFormContent()}
    </FormDialogWrapper>
  );
};

CustomerForm.propTypes = {
  ...CustomFormPropTypes,
  heading: PropTypes.string,
};

export default CustomerForm;
