import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CheckoutCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <XCircle className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Checkout Cancelled
        </h1>
        
        <p className="text-muted-foreground mb-6">
          No worries! Your payment was not processed. You can try again whenever you're ready.
        </p>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/admin/select-plan?mode=upgrade")} 
            className="w-full"
          >
            Try Again
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate("/admin")} 
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
