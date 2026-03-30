import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const IslandForm = ({
  newIsland,
  handleInputChange,
  handleSave,
  handleCancel,
  isFormValid,
  isLoading = false,
}) => {
  return (
    <div className="grid gap-4">
      <CardDescription>
        Enter your island information below.
      </CardDescription>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="islandName">Island Name</Label>
          <Input
            id="islandName"
            name="name"
            placeholder="Enter island name"
            value={newIsland.name}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading || !isFormValid}>
          Save Island {isLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        </Button>
      </div>
    </div>
  );
};

export default IslandForm;
