import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SuperAdminSetup() {
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [alreadyHasSuperAdmin, setAlreadyHasSuperAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      // Check if user is logged in
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        navigate('/admin/login');
        return;
      }

      setUser({ id: currentUser.id, email: currentUser.email || '' });

      // Check if user is already super_admin
      const { data: isSuper } = await supabase.rpc('has_role', {
        _user_id: currentUser.id,
        _role: 'super_admin'
      });

      if (isSuper) {
        navigate('/super-admin');
        return;
      }

      // Check if any super_admin exists
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'super_admin');

      setAlreadyHasSuperAdmin((count || 0) > 0);
      setLoading(false);
    };

    checkStatus();
  }, [navigate]);

  const handlePromote = async () => {
    setPromoting(true);
    try {
      const { data, error } = await supabase.rpc('promote_to_super_admin');

      if (error) throw error;

      if (data) {
        toast.success('You are now a Super Admin!');
        navigate('/super-admin');
      } else {
        toast.error('Could not promote to super admin. Another super admin may already exist.');
        setAlreadyHasSuperAdmin(true);
      }
    } catch (error) {
      console.error('Error promoting to super admin:', error);
      toast.error('Failed to promote to super admin');
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Super Admin Setup</CardTitle>
          <CardDescription>
            {alreadyHasSuperAdmin 
              ? 'A super admin already exists for this platform'
              : 'Set up the first super admin for this platform'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {alreadyHasSuperAdmin ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span>Super admin already exists</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Contact your existing super admin to get access.
              </p>
              <Button variant="outline" onClick={() => navigate('/admin')}>
                Go to Admin Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Logged in as:</span>
                  <br />
                  {user?.email}
                </p>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Full platform access
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  User & role management
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Subscription management
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Platform analytics
                </p>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handlePromote}
                disabled={promoting}
              >
                {promoting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Make me Super Admin'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
