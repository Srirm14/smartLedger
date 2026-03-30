import * as z from "zod"

// Base credit schema with common fields
export const baseCreditSchema = z.object({
  customer_id: z.string().or(z.number()).optional(),
  Customer_name: z.string().min(1, { message: "Customer name is required" }),
  portfolio_name: z.string().min(1, { message: "Portfolio is required" }),
  date: z.string().min(1, { message: "Transaction date is required" }),
  notes: z.string().optional(),
  products: z.array(
    z.object({
      product_name: z.string().min(1, { message: "Product name is required" }),
      quantity: z.union([
        z.string()
          .transform((val) => parseFloat(val))
          .refine((val) => !isNaN(val), { message: "Quantity must be a valid number" }),
        z.number()
      ])
        .transform((val) => Number(val))
        .refine((val) => val > 0, { message: "Quantity must be greater than 0" }),
      amount: z.union([
        z.string()
          .transform((val) => parseFloat(val))
          .refine((val) => !isNaN(val), { message: "Amount must be a valid number" }),
        z.number()
      ])
        .transform((val) => Number(val))
        .refine((val) => val > 0, { message: "Amount must be greater than 0" })
    })
  ).min(1, { message: "At least one product is required" })
})

// Schema for adding credit (borrowing)
export const addCreditSchema = baseCreditSchema.extend({
  due_date: z.string().optional(),
  interest_rate: z.union([
    z.string()
      .transform((val) => val === "" ? 0 : parseFloat(val))
      .refine((val) => !isNaN(val), { message: "Interest rate must be a valid number" }),
    z.number(),
    z.null()
  ])
    .optional()
    .nullable()
    .transform(val => val === null || val === "" ? 0 : Number(val))
    .refine((val) => val >= 0, { message: "Interest rate must be a positive number" })
})

// Schema for credit payment (repayment)
export const creditPaymentSchema = z.object({
  customer_id: z.string().or(z.number()),
  Customer_name: z.string().min(1, { message: "Customer name is required" }),
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
  payment_method: z.string().min(1, { message: "Payment method is required" }),
  reference_number: z.string().optional()
})

// Schema for credit report
export const creditReportSchema = z.object({
  start_date: z.string().min(1, { message: "Start date is required" }),
  end_date: z.string().min(1, { message: "End date is required" }),
  customer_id: z.string().or(z.number()).optional(),
  include_interest: z.boolean().optional().default(false)
}) 