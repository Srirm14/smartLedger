import React, { useState, useEffect } from "react";
import { Plus, Loader2, CreditCard, MoreHorizontal, X, Trash } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BankAccountForm from "./BankAccountForm";
import AddPaymentModeForm from "./AddPaymentModeForm";
import useBankAccountStore from "../../../../store/useBankAccountStore";
import { Skeleton } from "@/components/ui/skeleton";
import ActionDialog from "./ActionDialog";
import { INDIAN_BANKS } from "./constants";

const LoadingBankAccount = () => (
  <div className="py-4 flex items-center justify-between px-2">
    <div className="space-y-3">
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
      <div className="flex gap-2 mt-2">
        <Skeleton className="h-5 w-[80px]" />
        <Skeleton className="h-5 w-[80px]" />
      </div>
    </div>
    <Skeleton className="h-7 w-[100px]" />
  </div>
);

const BankingPayments = () => {
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState({
    bankName: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [dialogAction, setDialogAction] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    bankAccounts,
    isLoading,
    error,
    fetchBankAccounts,
    addNewBankAccount,
    isLoadingModes,
    addNewMode,
    getModesForAccount,
    deleteMode,
    deleteBankAccount,
  } = useBankAccountStore();

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);


  const availableBanks = INDIAN_BANKS;

  // Add this handler
  const handleDeleteMode = async (mode) => {
    setDialogAction("deleteMode");
    setSelectedItem(mode);
  };
  const handleDeleteBankAccount = async (bankAccount) => {
    setDialogAction("deleteBankAccount");
    setSelectedItem(bankAccount);
  };

  const handleConfirmAction = async (item) => {
    setDialogAction(null);
    if (dialogAction === "deleteMode") {
      try {
        await deleteMode(item.id);
      } catch (error) {
        console.error("Failed to delete mode:", error);
      }
    }

    if (dialogAction === "deleteBankAccount") {
      try {
        await deleteBankAccount(item.id);
      } catch (error) {
        console.error("Failed to delete bank account:", error);
      }
    }

    setSelectedItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBankAccount((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (newBankAccount.bankName) {
      try {
        await addNewBankAccount(newBankAccount.bankName);
        setNewBankAccount({ bankName: "" });
        setIsCardExpanded(false);
      } catch (error) {
        console.error("Failed to add bank account:", error);
      }
    }
  };

  const handleCancel = () => {
    setIsCardExpanded(false);
    setNewBankAccount({ bankName: "" });
  };

  // In BankingPayments.jsx
  const handleAddMode = (account) => {
    if (!account?.id) {
      return;
    }
    setSelectedAccount({
      id: account.id,
      bankName: account.bankName,
    });
    setIsModalOpen(true);
  };
  
  const handleSaveMode = async (accountId, paymentMode) => {
    try {
      if (!accountId) {
        console.error("Account ID is missing");
        return;
      }
      await addNewMode(accountId, paymentMode.modeName);
      setIsModalOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error("Failed to add mode:", error);
    }
  };

  const isFormValid = newBankAccount.bankName;

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 ">
      <section className="mb-3 mt-10">
        <Card className="shadow-none">
          <CardHeader
            className={`flex flex-row w-full items-center justify-between space-y-0 pb-2 transition-all
              ${isCardExpanded ? "pt-4" : "pt-2 min-h-[60px]"}`}
          >
            <CardTitle>Bank Account Details</CardTitle>
            <Plus
              className="h-5 w-5 cursor-pointer hover:text-primary transition-colors"
              onClick={() => setIsCardExpanded(!isCardExpanded)}
            />
          </CardHeader>

          {isCardExpanded && (
            <CardContent>
              <BankAccountForm
                newBankAccount={newBankAccount}
                handleInputChange={handleInputChange}
                handleSave={handleSave}
                handleCancel={handleCancel}
                isFormValid={isFormValid}
                availableBanks={availableBanks}
                isSubmitting={isLoading}
              />
            </CardContent>
          )}
        </Card>
      </section>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Saved Bank Accounts
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <LoadingBankAccount key={i} />
              ))}
            </div>
          ) : bankAccounts.length > 0 ? (
            <div className="divide-y divide-border">
              {bankAccounts.map((account) => {
                const accountModes = getModesForAccount(account.id);
                return (
                  <div
                    key={account.id}
                    className="py-4 flex items-center justify-between hover:bg-accent/50 rounded-lg px-2 transition-colors"
                  >
                    <div className="space-y-1 w-[500px]">
                      <h4 className="text-sm font-semibold leading-none">
                        {account.bankName}
                      </h4>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {isLoadingModes ? (
                          <Badge
                            variant="secondary"
                            className="text-sm text-gray-400 border-[1px] border-gray-200"
                          >
                            <MoreHorizontal className="h-4 w-4 mr-1 animate-pulse" />
                            Loading modes...
                          </Badge>
                        ) : accountModes.length > 0 ? (
                          accountModes.map((mode) => (
                            <Badge
                              key={mode.id}
                              variant="secondary"
                              className="text-sm border-[1px] border-secondary-300"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              {mode.name}
                              <X
                                className="h-4 w-4 ml-1 cursor-pointer hover:text-red-500"
                                onClick={() => handleDeleteMode(mode)}
                              />
                            </Badge>
                          ))
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7"
                        onClick={() => handleAddMode(account)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Mode
                      </Button>
                    </div>

                    <div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 hover:text-red-500"
                        onClick={() => handleDeleteBankAccount(account)}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <p>No bank accounts found</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => setIsCardExpanded(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Your First Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddPaymentModeForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
        onSave={handleSaveMode}
      />

      <ActionDialog
        isOpen={!!dialogAction}
        onClose={() => {
          setDialogAction(null);
          setSelectedItem(null);
        }}
        onConfirm={handleConfirmAction}
        action={dialogAction}
        item={selectedItem}
      />
    </div>
  );
};

export default BankingPayments;
