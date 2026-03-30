
import { getUserDetails } from "@/services/apiService";
import { create } from "zustand";

const useUserProfileDetails = create((set) => ({
  userDetails: null, // Initial state
  loading: false,
  error: null,

  fetchUserDetails: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getUserDetails();
      set({ userDetails: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default useUserProfileDetails;
