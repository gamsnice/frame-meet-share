import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Clock, User, MessageSquare, ExternalLink, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface ContactMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string;
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Type assertion until types regenerate
      const { data, error } = await (supabase as any)
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Messages</h2>
          <p className="text-muted-foreground">
            {messages.length} message{messages.length !== 1 ? "s" : ""} received
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMessages}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Messages List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Inbox</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    selectedMessage?.id === msg.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium truncate">{msg.name}</span>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {format(new Date(msg.created_at), "MMM d")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {msg.email}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {msg.message}
                  </p>
                </button>
              ))}
              {messages.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Detail */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Message Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedMessage.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {selectedMessage.email}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(selectedMessage.created_at), "PPpp")}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Message</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button asChild className="w-full">
                    <a href={`mailto:${selectedMessage.email}?subject=Re: Your message to MeetMe`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Reply via Email
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a message to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
