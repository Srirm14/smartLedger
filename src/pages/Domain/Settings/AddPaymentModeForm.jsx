import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Backdrop from "@/components/Backdrop";
const AddPaymentModeForm = ({ isOpen, onClose, account, onSave }) => {
  const [paymentMode, setPaymentMode] = useState({
    modeName: "",
  });

  const handleInputChange = (name, value) => {
    setPaymentMode((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!account?.id) {
      console.error("No account ID available");
      return;
    }
    onSave(account.id, paymentMode);
    setPaymentMode({ modeName: "" });
    onClose();
  };

  const isFormValid = paymentMode.modeName;

  return (
    <>
    {isOpen && <Backdrop />}
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Payment Mode</DialogTitle>
          <DialogDescription>
            Add a new payment mode for bank: {account?.bankName}
          </DialogDescription>
        </DialogHeader>

        <div className="gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="modeName">Mode Name</Label>
            <Input
              id="modeName"
              placeholder="Enter mode name"
              value={paymentMode.modeName}
              onChange={(e) => handleInputChange("modeName", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid}>
            Save Mode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AddPaymentModeForm;
