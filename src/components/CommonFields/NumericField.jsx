import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";

export function NumericField({
  control,
  name,
  label,
  placeholder,
  disabled = false,
  readonly = false,
  required = false,
  min,
  max,
  step = "any",
  currency = false,
  suffixIcon,
  prefixIcon,
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
        render={({ field, fieldState: { error } }) => {
          // Handle numeric conversions
          const handleChange = (e) => {
            const value = e.target.value;
            
            // Allow empty value
            if (value === "") {
              field.onChange("");
              return;
            }
            
            // Only allow numbers and decimal point
            if (/^-?\d*\.?\d*$/.test(value)) {
              field.onChange(value);
            }
          };
          
          // Format value for display (if needed for currency)
          const displayValue = field.value;
          
          return (
            <div className="relative w-full">
              {readonly ? (
                <div className="min-h-[2.5rem] py-2 px-3 border-b border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
                  <span className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                    {currency && field.value ? 
                      `₹${parseFloat(field.value).toLocaleString('en-IN')}` : 
                      (field.value || placeholder)}
                  </span>
                </div>
              ) : (
                <div className="relative">
                  {prefixIcon && (
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      {prefixIcon}
                    </div>
                  )}
                  <Input
                    {...field}
                    value={displayValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    type="text" // Use text type to handle custom numeric formatting
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                    className={`w-full ${error ? "border-[var(--danger-500)]" : ""} ${prefixIcon ? "pl-10" : ""} ${suffixIcon ? "pr-10" : ""}`}
                  />
                  {suffixIcon && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      {suffixIcon}
                    </div>
                  )}
                </div>
              )}
              {error && (
                <p className="text-[var(--danger-500)] dark:text-[var(--danger-400)] text-sm mt-1">{error.message}</p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
} 