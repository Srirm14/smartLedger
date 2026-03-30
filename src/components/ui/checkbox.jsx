import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-[var(--neutral-gray200)] border-[var(--neutral-gray900)] shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--neutral-gray900)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--primary-500)] data-[state=checked]:text-[var(--neutral-white)] dark:border-[var(--neutral-gray700)] dark:focus-visible:ring-[var(--neutral-gray300)] dark:data-[state=checked]:bg-[var(--primary-400)] dark:data-[state=checked]:text-[var(--neutral-white)]",
      className
    )}
    {...props}>
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
