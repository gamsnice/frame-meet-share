import { Button } from "@/components/ui/button";
import { Linkedin, Loader2, CheckCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkedInConnectCardProps {
  isConnected: boolean;
  linkedInName: string | null;
  isLoading: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  className?: string;
}

export function LinkedInConnectCard({
  isConnected,
  linkedInName,
  isLoading,
  isConnecting,
  onConnect,
  onDisconnect,
  className,
}: LinkedInConnectCardProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-4", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className={cn("flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border border-border", className)}>
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm truncate">
            Connected as <span className="font-medium">{linkedInName}</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDisconnect}
          className="flex-shrink-0 h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={onConnect}
      disabled={isConnecting}
      className={cn(
        "w-full min-h-[44px] bg-[#0077B5] hover:bg-[#005885] text-white",
        className
      )}
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Linkedin className="h-4 w-4 mr-2" />
          Connect LinkedIn Account
        </>
      )}
    </Button>
  );
}
