import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { CheckCircle, Loader2 } from "lucide-react";
import { createZodForm } from "@/lib/utils/form-utils";
import {
  emailSchema,
  otpSchema,
  passwordResetSchema,
} from "@/lib/schemas";

import { useAuthStore } from "../../../store/useAuthStore";
import { InputTextField } from "@/components/CommonFields";
import toast from "react-hot-toast";
import logo from "../../assets/logo/SmartLedgerColoured.svg";

export function ForgotPasswordForm({ email: initialEmail = "" }) {
  const [step, setStep] = useState("email");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const navigate = useNavigate();

  const emailForm = createZodForm(emailSchema, { email: email || "" });
  const otpForm = createZodForm(otpSchema, { otp: "" });
  const passwordForm = createZodForm(passwordResetSchema, {
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (step === "otp") {
      otpForm.reset({ otp: "" }); // Ensure OTP input resets when switching to OTP step
    }
  }, [step]);

  async function onEmailSubmit(data) {
    setIsLoading(true);
    try {
      const res = await useAuthStore
        .getState()
        .forgotPasswordAction(data.email);
      if (res.message) {
        setEmail(data.email);
        emailForm.reset();
        setStep("otp");
        toast.success(`OTP sent to ${data.email}`);
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  }

  async function onOtpSubmit(data) {
    setIsLoading(true);
    try {
      const res = await useAuthStore
        .getState()
        .confirmOtpAction(email, data.otp);
      if (res.status === 200) {
        otpForm.reset();
        setStep("password");
        toast.success("OTP verified , You can now reset your password");
      } else {
        throw new Error(res.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Invalid OTP, The verification code is incorrect.");
      otpForm.reset();
    } finally {
      setIsLoading(false);
    }
  }

  async function onPasswordSubmit(data) {
    setIsLoading(true);
    try {
      const res = await useAuthStore
        .getState()
        .changePasswordAction(data.password);
      if (res.status === 200) {
        setStep("success");
        toast.success("Your password has been reset successfully.");
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      toast.error("Failed to reset password, Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  const errors = (data) => {
    console.error(data);
  };

  function renderStep() {
    switch (step) {
      case "email":
        return (
          <Form {...emailForm} key="email-form">
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-4"
            >
              <InputTextField
                control={emailForm.control}
                name="email"
                label="Email"
                placeholder="Enter your email"
                type="email"
                disabled={isLoading || initialEmail}
                required
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Get OTP"
                )}
              </Button>
            </form>
          </Form>
        );

      case "otp":
        return (
          <Form {...otpForm} key="otp-form">
            <form
              onSubmit={otpForm.handleSubmit(onOtpSubmit)}
              className="space-y-4"
            >
              <InputTextField
                control={otpForm.control}
                name="otp"
                label="Verification Code"
                placeholder="Enter your OTP"
                type="number"
                disabled={isLoading}
                required
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </form>
          </Form>
        );

      case "password":
        return (
          <Form {...passwordForm} key="password-form">
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit, errors)}
              className="space-y-4"
            >
              <InputTextField
                control={passwordForm.control}
                name="password"
                label="New Password"
                placeholder="Enter your new password"
                type="password"
                disabled={isLoading}
                required
              />

              <InputTextField
                control={passwordForm.control}
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your new password"
                type="password"
                disabled={isLoading}
                required
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
        );

      case "success":
        return (
          <div className="flex flex-col items-center space-y-4 text-center p-6">
            <CheckCircle className="text-green-500" size={48} />{" "}
            {/* Success Icon */}
            <h3 className="text-xl font-semibold text-gray-800">
              Password Reset Successful
            </h3>
            <p className="text-gray-600">
              Your password has been reset successfully. You can now log in with
              your new password.
            </p>
            <Button className="w-full mt-4" onClick={() => navigate("/")}>
              Back to Login
            </Button>
          </div>
        );
    }
  }

  return (
    <Card className="w-full max-w-md shadow-none border-none">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">
          {step === "email" 
            ? "Reset Password"
            : step === "otp"
            ? "Verify Your Email"
            : step === "password" 
            ? "Create New Password"
            : "Success"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {step === "email"
            ? "Enter your email below to receive a reset link"
            : step === "otp"
            ? "We've sent a verification code to your email"
            : step === "password"
            ? "Enter a new password for your account"
            : "Password reset complete"}
        </CardDescription>
      </CardHeader>
      <CardContent>{renderStep()}</CardContent>
      {step !== "success" && (
        <CardFooter className="flex justify-center text-sm whitespace-nowrap">
          <span className="text-sm">Remember your password?</span>{" "}
          <a href="/" className="font-medium text-sm text-primary hover:underline ml-1">
            Sign in
          </a>
        </CardFooter>
      )}
    </Card>
  );
}
