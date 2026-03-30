import React from "react";
import { formatINR } from "@/lib/utils/formatters";
import WarningPrompt from "@/components/WarningPrompt";

const CustomerCreditDeleteAction = ({
  isOpen,
  onClose,
  onConfirm,
  selectedData,
  loading,
}) => {
  const getDeleteTitle = () => {
    switch (selectedData?.type) {
      case "credit":
        return "Delete Credit Entry";
      case "payment":
        return "Delete Payment Entry";
      case "vehicle":
        return "Delete Vehicle Details";
      default:
        return "Delete Entry";
    }
  };

  const getDeleteMessage = () => {
    switch (selectedData?.type) {
      case "credit":
        return (
          <>
            Are you sure you want to delete credit entry with ID:{" "}
            <span className="font-semibold">{selectedData?.id}</span>?
          </>
        );
      case "payment":
        return (
          <>
            Are you sure you want to delete payment entry with amount:{" "}
            <span className="font-semibold">{formatINR(selectedData?.amount)}</span>?
          </>
        );
      case "vehicle":
        return (
          <>
            Are you sure you want to delete vehicle:{" "}
            <span className="font-semibold">{selectedData?.vehicle_no}</span>?
          </>
        );
      default:
        return "Are you sure you want to delete this entry?";
    }
  };

  return (
    <WarningPrompt
      open={isOpen}
      onOpenChange={onClose}
      title={getDeleteTitle()}
      description={getDeleteMessage()}
      actionText={loading ? "DELETING..." : "DELETE"}
      onAction={onConfirm}
      onCancel={onClose}
      variant="danger"
    />
  );
};

export default CustomerCreditDeleteAction;
