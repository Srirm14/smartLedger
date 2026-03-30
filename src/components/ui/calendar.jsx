import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    (<DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray200)] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)] rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[var(--neutral-gray100)] dark:[&:has([aria-selected])]:bg-[var(--neutral-gray800)] [&:has([aria-selected].day-outside)]:bg-[var(--neutral-gray100)]/50 dark:[&:has([aria-selected].day-outside)]:bg-[var(--neutral-gray800)]/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-[var(--primary-500)] text-[var(--neutral-white)] hover:bg-[var(--primary-600)] hover:text-[var(--neutral-white)] focus:bg-[var(--primary-600)] focus:text-[var(--neutral-white)] dark:bg-[var(--primary-400)] dark:text-[var(--neutral-white)] dark:hover:bg-[var(--primary-300)] dark:hover:text-[var(--neutral-white)] dark:focus:bg-[var(--primary-300)] dark:focus:text-[var(--neutral-white)]",
        day_today: "bg-[var(--neutral-gray100)] text-[var(--neutral-gray900)] dark:bg-[var(--neutral-gray800)] dark:text-[var(--neutral-gray50)]",
        day_outside:
          "day-outside text-[var(--neutral-gray500)] aria-selected:bg-[var(--neutral-gray100)]/50 aria-selected:text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)] dark:aria-selected:bg-[var(--neutral-gray800)]/50 dark:aria-selected:text-[var(--neutral-gray400)]",
        day_disabled: "text-[var(--neutral-gray500)] opacity-50 dark:text-[var(--neutral-gray400)]",
        day_range_middle:
          "aria-selected:bg-[var(--neutral-gray100)] aria-selected:text-[var(--neutral-gray900)] dark:aria-selected:bg-[var(--neutral-gray800)] dark:aria-selected:text-[var(--neutral-gray50)]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4 text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4 text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]", className)} {...props} />
        ),
      }}
      {...props} />)
  );
}
Calendar.displayName = "Calendar"

export { Calendar }
