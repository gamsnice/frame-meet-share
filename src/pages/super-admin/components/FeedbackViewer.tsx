import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Bug, CheckCircle, Clock, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeedbackItem {
  id: string;
  created_at: string;
  message: string;
  email: string | null;
  page_url: string | null;
  event_slug: string | null;
  feedback_type: string;
  status: string | null;
}

export default function FeedbackViewer() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchFeedback = async () => {
    try {
      let query = supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (typeFilter !== 'all') {
        query = query.eq('feedback_type', typeFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [typeFilter, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast.success('Status updated');
      fetchFeedback();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === 'bug_report') {
      return <Badge variant="destructive" className="gap-1"><Bug className="h-3 w-3" /> Bug Report</Badge>;
    }
    return <Badge variant="secondary" className="gap-1"><MessageSquare className="h-3 w-3" /> Feedback</Badge>;
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-500/20 text-green-400 gap-1"><CheckCircle className="h-3 w-3" /> Resolved</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-400 gap-1"><Clock className="h-3 w-3" /> In Progress</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
    }
  };

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
        <h1 className="text-2xl font-bold">Feedback & Bug Reports</h1>
        <p className="text-muted-foreground">Review and manage user feedback</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
            <SelectItem value="bug_report">Bug Reports</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {feedback.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No feedback found matching your filters
            </CardContent>
          </Card>
        ) : (
          feedback.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getTypeBadge(item.feedback_type)}
                      {getStatusBadge(item.status)}
                    </div>
                    <CardDescription>
                      {format(new Date(item.created_at), 'MMMM d, yyyy h:mm a')}
                      {item.email && ` • ${item.email}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus(item.id, 'in_progress')}
                      disabled={item.status === 'in_progress'}
                    >
                      Mark In Progress
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => updateStatus(item.id, 'resolved')}
                      disabled={item.status === 'resolved'}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{item.message}</p>
                {(item.page_url || item.event_slug) && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    {item.page_url && <div>Page: {item.page_url}</div>}
                    {item.event_slug && <div>Event: {item.event_slug}</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
