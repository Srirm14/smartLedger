import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Backdrop from "./Backdrop";

export default function WarningPrompt({
  open,
  onOpenChange,
  title,
  description,
  actionText,
  cancelText = "Cancel",
  onAction,
  onCancel,
  triggerButton,
  variant = "danger", // can be 'danger' or 'warning'
  disabled = false,
}) {
  const getActionButtonClasses = () => {
    const baseClasses = variant === 'danger' 
      ? "bg-[var(--danger-500)] hover:bg-[var(--danger-400)] active:bg-[var(--danger-600)] text-[var(--neutral-white)]"
      : "bg-[var(--warning-500)] hover:bg-[var(--warning-400)] active:bg-[var(--warning-600)] text-[var(--neutral-white)]";
    
    return disabled 
      ? `${baseClasses} opacity-50 cursor-not-allowed`
      : baseClasses;
  };

  return (
    <>
      {open && <Backdrop />}
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogTrigger asChild>
          {triggerButton}
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)] hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)]"
              onClick={onCancel}
              disabled={disabled}
            >
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onAction}
              className={getActionButtonClasses()}
              disabled={disabled}
            >
              {actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 