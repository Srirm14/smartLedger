"use client"

import { Unlink } from "lucide-react"
import WarningPrompt from "@/components/WarningPrompt"

export const UnlinkSalesUnitForm = ({ isOpen, onClose, onConfirm, salesUnitName }) => {
  return (
    <WarningPrompt
      open={isOpen}
      onOpenChange={onClose}
      title="Unlink Sales Unit"
      description={
        <div className="flex items-center gap-2">
          <Unlink className="h-4 w-4 text-danger-500" />
          <span>Are you sure you want to unlink <strong>{salesUnitName}</strong>? This action cannot be undone.</span>
        </div>
      }
      actionText="UNLINK"
      onAction={onConfirm}
      onCancel={onClose}
      variant="danger"
    />
  )
} 