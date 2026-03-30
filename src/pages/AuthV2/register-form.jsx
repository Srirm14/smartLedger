import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { registerSchema } from "@/lib/schemas";
import { createZodForm } from "@/lib/utils/form-utils";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { InputTextField } from "@/components/CommonFields";
import toast from "react-hot-toast";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const registerAction = useAuthStore((state) => state.registerAction);

  const form = createZodForm(registerSchema, {
    organisation: "",
    username: "",
    email: "",
    password: "",
  });

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  async function onSubmit(data) {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await registerAction(data);

      if (res.status === 200) {
        toast.success("Registration successful! Please check your email for OTP.");
        // Navigate to OTP verification with email and organisation
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}&organisation=${encodeURIComponent(data.organisation)}`);
      } else {
        toast.error(res.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-none border-none w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your information to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
            {/* Hidden fake fields to confuse browser auto-fill */}
            <input type="text" name="fakeusernameremembered" style={{position: 'absolute', left: '-9999px'}} tabIndex="-1" />
            <input type="password" name="fakepasswordremembered" style={{position: 'absolute', left: '-9999px'}} tabIndex="-1" />
            <input type="text" name="username" style={{position: 'absolute', left: '-9999px'}} tabIndex="-1" />
            <input type="email" name="email" style={{position: 'absolute', left: '-9999px'}} tabIndex="-1" />
            
            <InputTextField
              control={form.control}
              name="organisation"
              label="Organisation"
              placeholder="Enter your organisation name"
              type="text"
              disabled={isLoading}
              autoComplete="nope"
              data-form-type="other"
              required
            />

            <InputTextField
              control={form.control}
              name="username"
              label="Username"
              placeholder="Enter your username"
              type="text"
              disabled={isLoading}
              autoComplete="nope"
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              required
            />

            <InputTextField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              type="email"
              disabled={isLoading}
              autoComplete="nope"
              data-form-type="other"
              required
            />

            <InputTextField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type={passwordVisible ? "text" : "password"}
              disabled={isLoading}
              autoComplete="new-password"
              data-form-type="other"
              required
              suffixIcon={
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 cursor-pointer p-1"
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                >
                  {passwordVisible ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              }
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 