import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/admin");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Payment Successful!
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Thank you for upgrading your plan. Your new features are now active.
        </p>

        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/admin")} 
            className="w-full"
          >
            Go to Dashboard
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Redirecting in {countdown} seconds...
          </p>
        </div>
      </Card>
    </div>
  );
}
