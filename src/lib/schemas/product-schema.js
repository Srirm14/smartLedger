import * as z from "zod"

// Helper function to validate alphabetic strings
const alphabeticString = (fieldName) => z.string()
  .min(3, { message: `${fieldName} must be at least 3 characters long` })
  .max(15, { message: `${fieldName} must be at most 15 characters long` })
  .refine((val) => val.trim().length >= 3, { message: `${fieldName} cannot be just spaces` });

// Base schema for common inventory fields
export const baseInventorySchema = z.object({
  product: alphabeticString("Product name"),
  category: z.string()
    .min(1, { message: "Category is required" }),
  price: z.union([
    z.string()
      .min(1, { message: "Price is required" })
      .transform((val) => parseFloat(val))
      .refine((val) => !isNaN(val), { message: "Price must be a valid number" }),
    z.number()
  ])
    .transform((val) => Number(val))
    .refine((val) => val >= 1, { message: "Price must be at least ₹1" })
    .refine((val) => val <= 100000, { message: "Price cannot exceed ₹1,00,000" })
    .refine((val) => {
      const decimalPlaces = val.toString().split('.')[1]?.length || 0;
      return decimalPlaces <= 2;
    }, { message: "Price can only have up to 2 decimal places" }),
  uom: z.string()
    .min(1, { message: "UOM is required" })
})

// Schema for adding new inventory
export const addInventorySchema = baseInventorySchema

// Schema for editing inventory (only price can be modified)
export const editInventorySchema = z.object({
  product: z.string(), // Read-only, no validation needed
  category: z.string(), // Read-only, no validation needed
  price: z.union([
    z.string()
      .min(1, { message: "Price is required" })
      .transform((val) => parseFloat(val))
      .refine((val) => !isNaN(val), { message: "Price must be a valid number" }),
    z.number()
  ])
    .transform((val) => Number(val))
    .refine((val) => val >= 1, { message: "Price must be at least ₹1" })
    .refine((val) => val <= 100000, { message: "Price cannot exceed ₹1,00,000" })
    .refine((val) => {
      const decimalPlaces = val.toString().split('.')[1]?.length || 0;
      return decimalPlaces <= 2;
    }, { message: "Price can only have up to 2 decimal places" }),
  uom: z.string() // Read-only, no validation needed
}) 