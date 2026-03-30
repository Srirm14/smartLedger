import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Backdrop from "@/components/Backdrop";

export const FormDialogWrapper = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  isSubmitting = false,
  submitDisabled = false,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  maxWidth = "md",
  showFooter = true,
  footerContent,
  // New props for form state validation
  isFormValid = true,
  isFormDirty = false,
}) => {
  // Map maxWidth to actual class
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full"
  };

  // Determine if submit should be disabled
  const isSubmitDisabled = isSubmitting || submitDisabled || !isFormValid || !isFormDirty;

  return (
    <>
      {open && <Backdrop />}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className={`${maxWidthClasses[maxWidth] || "max-w-md"}`}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {children}
          </div>

          {showFooter && (
            <DialogFooter>
              {footerContent || (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="mr-2"
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    type="submit"
                    onClick={onSubmit}
                    disabled={isSubmitDisabled}
                  >
                    {isSubmitting ? "Saving..." : submitLabel}
                  </Button>
                </>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}; 