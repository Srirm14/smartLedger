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
import { loginSchema } from "@/lib/schemas";
import { createZodForm } from "@/lib/utils/form-utils";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { InputTextField } from "@/components/CommonFields";
import toast from "react-hot-toast";
import logo from "../../assets/logo/SmartLedgerColoured.svg";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.loginAction);

  const form = createZodForm(loginSchema, {
    email: "demo@gmail.com",
    password: "demo123",
  });

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  async function onSubmit(data) {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await loginAction(
        {
          user_email: data.email,
          user_password: data.password,
        },
        navigate
      );

      if (res.status === 200) {
        toast.success("Login successful");
      } else {
        setTimeout(() => form.reset(), 1000);
        toast.error("Login failed , Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-none border-none w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground">Sign in to your account</CardDescription>
        </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputTextField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              type="email"
              disabled={isLoading}
              autoComplete="email"
              required
            />

            <InputTextField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type={passwordVisible ? "text" : "password"}
              disabled={isLoading}
              autoComplete="current-password"
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

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
