import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

export function InputTextField({
  control,
  name,
  label,
  placeholder,
  type = "text",
  disabled = false,
  readonly = false,
  required = false,
  suffixIcon,
  startIcon,
}) {
  const isNumberType = type === "number";

  const handleKeyDown = (e) => {
    if (isNumberType && (e.key === "-" || e.key === "e")) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    if (isNumberType) {
      const pastedText = e.clipboardData.getData('text');
      if (pastedText.includes('-') || Number(pastedText) < 0) {
        e.preventDefault();
      }
    }
  };

  const handleChange = (e, field) => {
    const value = e.target.value;
    if (isNumberType) {
      const num = Number(value);
      if (!isNaN(num) && num >= 0) {
        field.onChange(value);
      }
    } else {
      field.onChange(value);
    }
  };

  const renderInput = (field, error) => (
    <div className="relative flex items-center">
      {startIcon && (
        <div className="absolute left-3 flex items-center pointer-events-none">
          {startIcon}
        </div>
      )}
      <Input
        {...field}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        className={`w-full ${error ? "border-[var(--danger-500)]" : ""} ${startIcon ? "pl-10" : ""} ${suffixIcon ? "pr-10" : ""}`}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={(e) => handleChange(e, field)}
        min={isNumberType ? 0 : undefined}
      />
      {suffixIcon && (
        <div className="absolute right-3 flex items-center">
          {suffixIcon}
        </div>
      )}
    </div>
  );

  const renderReadOnly = (field) => (
    <div className="min-h-[2.5rem] py-2 px-3 border-b border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] flex items-center">
      {startIcon && (
        <div className="mr-3 flex items-center pointer-events-none">
          {startIcon}
        </div>
      )}
      <span className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">{field.value || placeholder}</span>
    </div>
  );

  return (
    <div className="space-y-2 w-full">
      <label className="block text-sm font-medium text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray200)] flex items-center gap-1">
        {label} {required && <span className="text-[var(--danger-500)] dark:text-[var(--danger-400)]">*</span>}
        {readonly && <Lock className="w-3 h-3 text-[var(--neutral-gray500)]" />}
      </label>
      <Controller
        name={name}
        control={control}
        rules={{ required: required ? `${label} is required` : false }}
        render={({ field, fieldState: { error } }) => (
          <>
            <div className="relative w-full">
              {readonly ? renderReadOnly(field) : renderInput(field, error)}
            </div>
            {error && (
              <p className="text-[var(--danger-500)] dark:text-[var(--danger-400)] text-sm mt-1">{error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
}
