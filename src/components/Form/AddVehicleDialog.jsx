import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AddVehicleDialog = ({
  isOpen,
  onClose,
  customerName,
  customerId,
  onVehicleAdded,
  addVehicleDetails,
  fetchVehicleDetails,
  isPopover = false, // New prop to determine if it's used as popover content
}) => {
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    id: Math.floor(Math.random() * 1000) + 1,
    vehicle_no: "",
    type: "",
  });
  
  const vehicleInputRef = useRef(null);

  const vehicleTypes = [
    { value: "petrol", label: "Petrol" },
    { value: "diesel", label: "Diesel" },
    { value: "gas", label: "Gas" },
    { value: "others", label: "Others" },
  ];

  const handleAddVehicle = () => {
    if (!customerName) {
      toast.error("Please select a customer first");
      return;
    }
    
    if (!customerId) {
      toast.error("Customer ID not found");
      return;
    }
    
    // Prepare vehicle data
    const vehicleData = {
      ...newVehicle,
      customer_id: customerId,
      vehicle_number: newVehicle.vehicle_no,
    };
    
    setIsAddingVehicle(true);
    
    // Add the vehicle
    addVehicleDetails(vehicleData)
      .then(() => {
        // Refresh all vehicle details
        return fetchVehicleDetails();
      })
      .then(() => {
        // Call the callback with the new vehicle number
        onVehicleAdded(newVehicle.vehicle_no);
        
        // Close the dialog/popover
        onClose();
        // Reset the form
        setNewVehicle({
          id: Math.floor(Math.random() * 1000) + 1,
          vehicle_no: "",
          type: "",
        });
        toast.success("Vehicle added successfully");
      })
      .catch((error) => {
        console.error("Error adding vehicle:", error);
        toast.error("Failed to add vehicle");
      })
      .finally(() => {
        setIsAddingVehicle(false);
      });
  };

  // Form content component
  const FormContent = () => (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-vehicle-no" className="text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">Vehicle Number</Label>
          <Input
            id="new-vehicle-no"
            value={newVehicle.vehicle_no}
            onChange={(e) => setNewVehicle(prev => ({ ...prev, vehicle_no: e.target.value }))}
            placeholder="Enter vehicle number"
            autoFocus={isPopover}
            ref={vehicleInputRef}
            className="w-full bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)] placeholder:text-[var(--neutral-gray500)] dark:placeholder:text-[var(--neutral-gray400)]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-vehicle-type" className="text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">Vehicle Type</Label>
          <Select
            value={newVehicle.type}
            onValueChange={(value) => setNewVehicle(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger id="new-vehicle-type" className="w-full bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent className="z-[9999]" side="bottom" sideOffset={4}>
              {vehicleTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isAddingVehicle}
          className="text-[var(--neutral-gray700)] hover:text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray300)] dark:hover:text-[var(--neutral-gray100)] border-[var(--neutral-gray200)] hover:bg-[var(--neutral-gray100)] dark:border-[var(--neutral-gray700)] dark:hover:bg-[var(--neutral-gray800)]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleAddVehicle}
          disabled={isAddingVehicle}
          className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-[var(--neutral-white)] dark:bg-[var(--primary-600)] dark:hover:bg-[var(--primary-500)]"
        >
          {isAddingVehicle ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Vehicle"
          )}
        </Button>
      </div>
    </div>
  );

  // If used as popover content, return only the form content without Dialog wrapper
  if (isPopover) {
    return (
      <div className="w-80 bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] rounded-lg shadow-lg border border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
        <div className="border-b border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] p-4">
          <h3 className="text-lg font-semibold text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">Add New Vehicle</h3>
        </div>
        <div className="p-4">
          <FormContent />
        </div>
      </div>
    );
  }

  // Default dialog mode
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-96 bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]">
        <DialogHeader className="border-b border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
          <DialogTitle className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">Add New Vehicle</DialogTitle>
        </DialogHeader>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleDialog; 