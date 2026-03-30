import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors transition-transform duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--neutral-gray900)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-[var(--neutral-gray100)]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary-600)] text-[var(--neutral-white)] shadow hover:bg-[var(--primary-500)] active:bg-[var(--primary-700)] hover:scale-105 active:scale-95 dark:bg-[var(--primary-500)] dark:hover:bg-[var(--primary-400)] dark:active:bg-[var(--primary-700)]",
        destructive:
          "bg-[var(--danger-500)] text-[var(--neutral-white)] shadow-sm hover:bg-[var(--danger-400)] active:bg-[var(--danger-700)] hover:scale-105 active:scale-95 dark:bg-[var(--danger-600)] dark:hover:bg-[var(--danger-500)] dark:active:bg-[var(--danger-800)]",
        outline:
          "border border-[var(--neutral-gray200)] bg-[var(--neutral-white)] shadow-sm hover:bg-[var(--neutral-gray100)] hover:text-[var(--neutral-gray900)] active:bg-[var(--neutral-gray300)] active:text-[var(--neutral-gray900)] hover:scale-105 active:scale-95 dark:border-[var(--neutral-gray700)] dark:bg-[var(--neutral-gray900)] dark:text-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)] dark:hover:text-[var(--neutral-gray100)] dark:active:bg-[var(--neutral-gray800)] dark:active:text-[var(--neutral-gray100)]",
        secondary:
          "bg-[var(--neutral-gray100)] text-[var(--neutral-gray900)] shadow-sm hover:bg-[var(--neutral-gray200)] active:bg-[var(--neutral-gray400)] active:text-[var(--neutral-gray900)] hover:scale-105 active:scale-95 dark:bg-[var(--neutral-gray800)] dark:hover:bg-[var(--neutral-gray700)] dark:active:bg-[var(--neutral-gray600)] dark:text-[var(--neutral-gray100)] dark:active:text-[var(--neutral-gray100)]",
        ghost: "hover:bg-[var(--neutral-gray100)] hover:text-[var(--neutral-gray900)] active:bg-[var(--neutral-gray200)] active:text-[var(--neutral-gray900)] hover:scale-105 active:scale-95 dark:hover:bg-[var(--neutral-gray800)] dark:hover:text-[var(--neutral-gray100)] dark:active:bg-[var(--neutral-gray700)] dark:active:text-[var(--neutral-gray100)]",
        link: "text-[var(--primary-600)] underline-offset-4 hover:underline active:text-[var(--primary-700)] active:underline hover:scale-105 active:scale-95 dark:text-[var(--primary-400)] dark:active:text-[var(--primary-300)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
