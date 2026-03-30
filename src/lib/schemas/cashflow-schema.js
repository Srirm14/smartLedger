import * as z from "zod"

// Base cashflow schema with common fields
export const baseCashflowSchema = z.object({
  amount: z.union([
    z.string()
      .transform((val) => parseFloat(val))
      .refine((val) => !isNaN(val), { message: "Amount must be a valid number" }),
    z.number()
  ])
    .transform((val) => Number(val))
    .refine((val) => val > 0, { message: "Amount must be greater than 0" })
    .refine((val) => {
      const decimalPlaces = val.toString().split('.')[1]?.length || 0;
      return decimalPlaces <= 2;
    }, { message: "Amount can only have up to 2 decimal places" }),
  transaction_date: z.string().min(1, { message: "Transaction date is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().optional(),
  payment_method: z.string().min(1, { message: "Payment method is required" })
})

// Schema for adding income
export const addIncomeSchema = baseCashflowSchema.extend({
  source: z.string().min(1, { message: "Source is required" }),
  reference_number: z.string().optional()
})

// Schema for adding expense
export const addExpenseSchema = baseCashflowSchema.extend({
  vendor: z.string().optional(),
  receipt_image: z.any().optional() // File upload
})

// Schema for cashflow report
export const cashflowReportSchema = z.object({
  start_date: z.string().min(1, { message: "Start date is required" }),
  end_date: z.string().min(1, { message: "End date is required" }),
  category: z.string().optional(),
  payment_method: z.string().optional(),
  type: z.enum(["all", "income", "expense"]).default("all")
}) 