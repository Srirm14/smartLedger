import * as z from "zod"

// Base customer schema with common fields
export const baseCustomerSchema = z.object({
  name: z.string()
    .min(1, { message: "Customer name is required" })
    .max(50, { message: "Customer name must be at most 50 characters" })
    .transform(val => val.trim().replace(/\s+/g, ' ')) // Convert multiple spaces to single space
    .refine(
      val => /^[a-zA-Z0-9\s\-_&.,()]+$/.test(val),
      { message: "Customer name can only contain letters, numbers, spaces, and basic punctuation (-_&.,())" }
    )
    .refine(
      val => !/^\s+$/.test(val),
      { message: "Customer name cannot be just spaces" }
    )
    .refine(
      val => !/^[^a-zA-Z0-9]+$/.test(val),
      { message: "Customer name must contain at least one letter or number" }
    ),
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .min(1, { message: "Email is required" }),
  contact_phone: z.string()
    .regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits" })
    .min(1, { message: "Contact number is required" }),
  credit_limit: z.union([
    z.string()
      .transform((val) => parseFloat(val))
      .refine((val) => !isNaN(val), { message: "Credit limit must be a valid number" })
      .refine((val) => /^\d+(\.\d{0,2})?$/.test(val.toString()), { message: "Credit limit can have maximum 2 decimal places" }),
    z.number()
      .refine((val) => /^\d+(\.\d{0,2})?$/.test(val.toString()), { message: "Credit limit can have maximum 2 decimal places" }),
    z.null()
  ])
    .optional()
    .nullable()
    .transform(val => val === null || val === "" ? 0 : Number(val))
})

// Schema for adding a new customer
export const addCustomerSchema = baseCustomerSchema

// Schema for editing a customer
export const editCustomerSchema = baseCustomerSchema.extend({
  id: z.string().or(z.number())
})

// Schema for customer credit report
export const customerCreditReportSchema = z.object({
  customer_id: z.string().or(z.number()),
  start_date: z.string().min(1, { message: "Start date is required" }),
  end_date: z.string().min(1, { message: "End date is required" }),
  interest: z.number().optional().default(0)
}) 