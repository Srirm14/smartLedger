import { create } from "zustand";
import {
  addBankAccount,
  getBankAccountDetails,
  addMode,
  getModes,
  getModeList,
  deleteModes,
  deleteBankAccount,
} from "@/services/apiService";

const useBankAccountStore = create((set, get) => ({
  bankAccounts: [],
  modes: {},
  modeList: [],
  isLoading: false,
  isLoadingModes: false,
  error: null,

  fetchBankAccounts: async () => {
    set({ isLoading: true });
    try {
      const response = await getBankAccountDetails();
      const list = Array.isArray(response)
        ? response
        : Object.values(response ?? {});
      const accountsArray = list.map((account) => ({
        id: Number(account.id),
        bankName: account.bank_name,
      }));
      set({ bankAccounts: accountsArray, isLoading: false });

      // Fetch modes after getting accounts
      await get().fetchModes();
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchModes: async () => {
    set({ isLoadingModes: true });
    try {
      const response = await getModes();
      const modesByAccount = {};

      // Group by bank account (API may use account_id or associated_account)
      Object.values(response ?? {}).forEach((mode) => {
        const accountId = mode.account_id ?? mode.associated_account;
        if (accountId == null) return;
        if (!modesByAccount[accountId]) {
          modesByAccount[accountId] = [];
        }
        modesByAccount[accountId].push({
          id: mode.mode_id ?? mode.id,
          name: mode.mode_name,
        });
      });

      set({ modes: modesByAccount, isLoadingModes: false });
    } catch (error) {
      set({ error: error.message, isLoadingModes: false });
    }
  },

  addNewBankAccount: async (bankName) => {
    set({ isLoading: true });
    try {
      await addBankAccount(bankName);
      await get().fetchBankAccounts(); // Refresh the accounts list
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addNewMode: async (accountId, modeName) => {
    set({ isLoadingModes: true });
    try {
      await addMode(accountId, modeName);
      await get().fetchModes(); // Refresh modes after adding
    } catch (error) {
      set({ error: error.message, isLoadingModes: false });
    }
  },
  deleteBankAccount: async (accountId) => {
    set({ isLoading: true });
    try {
      await deleteBankAccount(accountId);
      await get().fetchBankAccounts();
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  getModeList: async () => {
    const response = await getModeList();
    const modeArray = Array.isArray(response)
      ? response
      : Object.values(response ?? {});
    set({ modeList: modeArray });
  },

  getModesForAccount: (accountId) => {
    const { modes } = get();
    return modes[accountId] || [];
  },

  deleteMode: async (modeId) => {
    set({ isLoadingModes: true });
    try {
      await deleteModes(modeId);
      await get().fetchModes(); // Refresh modes after deletion
    } catch (error) {
      set({ error: error.message, isLoadingModes: false });
    }
  },
}));

export default useBankAccountStore;
