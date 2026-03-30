import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const VehicleActions = ({ onAddVehicle }) => {
  return (
    <div className="flex justify-end mb-4">
      <Button 
        onClick={onAddVehicle}
        variant="default"
        className="flex items-center gap-1"
      >
        <CirclePlus className="h-4 w-4" />
        Add Vehicle
      </Button>
    </div>
  );
};

export default VehicleActions; 