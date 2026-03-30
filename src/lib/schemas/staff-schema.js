import * as z from "zod"
import { STAFF_ROLES, STAFF_STATUS } from "@/pages/Staff/components/Constants"

// Base staff schema with common fields
export const baseStaffSchema = z.object({
  name: z.string()
    .min(1, { message: "Staff name is required" })
    .max(50, { message: "Staff name must be at most 50 characters" })
    .regex(/^[A-Za-z\s]+$/, { message: "Staff name must contain only alphabets" }),
  employee_id: z.string()
    .min(1, { message: "Employee ID is required" }),
  role: z.enum([STAFF_ROLES.CASHIER, STAFF_ROLES.PUMPBOY], {
    required_error: "Role is required",
    invalid_type_error: "Role must be either Cashier or Pumpboy"
  }),
  contact_number: z.string()
    .regex(/^[0-9]{10}$/, { message: "Enter Valid Contact Number without Country Code" })
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .optional()
    .or(z.literal('')),
  salary: z.union([
    z.string()
      .transform((val) => parseFloat(val))
      .refine((val) => !isNaN(val), { message: "Salary must be a valid number" })
      .refine((val) => Number.isInteger(val), { message: "Salary must be an integer" })
      .refine((val) => val <= 10000000, { message: "Salary cannot exceed 1 crore" }),
    z.number()
      .refine((val) => Number.isInteger(val), { message: "Salary must be an integer" })
      .refine((val) => val <= 10000000, { message: "Salary cannot exceed 1 crore" }),
    z.null()
  ])
    .optional()
    .nullable()
    .transform(val => val === null ? 0 : Number(val))
})

// Schema for adding a new staff
export const addStaffSchema = baseStaffSchema

// Schema for editing a staff
export const editStaffSchema = baseStaffSchema.extend({
  id: z.string().or(z.number())
})

// Enhanced schema for employee action dialog with strict validation
export const employeeActionSchema = z.object({
  employee_id: z
    .string()
    .min(1, "Employee ID is required")
    .regex(/^[a-zA-Z0-9]+$/, "Employee ID must contain only letters and numbers"),
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(15, "Name must not exceed 15 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces"),
  role: z.string().min(1, "Role is required"),
  contact_number: z
    .string()
    .min(1, "Contact number is required")
    .regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  salary: z
    .string()
    .min(1, "Salary is required")
    .regex(/^\d+$/, "Salary must be a positive number")
    .refine((val) => parseInt(val) > 0, "Salary must be greater than 0")
})

// Schema for staff attendance
export const staffAttendanceSchema = z.object({
  employee_id: z.string().or(z.number()),
  date: z.string().min(1, { message: "Date is required" }),
  status: z.enum(Object.values(STAFF_STATUS)),
  notes: z.string().optional()
}) 