import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ZodSchema } from "zod";

/**
 * Create a form with Zod validation
 * @param schema The Zod schema to validate against
 * @param defaultValues The default values for the form
 * @param mode The validation mode (default: "onChange")
 * @returns A React Hook Form instance with Zod validation
 */
export function createZodForm(schema, defaultValues = {}, mode = "onChange") {
  return useForm({
    resolver: zodResolver(schema),
    mode: mode,
    defaultValues: defaultValues,
  });
}
