import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Mail, CheckCircle, Circle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string;
  read_at: string | null;
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success('Marked as read');
      fetchMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to update message');
    }
  };

  const unreadCount = messages.filter((m) => !m.read_at).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact Messages</h1>
        <p className="text-muted-foreground">
          {messages.length} total messages • {unreadCount} unread
        </p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              No contact messages yet
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card 
              key={message.id} 
              className={!message.read_at ? 'border-primary/50 bg-primary/5' : ''}
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {!message.read_at ? (
                        <Circle className="h-3 w-3 fill-primary text-primary" />
                      ) : (
                        <CheckCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      <CardTitle className="text-base">{message.name}</CardTitle>
                    </div>
                    <CardDescription>
                      <a 
                        href={`mailto:${message.email}`} 
                        className="hover:text-primary transition-colors"
                      >
                        {message.email}
                      </a>
                      {' • '}
                      {format(new Date(message.created_at), 'MMMM d, yyyy h:mm a')}
                    </CardDescription>
                  </div>
                  {!message.read_at && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => markAsRead(message.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{message.message}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
