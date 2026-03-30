import { create } from "zustand";
import {
  login,
  forgotPassword,
  confirmOtpOnPasswordReset,
  updateAuthPassword,
  register,
  otpConfirmation,
} from "../src/services/apiService";
import useGlobalDateStore from "./useGlobalStore";

// Utility function to update session storage tokens (clears when browser closes)
const updateSessionStorageTokens = (accessToken, refreshToken) => {
  sessionStorage.setItem("access_token", accessToken);
  sessionStorage.setItem("refresh_token", refreshToken);
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

// Zustand store for authentication
export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: sessionStorage.getItem("access_token") || "",
  refreshToken: sessionStorage.getItem("refresh_token") || "",
  isLoggedIn: !!sessionStorage.getItem("access_token"),
  resetPasswordToken: "",

  updateTokens: (accessToken, refreshToken) => {
    set({
      accessToken,
      refreshToken,
      isLoggedIn: true,
    });
    updateSessionStorageTokens(accessToken, refreshToken);
  },

  loginAction: async (user_cred, navigate) => {
    try {
      const { access_token, refresh_token } = await login(
        user_cred.user_email,
        user_cred.user_password
      );
      if (access_token && refresh_token) {
        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          isLoggedIn: true,
          user: user_cred.user_email,
        });
        updateSessionStorageTokens(access_token, refresh_token);

        // Reset all dates to current date
        const { resetAllDates } = useGlobalDateStore.getState();
        await resetAllDates();

        navigate("/product-management");
        return { status: 200, message: "Login successful" };
      }
      return { status: 401, message: "Invalid credentials" };
    } catch (err) {
      console.error("Login failed:", err);
      return {
        status: 401,
        message: err?.response?.data?.message || "Login failed",
      };
    }
  },

  forgotPasswordAction: async (email) => {
    try {
      const response = await forgotPassword(email);
      return response;
    } catch (err) {
      console.error("Forgot password failed:", err);
      return {
        status: 400,
        message: err?.response?.data?.message || "Failed to send reset link",
      };
    }
  },

  confirmOtpAction: async (email, otp) => {
    try {
      const response = await confirmOtpOnPasswordReset(email, otp);
      set({ resetPasswordToken: response.access_token });
      return { status: 200, message: "OTP confirmed successfully" };
    } catch (err) {
      console.error("OTP confirmation failed:", err);
      return {
        status: 400,
        message: err?.response?.data?.message || "OTP confirmation failed",
      };
    }
  },

  changePasswordAction: async (password) => {
    try {
      const response = await updateAuthPassword(
        password,
        get().resetPasswordToken
      );
      return { status: 200, message: "Password changed successfully" };
    } catch (err) {
      console.error("Password change failed:", err);
      return {
        status: 400,
        message: err?.response?.data?.message || "Password change failed",
      };
    }
  },

  registerAction: async (registrationData) => {
    try {
      const response = await register(
        registrationData.username,
        registrationData.organisation,
        registrationData.email,
        registrationData.password
      );
      return { status: 200, message: "Registration successful. Please check your email for OTP." };
    } catch (err) {
      console.error("Registration failed:", err);
      return {
        status: 400,
        message: err?.response?.data?.message || "Registration failed",
      };
    }
  },

  otpVerificationAction: async (email, organisation, otp) => {
    try {
      const response = await otpConfirmation(email, organisation, otp);
      return { status: 200, message: "OTP verification successful" };
    } catch (err) {
      console.error("OTP verification failed:", err);
      return {
        status: 400,
        message: err?.response?.data?.message || "OTP verification failed",
      };
    }
  },

  logoutAction: () => {
    set({
      user: null,
      accessToken: "",
      refreshToken: "",
      isLoggedIn: false,
      resetPasswordToken: "",
    });

    // Clear auth tokens from sessionStorage
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");

    // Clear all cookies
    document.cookie.split(";").forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });

    // Clear date selections from localStorage
    localStorage.removeItem("InventorySelectedDate");
    localStorage.removeItem("IslandSelectedDate");
    localStorage.removeItem("CashflowSelectedDate");

    // Clear session storage
    sessionStorage.clear();

    // Clear any other potential auth-related data
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
  },
}));
