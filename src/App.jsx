import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { useAuthStore } from "../store/useAuthStore";
import AppLayout from "./components/AppLayout/app-layout";
import LoginLayout from "./pages/AuthV2/Layout/LoginPage";
import ForgotPasswordLayout from "./pages/AuthV2/Layout/ForgotPassword";
import RegisterPage from "./pages/AuthV2/Layout/RegisterPage";
import OtpVerificationPage from "./pages/AuthV2/Layout/OtpVerificationPage";
import GoogleAnalytics from "./components/GoogleAnalytics";

const App = () => {
  const { isLoggedIn } = useAuthStore();

  if (isLoggedIn == null) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <GoogleAnalytics />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> :  <LoginLayout />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/verify-otp" element={isLoggedIn ? <Navigate to="/" replace /> : <OtpVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordLayout />} />

        {/* Protected Routes */}
        {isLoggedIn ? (
          <Route
            path="/*"
            element={
              <div>
                <AppLayout /> {/* Use SidebarNext here */}
              </div>
            }
          />
        ) : (
          <Route path="/*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </>
  );
};

export default App;
