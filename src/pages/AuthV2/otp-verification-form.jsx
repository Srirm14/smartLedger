import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { otpVerificationSchema } from "@/lib/schemas";
import { createZodForm } from "@/lib/utils/form-utils";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { InputTextField } from "@/components/CommonFields";
import toast from "react-hot-toast";

export function OtpVerificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const otpVerificationAction = useAuthStore((state) => state.otpVerificationAction);

  const email = searchParams.get("email") || "";
  const organisation = searchParams.get("organisation") || "";

  const form = createZodForm(otpVerificationSchema, {
    otp: "",
    email: email,
    organisation: organisation,
  });

  // Update form values when URL params change
  useEffect(() => {
    if (email) form.setValue("email", email);
    if (organisation) form.setValue("organisation", organisation);
  }, [email, organisation, form]);

  // Redirect if no email or organisation in URL
  useEffect(() => {
    if (!email || !organisation) {
      toast.error("Missing registration information. Please register again.");
      navigate("/register");
    }
  }, [email, organisation, navigate]);

  async function onSubmit(data) {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await otpVerificationAction(data.email, data.organisation, data.otp);

      if (res.status === 200) {
        toast.success("Account verified successfully! You can now sign in.");
        navigate("/login");
      } else {
        toast.error(res.message || "OTP verification failed. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-none border-none w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Verify your account</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter the 6-digit code sent to your email
        </CardDescription>
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
              disabled={true}
              autoComplete="email"
              required
            />

            <InputTextField
              control={form.control}
              name="organisation"
              label="Organisation"
              placeholder="Enter your organisation"
              type="text"
              disabled={true}
              autoComplete="organization"
              required
            />

            <InputTextField
              control={form.control}
              name="otp"
              label="Verification Code"
              placeholder="Enter 6-digit code"
              type="text"
              disabled={isLoading}
              autoComplete="one-time-code"
              required
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Account"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-4 text-center space-y-5">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <button
              onClick={() => toast.info("Resend functionality coming soon")}
              className="font-medium text-primary hover:underline"
            >
              Resend OTP
            </button>
          </p>
          <p className="text-sm text-muted-foreground">
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Back to SignUp
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 