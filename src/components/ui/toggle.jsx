"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-gray100 hover:text-neutral-gray500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-neutral-gray100 data-[state=on]:text-neutral-gray900 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:hover:bg-neutral-gray800 dark:hover:text-neutral-gray400 dark:focus-visible:ring-primary-400 dark:data-[state=on]:bg-neutral-gray800 dark:data-[state=on]:text-neutral-gray100",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-neutral-gray200 bg-transparent shadow-sm hover:bg-neutral-gray100 hover:text-neutral-gray900 dark:border-neutral-gray700 dark:hover:bg-neutral-gray800 dark:hover:text-neutral-gray100",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props} />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
