import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClientConfigProvider } from "@/core/contexts/ClientConfigContext";
import Index from "./pages/Index";
import ClinicDashboard from "./pages/ClinicDashboard";
import ClinicLogin from "./pages/ClinicLogin";
import NutricionistaDashboard from "./pages/NutricionistaDashboard";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PlatformDashboard from "./pages/platform/PlatformDashboard";
import PlatformLogin from "./pages/platform/PlatformLogin";
import PlatformClients from "./pages/platform/PlatformClients";
import PlatformChat from "./pages/platform/PlatformChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ClientConfigProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing e Onboarding */}
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Plataformas Multi-tenant */}
            <Route path="/platform/:clientId" element={<PlatformDashboard />} />
            <Route path="/platform/:clientId/login" element={<PlatformLogin />} />
            <Route path="/platform/:clientId/clients" element={<PlatformClients />} />
            <Route path="/platform/:clientId/chat" element={<PlatformChat />} />
            
            {/* Rotas antigas (manter por compatibilidade) */}
            <Route path="/nutricionista" element={<NutricionistaDashboard />} />
            <Route path="/clinic" element={<ClinicDashboard />} />
            <Route path="/login" element={<ClinicLogin />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ClientConfigProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
