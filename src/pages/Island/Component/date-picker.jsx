"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DatePickerWithButton({ date, setDate }) {
  const formattedDate = date.toISOString().split("T")[0];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[140px] justify-between font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(formattedDate, "yyyy-MM-dd")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={formattedDate} onSelect={(formattedDate) => formattedDate && setDate(formattedDate)} initialFocus />
      </PopoverContent>
    </Popover>
  )
}

