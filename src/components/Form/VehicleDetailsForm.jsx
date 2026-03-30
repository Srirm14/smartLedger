import { useEffect } from "react";
import { CustomDetailsFormPropTypes } from "../../../propTypes";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { InputTextField } from "@/components/CommonFields";
import { createZodForm } from "@/lib/utils/form-utils";
import { editVehicleSchema } from "@/lib/schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const VehicleDetailsForm = ({
  isOpen,
  onSave,
  onClose,
  selectedData,
  loading,
}) => {
  const vehicleTypes = [
    { value: "petrol", label: "Petrol" },
    { value: "diesel", label: "Diesel" },
    { value: "gas", label: "Gas" },
    { value: "others", label: "Others" },
  ];

  // Initialize form with Zod schema validation
  const form = createZodForm(
    editVehicleSchema,
    {
      id: selectedData?.id || Math.floor(Math.random() * 1000) + 1,
      vehicle_no: selectedData?.vehicle_no || "",
      type: selectedData?.type || "",
    },
    {
      mode: "onChange", // Validate on change for real-time feedback
      reValidateMode: "onChange"
    }
  );

  // Reset form when selected data changes
  useEffect(() => {
    if (selectedData) {
      form.reset({
        id: selectedData.id,
        vehicle_no: selectedData.vehicle_no,
        type: selectedData.type,
      });
    } else {
      form.reset({
        id: Math.floor(Math.random() * 1000) + 1,
        vehicle_no: "",
        type: "",
      });
    }
  }, [selectedData, form]);

  const handleSave = async (data) => {
    try {
      await onSave(data);
      form.reset({
        id: Math.floor(Math.random() * 1000) + 1,
        vehicle_no: "",
        type: "",
      });
    } catch (error) {
      console.error("Failed to save vehicle:", error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] max-h-[90vh] md:max-h-[80vh] sm:max-h-[70vh] xs:max-h-[60vh] flex flex-col">
        <DialogHeader className="px-6 pt-6  z-10 mr-2">
          <DialogTitle className="text-xl font-semibold text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
            Vehicle Details Form
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                <div className="space-y-4">
                  <InputTextField
                    control={form.control}
                    name="vehicle_no"
                    label="Vehicle No"
                    placeholder="Enter vehicle number"
                    required
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">
                          Type of Vehicle <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicleTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
        </div>

        <div className="bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] z-10 p-4 border-t border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
          <div className="flex justify-end gap-4">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-[var(--primary-500)]" />
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  className="text-[var(--secondary-300)] bg-neutral-gray100 hover:bg-[var(--neutral-gray300)] dark:hover:bg-[var(--neutral-gray700)] font-poppins py-2 px-4 rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="vehicle-form"
                  onClick={form.handleSubmit(handleSave)}
                  disabled={
                    !form.formState.isValid || 
                    form.formState.isSubmitting || 
                    (selectedData && !form.formState.isDirty) // Only check dirty for editing
                  }
                  className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-[var(--neutral-white)] font-poppins py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : selectedData ? (
                    "Update Vehicle"
                  ) : (
                    "Add Vehicle"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

VehicleDetailsForm.propTypes = {
  ...CustomDetailsFormPropTypes,
};

export default VehicleDetailsForm;
