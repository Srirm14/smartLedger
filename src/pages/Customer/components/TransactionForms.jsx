"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import BillDateRangePicker from "./BillDateRangePicker"
import { Form } from "@/components/ui/form";
import { createZodForm } from "@/lib/utils/form-utils";
import { billSchema, paymentSchema } from "@/lib/schemas";
import { NumericField, DatePickerField, SelectField } from "@/components/CommonFields";
import { getModeList } from "@/services/apiService";
import { format } from "date-fns";




const TransactionForms = ({ onAddTransaction, existingBills = [], type = "bill", loading = false }) => {
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null })


  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    getModeList().then((response) => {
      const modesArray = Object.values(response).map(mode => ({
        value: mode.mode_name,
        label: mode.mode_name
      }));
      setPaymentMethods(modesArray);
    });
  }, []);

  const billForm = createZodForm(
    billSchema,
    {
      type: "bill",
      start_date: "",
      end_date: "",
      discount: 0,
      interest: 0,
    }
  );

  const paymentForm = createZodForm(
    paymentSchema,
    {
      type: "payment",
      date: format(new Date(), "yyyy-MM-dd"),
      method: "",
      amount: "",
      reference: "",
    }
  );

  const handlePaymentSubmit = (data) => {
    const paymentData = {
      ...data,
      createdAt: new Date(),
    }
    onAddTransaction(paymentData);
    paymentForm.reset({
      type: "payment",
      date: format(new Date(), "yyyy-MM-dd"),
      method: "",
      amount: "",
      reference: "",
    });
  }

  const handleBillSubmit = (data) => {
    const billingData = {
      ...data,
      createdAt: new Date(),
    }
    onAddTransaction(billingData);
    billForm.reset({
      type: "bill",
      start_date: "",
      end_date: "",
      discount: 0,
      interest: 0,
    });
  }

  // Update Zod form when date range changes
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range.startDate && range.endDate) {
      billForm.setValue("start_date", format(range.startDate, "yyyy-MM-dd"));
      billForm.setValue("end_date", format(range.endDate, "yyyy-MM-dd"));
    }
  }

  if (type === "bill") {
    return (
      <Form {...billForm}>
        <form id="bill-form" onSubmit={billForm.handleSubmit(handleBillSubmit)} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-gray-700">Date Range</Label>
            <BillDateRangePicker
              existingBills={existingBills}
              onDateRangeSelect={handleDateRangeChange}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <NumericField
              control={billForm.control}
              name="discount"
              label="Discount (₹)"
              placeholder="0"
              min={0}
              step="any"
              disabled={loading}
            />

            <NumericField
              control={billForm.control}
              name="interest"
              label="Interest (₹)"
              placeholder="0"
              min={0}
              step="any"
              disabled={loading}
            />
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...paymentForm}>
      <form id="payment-form" onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <NumericField
            control={paymentForm.control}
            name="amount"
            label="Amount (₹)"
            placeholder="Enter amount"
            min={0}
            step="any"
            required
            disabled={loading}
          />

          <SelectField
            control={paymentForm.control}
            name="method"
            label="Payment Method"
            placeholder="Select payment method"
            options={paymentMethods}
            required
            disabled={loading}
          />

          <DatePickerField
            control={paymentForm.control}
            name="date"
            label="Payment Date"
            required
            disabled={loading}
          />

          <NumericField
            control={paymentForm.control}
            name="reference"
            label="Reference"
            placeholder="Transaction ID, Cheque Number, etc."
            required
            disabled={loading}
          />
        </div>
      </form>
    </Form>
  );
}

export default TransactionForms 