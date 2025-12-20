import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Mail, 
  CreditCard, 
  BarChart3,
  LogOut,
  Menu,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { supabase } from '@/integrations/supabase/client';
import PlatformAnalytics from './components/PlatformAnalytics';
import UsersManagement from './components/UsersManagement';
import FeedbackViewer from './components/FeedbackViewer';
import ContactMessages from './components/ContactMessages';
import SubscriptionsManager from './components/SubscriptionsManager';
import SuperAdminHome from './components/SuperAdminHome';
import TierConfigManager from './components/TierConfigManager';

const navItems = [
  { title: 'Overview', path: '/super-admin', icon: LayoutDashboard },
  { title: 'Analytics', path: '/super-admin/analytics', icon: BarChart3 },
  { title: 'Users', path: '/super-admin/users', icon: Users },
  { title: 'Feedback', path: '/super-admin/feedback', icon: MessageSquare },
  { title: 'Contact', path: '/super-admin/contact', icon: Mail },
  { title: 'Subscriptions', path: '/super-admin/subscriptions', icon: CreditCard },
  { title: 'Tier Config', path: '/super-admin/tiers', icon: Shield },
];

export default function SuperAdminDashboard() {
  const { user, isSuperAdmin, loading } = useSuperAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/super-admin') {
      return location.pathname === '/super-admin';
    }
    return location.pathname.startsWith(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return null; // Hook handles redirect
  }

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={() => mobile && setMobileOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive(item.path)
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-destructive" />
                    <span className="font-bold text-lg">Super Admin</span>
                  </div>
                </div>
                <div className="p-4">
                  <NavLinks mobile />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-destructive" />
              <span className="font-bold text-lg hidden sm:inline">Super Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-4rem)] border-r border-border bg-card/50 p-4">
          <NavLinks />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          <Routes>
            <Route index element={<SuperAdminHome />} />
            <Route path="analytics" element={<PlatformAnalytics />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="feedback" element={<FeedbackViewer />} />
            <Route path="contact" element={<ContactMessages />} />
            <Route path="subscriptions" element={<SubscriptionsManager />} />
            <Route path="tiers" element={<TierConfigManager />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
