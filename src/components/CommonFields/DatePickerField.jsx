import { Controller } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerField({
  control,
  name,
  label,
  placeholder = "Pick a date",
  disabled = false,
  readonly = false,
  required = false,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray200)]">
        {label} {required && <span className="text-[var(--danger-500)] dark:text-[var(--danger-400)]">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={{ required: required ? `${label} is required` : false }}
        render={({ field, fieldState: { error } }) => (
          <div className="relative w-full">
            {readonly ? (
              <div className="min-h-[2.5rem] py-2 px-3 border-b border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
                <span className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                  {field.value ? format(new Date(field.value), "PPP") : placeholder}
                </span>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    disabled={disabled}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]",
                      !field.value && "text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]",
                      error ? "border-[var(--danger-500)] dark:border-[var(--danger-400)]" : "border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]" />
                    {field.value ? (
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>{placeholder}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={field.onChange}
                    disabled={disabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
            {error && (
              <p className="text-[var(--danger-500)] dark:text-[var(--danger-400)] text-sm mt-1">{error.message}</p>
            )}
          </div>
        )}
      />
    </div>
  );
} 