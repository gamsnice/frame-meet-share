import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UseSuperAdminReturn {
  user: User | null;
  isSuperAdmin: boolean;
  loading: boolean;
  checkRole: () => Promise<boolean>;
}

export function useSuperAdmin(): UseSuperAdminReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkRole = useCallback(async (): Promise<boolean> => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      return false;
    }

    // Check if user has super_admin role using the has_role function
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: currentUser.id,
      _role: 'super_admin'
    });

    if (error) {
      console.error('Error checking super admin role:', error);
      return false;
    }

    return data === true;
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null);
          
          if (!session?.user) {
            setIsSuperAdmin(false);
            setLoading(false);
            navigate('/admin/login');
            return;
          }

          // Defer role check to avoid deadlock
          setTimeout(async () => {
            const hasRole = await checkRole();
            setIsSuperAdmin(hasRole);
            setLoading(false);
            
            if (!hasRole) {
              navigate('/admin');
            }
          }, 0);
        }
      );

      // Check existing session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const hasRole = await checkRole();
        setIsSuperAdmin(hasRole);
        
        if (!hasRole) {
          navigate('/admin');
        }
      } else {
        navigate('/admin/login');
      }

      setLoading(false);

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, [navigate, checkRole]);

  return { user, isSuperAdmin, loading, checkRole };
}
