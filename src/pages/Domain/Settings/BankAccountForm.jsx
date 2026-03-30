import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardDescription } from "@/components/ui/card";
import { BankAutocompleteWithInput } from "./BankAutocompleteWithInput";
import { Loader2 } from "lucide-react";

const BankAccountForm = ({
  newBankAccount,
  handleInputChange,
  handleSave,
  handleCancel,
  isFormValid,
  availableBanks,
  isSubmitting = false,
}) => {
  const handleBankSelect = (bankName) => {
    handleInputChange({ target: { name: "bankName", value: bankName } });
  };

  return (
    <div className="grid gap-4">
      <CardDescription>
        Enter your bank name below.
      </CardDescription>

      <div>
        <Label htmlFor="bankName">Bank Name</Label>
        <BankAutocompleteWithInput
          banks={availableBanks}
          onSelect={handleBankSelect}
          placeholder="Enter bank name"
        />
      </div>

      <Separator className="my-4" />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSubmitting || !isFormValid}>
          Save Account {isSubmitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        </Button>
      </div>
    </div>
  );
};

export default BankAccountForm;
