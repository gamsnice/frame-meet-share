import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Calendar, Settings } from "lucide-react";
import { toast } from "sonner";
import DashboardHome from "@/components/admin/DashboardHome";
import EventsList from "@/components/admin/EventsList";
import EventEditor from "@/components/admin/EventEditor";
import TemplateManager from "@/components/admin/TemplateManager";
import EventAnalytics from "@/components/admin/EventAnalytics";
import AccountSettings from "@/components/admin/AccountSettings";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/admin/login");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-accent flex items-center justify-center text-white font-bold">
                M
              </div>
              <div>
                <h1 className="text-lg font-bold">MeetMeFrame</h1>
                <p className="text-xs text-muted-foreground">Admin Dashboard</p>
              </div>
            </Link>

            <nav className="hidden md:flex gap-1">
              <Link to="/admin">
                <Button 
                  variant={isActive("/admin") && location.pathname === "/admin" ? "default" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/admin/events">
                <Button 
                  variant={isActive("/admin/events") ? "default" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Events
                </Button>
              </Link>
              <Link to="/admin/account">
                <Button 
                  variant={isActive("/admin/account") ? "default" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Account
                </Button>
              </Link>
            </nav>
          </div>

          <Button variant="outline" onClick={handleSignOut} size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<DashboardHome userId={user.id} />} />
          <Route path="/events" element={<EventsList userId={user.id} />} />
          <Route path="/events/new" element={<EventEditor userId={user.id} />} />
          <Route path="/events/:eventId/edit" element={<EventEditor userId={user.id} />} />
          <Route path="/events/:eventId/templates" element={<TemplateManager />} />
          <Route path="/events/:eventId/analytics" element={<EventAnalytics />} />
          <Route path="/account" element={<AccountSettings userId={user.id} />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </main>
    </div>
  );
}
