import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-neutral-gray200 bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-neutral-gray500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-gray700 dark:text-neutral-gray100 dark:placeholder:text-neutral-gray400 dark:focus-visible:ring-primary-400 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
