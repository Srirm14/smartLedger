import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border border-neutral-gray200 px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-neutral-gray900 [&>svg~*]:pl-7 dark:border-neutral-gray700 dark:[&>svg]:text-neutral-gray100",
  {
    variants: {
      variant: {
        default: "bg-neutral-white text-neutral-gray900 dark:bg-neutral-gray900 dark:text-neutral-gray100",
        destructive:
          "border-danger-500/50 text-danger-500 dark:border-danger-600/50 dark:text-danger-400 [&>svg]:text-danger-500 dark:[&>svg]:text-danger-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight text-neutral-gray900 dark:text-neutral-gray100", className)}
    {...props} />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-neutral-gray500 dark:text-neutral-gray400 [&_p]:leading-relaxed", className)}
    {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
