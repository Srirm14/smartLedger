import { z } from "zod";

/**
 * Payment Transaction Schema
 * Validates payment transaction information
 */
export const paymentSchema = z.object({
  type: z.literal("payment"),
  date: z.union([
    z.string(),
    z.date()
  ]).transform(val => val instanceof Date ? val.toISOString().split('T')[0] : val),
  method: z.string().min(1, "Payment method is required"),
  amount: z.union([
    z.number().positive("Amount must be positive"),
    z.string().transform((val) => val === "" ? 0 : Number(val))
  ]).refine((val) => val > 0, { message: "Amount must be greater than 0" }),
  reference: z.string().min(1, "Reference is required"),
});

/**
 * Bill Transaction Schema
 * Validates bill transaction information
 */
export const billSchema = z.object({
  type: z.literal("bill"),
  start_date: z.union([
    z.string(),
    z.date()
  ]).transform(val => val instanceof Date ? val.toISOString().split('T')[0] : val),
  end_date: z.union([
    z.string(),
    z.date()
  ]).transform(val => val instanceof Date ? val.toISOString().split('T')[0] : val),
  discount: z.union([
    z.number(),
    z.string().transform((val) => val === "" ? 0 : Number(val))
  ]).default(0),
  interest: z.union([
    z.number(),
    z.string().transform((val) => val === "" ? 0 : Number(val))
  ]).default(0),
});

/**
 * Combined Transaction Schema
 * Used for validating either payment or bill transactions
 */
export const transactionSchema = z.discriminatedUnion("type", [
  paymentSchema,
  billSchema
]); 