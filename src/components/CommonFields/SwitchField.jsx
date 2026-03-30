import { Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";

export function SwitchField({
  control,
  name,
  label,
  description,
  disabled = false,
  readonly = false,
  required = false,
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Controller
          name={name}
          control={control}
          rules={{ required: required ? `${label} is required` : false }}
          render={({ field, fieldState: { error } }) => (
            <>
              {readonly ? (
                <div className={`h-6 w-11 rounded-full ${field.value ? 'bg-[var(--primary-500)]' : 'bg-[var(--neutral-gray200)] dark:bg-[var(--neutral-gray700)]'} pointer-events-none`}>
                  <div className={`h-5 w-5 rounded-full bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray50)] transform ${field.value ? 'translate-x-6' : 'translate-x-1'} mt-0.5`} />
                </div>
              ) : (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              )}
            </>
          )}
        />
        <div className="grid gap-0.5">
          <label className="text-sm font-medium text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray200)]">
            {label} {required && <span className="text-[var(--danger-500)] dark:text-[var(--danger-400)]">*</span>}
          </label>
          {description && <p className="text-xs text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]">{description}</p>}
        </div>
      </div>
      <Controller
        name={name}
        control={control}
        render={({ fieldState: { error } }) => (
          <>
            {error && (
              <p className="text-[var(--danger-500)] dark:text-[var(--danger-400)] text-sm mt-1">{error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
} 