import * as z from "zod"

// Base schema without stock field (for editing)
export const baseInventorySchema = z.object({
  stock_name: z
    .string()
    .min(3, "Stock name must be at least 3 characters")
    .max(15, "Stock name must not exceed 15 characters")
    .regex(/^[a-zA-Z0-9\s]+$/, "Stock name must contain only letters, numbers, and spaces"),
  
  product_id: z
    .string()
    .min(1, "Product is required"),
  
  uom: z
    .string()
    .min(1, "Unit of measurement is required"),
  
  capacity: z
    .string()
    .min(1, "Capacity is required")
    .regex(/^\d+$/, "Capacity must be a positive number")
    .refine((val) => parseInt(val) > 0, "Capacity must be greater than 0")
    .refine((val) => parseInt(val) <= 1000000, "Capacity cannot exceed 1,000,000"),
  
  type: z
    .string()
    .min(1, "Type is required"),
  
  low_stock_limit: z
    .string()
    .min(1, "Low stock limit is required")
    .regex(/^\d+$/, "Low stock limit must be a positive number")
    .refine((val) => parseInt(val) > 0, "Low stock limit must be greater than 0")
    .refine((val) => parseInt(val) <= 100000, "Low stock limit cannot exceed 100,000")
})

// Schema for adding inventory (includes stock field and sales units)
export const addInventorySchema = baseInventorySchema.extend({
  stock: z
    .string()
    .min(1, "Initial stock is required")
    .regex(/^\d+$/, "Initial stock must be a positive number")
    .refine((val) => parseInt(val) >= 0, "Initial stock cannot be negative")
    .refine((val) => parseInt(val) <= 1000000, "Initial stock cannot exceed 1,000,000"),
  
  sales_unit_id: z
    .array(z.string())
    .optional()
    .default([])
})

// Schema for editing inventory (includes stock field for backend compatibility)
export const editInventorySchema = baseInventorySchema.extend({
  id: z.string().or(z.number()),
  stock: z
    .string()
    .min(1, "Stock is required")
    .regex(/^\d+$/, "Stock must be a positive number")
    .refine((val) => parseInt(val) >= 0, "Stock cannot be negative")
    .refine((val) => parseInt(val) <= 1000000, "Stock cannot exceed 1,000,000"),
})

// Schema validation with cross-field validation for add mode
export const addInventorySchemaWithRefinement = addInventorySchema
  .refine(
    (data) => {
      const capacity = parseInt(data.capacity);
      const initialStock = parseInt(data.stock);
      
      // Only validate if capacity is provided
      if (!capacity || capacity <= 0) {
        return true; // Skip validation if capacity is not set
      }
      
      // Initial stock should not exceed capacity
      return initialStock <= capacity;
    },
    {
      message: "Initial stock cannot exceed capacity",
      path: ["stock"] // Show error on the stock field
    }
  )
  .refine(
    (data) => {
      const capacity = parseInt(data.capacity);
      const lowStockLimit = parseInt(data.low_stock_limit);
      
      // Only validate if capacity is provided
      if (!capacity || capacity <= 0) {
        return true; // Skip validation if capacity is not set
      }
      
      // Low stock limit should not exceed capacity
      return lowStockLimit <= capacity;
    },
    {
      message: "Low stock limit cannot exceed capacity",
      path: ["low_stock_limit"] // Show error on the low_stock_limit field
    }
  )

// Schema validation with cross-field validation for edit mode
export const editInventorySchemaWithRefinement = editInventorySchema
  .refine(
    (data) => {
      const capacity = parseInt(data.capacity);
      const lowStockLimit = parseInt(data.low_stock_limit);
      
      // Only validate if capacity is provided
      if (!capacity || capacity <= 0) {
        return true; // Skip validation if capacity is not set
      }
      
      // Low stock limit should not exceed capacity
      return lowStockLimit <= capacity;
    },
    {
      message: "Low stock limit cannot exceed capacity",
      path: ["low_stock_limit"] // Show error on the low_stock_limit field
    }
  )
  .refine(
    (data) => {
      const capacity = parseInt(data.capacity);
      const stock = parseInt(data.stock);
      
      // Only validate if capacity is provided
      if (!capacity || capacity <= 0) {
        return true; // Skip validation if capacity is not set
      }
      
      // Stock should not exceed capacity
      return stock <= capacity;
    },
    {
      message: "Stock cannot exceed capacity",
      path: ["stock"] // Show error on the stock field
    }
  )

// Schema for adding stock transactions
export const addStockSchema = z.object({
  transaction_id: z.string().min(1, "Reference number is required"),
  quantity: z.string().min(1, "Quantity is required"),
  amount: z.string()
    .min(1, "Amount is required")
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val), { message: "Amount must be a valid number" })
    .refine((val) => val >= 1, { message: "Amount must be at least ₹1" }),
  date: z.date({
    required_error: "Date is required",
    invalid_type_error: "That's not a date!",
  }),
  source: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional()
})

// Schema for tracking sales transactions
export const trackSalesSchema = z.object({
  transaction_id: z.string().min(1, "Reference number is required"),
  quantity: z.string().min(1, "Quantity is required"),
  amount: z.string()
    .min(1, "Amount is required")
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val), { message: "Amount must be a valid number" })
    .refine((val) => val >= 1, { message: "Amount must be at least ₹1" }),
  date: z.date({
    required_error: "Date is required",
    invalid_type_error: "That's not a date!",
  }),
  salesUnit: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional()
}) 