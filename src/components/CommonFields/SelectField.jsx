import { Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock } from "lucide-react";

export function SelectField({
  control,
  name,
  label,
  placeholder,
  options = [],
  disabled = false,
  readonly = false,
  required = false,
  startIcon,
  onValueChange,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray200)] flex items-center gap-1">
        {label} {required && <span className="text-[var(--danger-500)] dark:text-[var(--danger-400)]">*</span>}
        {readonly && <Lock className="w-3 h-3 text-[var(--neutral-gray500)]" />}
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
                  {options.find(opt => opt.value === field.value)?.label || placeholder}
                </span>
              </div>
            ) : (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  if (onValueChange) {
                    onValueChange(value);
                  }
                }}
                disabled={disabled}
              >
                <SelectTrigger 
                  className={`w-full bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] ${error ? "border-[var(--danger-500)] dark:border-[var(--danger-400)]" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {startIcon}
                    <SelectValue placeholder={placeholder} className="text-neutral-gray500 dark:text-[var(--neutral-gray50)]" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
                  {options.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)] hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)]"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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