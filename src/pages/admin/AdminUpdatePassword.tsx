import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminUpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  // Check if user has a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // No valid session, the reset link might be expired or invalid
        toast.error("Der Reset-Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.");
        navigate("/admin/forgot-password");
      }
    };
    checkSession();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (password.length < 8) {
      newErrors.password = "Das Passwort muss mindestens 8 Zeichen lang sein.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Die Passwörter stimmen nicht überein.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Dein Passwort wurde erfolgreich geändert.");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
    } catch (error: any) {
      console.error("Password update error:", error);
      if (error.message?.includes("expired") || error.message?.includes("invalid")) {
        toast.error("Der Reset-Link ist abgelaufen. Bitte fordere einen neuen an.");
        navigate("/admin/forgot-password");
      } else {
        toast.error(error.message || "Fehler beim Ändern des Passworts. Bitte versuche es erneut.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 animate-scale-in">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Passwort geändert!</h1>
            <p className="text-muted-foreground mb-6">
              Dein Passwort wurde erfolgreich geändert. Du wirst in Kürze zum Login weitergeleitet...
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/admin/login")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Jetzt zum Login
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
          Zurück zum Login
        </Button>

        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Neues Passwort setzen</h1>
          <p className="text-muted-foreground">
            Wähle ein neues, sicheres Passwort für dein Konto.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Neues Passwort
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              required
              placeholder="••••••••"
              disabled={isLoading}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Mindestens 8 Zeichen
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Passwort bestätigen
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
              }}
              required
              placeholder="••••••••"
              disabled={isLoading}
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Wird geändert..." : "Passwort ändern"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
