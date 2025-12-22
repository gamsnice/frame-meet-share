import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { AUTH_CONFIG, getRedirectUrl, getPasswordStrength, validatePassword } from "@/lib/auth-config";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  organization: z.string().max(100, "Organization must be less than 100 characters").optional(),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(AUTH_CONFIG.passwordMinLength, `Password must be at least ${AUTH_CONFIG.passwordMinLength} characters`),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AdminRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setPasswordErrors([]);

    // Validate with Zod
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setPasswordErrors(passwordValidation.errors);
      return;
    }

    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: getRedirectUrl(AUTH_CONFIG.redirects.afterSignup),
          data: {
            name: formData.name.trim(),
            organization: formData.organization.trim() || null,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        toast.success("Account created! Please check your email to verify your account.");
        navigate("/admin");
      }
    } catch (error: any) {
      // User-friendly error messages without exposing sensitive info
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.message?.includes("already registered")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "Please enter a valid email address.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 animate-scale-in">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Button>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground">
            Start creating 'Meet me at...' visuals for your events
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Your Name
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setValidationErrors((prev) => ({ ...prev, name: "" }));
              }}
              required
              placeholder="John Doe"
              className={validationErrors.name ? "border-destructive" : ""}
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-destructive">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-medium mb-2">
              Organization <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="organization"
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              placeholder="Event Corp"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setValidationErrors((prev) => ({ ...prev, email: "" }));
              }}
              required
              placeholder="you@example.com"
              className={validationErrors.email ? "border-destructive" : ""}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-destructive">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setValidationErrors((prev) => ({ ...prev, password: "" }));
                  setPasswordErrors([]);
                }}
                required
                placeholder="••••••••"
                className={`pr-10 ${validationErrors.password || passwordErrors.length > 0 ? "border-destructive" : ""}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password strength indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{passwordStrength.label}</span>
                </div>
              </div>
            )}
            
            {validationErrors.password && (
              <p className="mt-1 text-sm text-destructive">{validationErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setValidationErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                required
                placeholder="••••••••"
                className={`pr-10 ${validationErrors.confirmPassword ? "border-destructive" : ""}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-destructive">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {passwordErrors.length > 0 && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <ul className="text-sm text-destructive space-y-1">
                {passwordErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Password must be at least {AUTH_CONFIG.passwordMinLength} characters and include uppercase, lowercase, and a number.
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
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
