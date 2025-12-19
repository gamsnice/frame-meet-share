import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import SuperAdminSetup from "./pages/super-admin/SuperAdminSetup";
import EventParticipantPage from "./pages/EventParticipantPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/super-admin/setup" element={<SuperAdminSetup />} />
          <Route path="/super-admin/*" element={<SuperAdminDashboard />} />
          <Route path="/:slug" element={<EventParticipantPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
