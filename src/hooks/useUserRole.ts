import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "super_admin" | "admin" | "user";

interface UseUserRoleResult {
  user: User | null;
  roles: AppRole[];
  isLoading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  hasRole: (role: AppRole) => boolean;
}

/**
 * Hook to check user roles from the user_roles table
 */
export function useUserRole(): UseUserRoleResult {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndRoles = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          // Type assertion needed until Supabase types are regenerated to include user_roles table
          const { data: userRoles, error } = await (supabase as any)
            .from("user_roles")
            .select("role")
            .eq("user_id", currentUser.id);

          if (!error && userRoles) {
            setRoles(userRoles.map((r: { role: AppRole }) => r.role));
          }
        }
      } catch (error) {
        console.error("Failed to fetch user roles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndRoles();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data: userRoles } = await (supabase as any)
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);

          if (userRoles) {
            setRoles(userRoles.map((r: { role: AppRole }) => r.role));
          }
        } else {
          setRoles([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isSuperAdmin = hasRole("super_admin");
  const isAdmin = hasRole("admin") || isSuperAdmin;

  return {
    user,
    roles,
    isLoading,
    isSuperAdmin,
    isAdmin,
    hasRole,
  };
}
