import * as z from "zod"

// Email schema
export const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

// Login schema
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

// OTP schema
export const otpSchema = z.object({
    otp: z
      .union([
        z.string().refine((str) => /^\d{6}$/.test(str), {
          message: "OTP must be exactly 6 digits",
        }),
        z.number().refine((num) => num.toString().length === 6, {
          message: "OTP must be exactly 6 digits",
        }),
      ])
      .optional(), // Remove .optional() if OTP is required
  });

// Password reset schema
export const passwordResetSchema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Registration schema
export const registerSchema = z.object({
  organisation: z.string().min(2, { message: "Organisation name must be at least 2 characters" }),
  username: z.string().min(2, { message: "Username must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

// OTP verification schema
export const otpVerificationSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, { message: "OTP must be exactly 6 digits" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  organisation: z.string().min(1, { message: "Organisation is required" }),
})


