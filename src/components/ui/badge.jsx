import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-gray900 focus:ring-offset-2 dark:focus:ring-neutral-gray100",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--primary-600)] text-[var(--neutral-white)] shadow hover:bg-[var(--primary-500)] dark:bg-[var(--primary-500)] dark:hover:bg-[var(--primary-400)]",
        secondary:
          "border-[var(--neutral-gray900)] bg-[var(--neutral-gray100)] text-[var(--neutral-gray900)] hover:bg-[var(--neutral-gray200)] dark:border-[var(--neutral-gray100)] dark:bg-[var(--neutral-gray800)] dark:text-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray700)]",
        destructive:
          "border-transparent bg-[var(--danger-100)] text-[var(--danger-600)] shadow hover:bg-[var(--danger-200)] dark:bg-[var(--danger-900)] dark:text-[var(--danger-400)] dark:hover:bg-[var(--danger-800)]",
        success:
          "border-transparent bg-[var(--success-100)] text-[var(--success-600)] shadow hover:bg-[var(--success-200)] dark:bg-[var(--success-900)] dark:text-[var(--success-400)] dark:hover:bg-[var(--success-800)]",
        warning:
          "border-transparent bg-[var(--warning-100)] text-[var(--warning-600)] shadow hover:bg-[var(--warning-200)] dark:bg-[var(--warning-900)] dark:text-[var(--warning-400)] dark:hover:bg-[var(--warning-800)]",
        outline: "border-[var(--neutral-gray200)] text-[var(--neutral-gray900)] dark:border-[var(--neutral-gray700)] dark:text-[var(--neutral-gray100)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
