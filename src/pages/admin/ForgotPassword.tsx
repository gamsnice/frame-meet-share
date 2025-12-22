import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { z } from "zod";
import { AUTH_CONFIG, getRedirectUrl } from "@/lib/auth-config";

const emailSchema = z.string().email("Please enter a valid email address").max(255);

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate email
    const result = emailSchema.safeParse(email.trim());
    if (!result.success) {
      setValidationError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getRedirectUrl(AUTH_CONFIG.redirects.passwordResetPage),
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      // Generic error message to prevent user enumeration
      toast.error("If an account exists with this email, you'll receive a reset link shortly.");
      setIsSubmitted(true); // Show success even on error to prevent enumeration
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 animate-scale-in text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-muted-foreground mb-6">
            If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
          </p>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn't receive an email? Check your spam folder or try again.
            </p>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
            >
              Try again
            </Button>
            
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/admin/login")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 animate-scale-in">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate("/admin/login")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Button>

        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Forgot your password?</h1>
          <p className="text-muted-foreground">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setValidationError(null);
              }}
              required
              placeholder="you@example.com"
              className={validationError ? "border-destructive" : ""}
            />
            {validationError && (
              <p className="mt-1 text-sm text-destructive">{validationError}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <button
            onClick={() => navigate("/admin/login")}
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </button>
        </p>
      </Card>
    </div>
  );
}
