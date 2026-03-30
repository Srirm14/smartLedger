import { Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

export function TextareaField({
  control,
  name,
  label,
  placeholder,
  disabled = false,
  readonly = false,
  required = false,
  rows = 3,
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
              <div className="min-h-[2.5rem] py-2 px-3 border-b border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] whitespace-pre-line">
                <span className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">{field.value || placeholder}</span>
              </div>
            ) : (
              <Textarea
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                className={`w-full ${error ? "border-[var(--danger-500)]" : ""}`}
              />
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