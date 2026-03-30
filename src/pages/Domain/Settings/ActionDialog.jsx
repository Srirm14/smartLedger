import Backdrop from "@/components/Backdrop";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
  } from "@/components/ui/alert-dialog";
  import { Button } from "@/components/ui/button";
  
  const ActionDialog = ({ isOpen, onClose, onConfirm, action, item }) => {
    const dialogContent = {
      deleteMode: {
        title: "Delete Payment Mode",
        description: `Are you sure you want to delete ${item?.name}? This action cannot be undone.`,
        confirmButton: "Delete",
      },
      deleteBankAccount: {
        title: "Delete Bank Account",
        description: `Are you sure you want to delete ${item?.bankName}? This action cannot be undone.`,
        confirmButton: "Delete",
      }
    };
    if (!dialogContent[action]) {
        return null; // Or handle the undefined action case
      }
    const content = dialogContent[action];
  
    return (
      <>
      {isOpen && <Backdrop />}
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{content.title}</AlertDialogTitle>
            <AlertDialogDescription>
              <div>
                <p>{content.description}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="text-secondary-300 dark:text-secondary-300 bg-neutral-gray100 hover:bg-neutral-gray300 font-poppins"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => onConfirm(item)}
              className="bg-danger-500 hover:bg-danger-400 text-white"
            >
              {content.confirmButton}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </>
    );
  };
  
  export default ActionDialog;
  