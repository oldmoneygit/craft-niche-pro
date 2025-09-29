import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClientConfigProvider } from "@/core/contexts/ClientConfigContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RedirectToGabrielGandin from "./components/redirects/RedirectToGabrielGandin";
import RedirectToClinicaExemplo from "./components/redirects/RedirectToClinicaExemplo";
import RedirectToAdmin from "./components/redirects/RedirectToAdmin";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PlatformDashboard from "./pages/platform/PlatformDashboard";
import PlatformLogin from "./pages/platform/PlatformLogin";
import PlatformClients from "./pages/platform/PlatformClients";
import PlatformChat from "./pages/platform/PlatformChat";
import PlatformQuestionnaires from "./pages/platform/PlatformQuestionnaires";
import PlatformMealPlans from "./pages/platform/PlatformMealPlans";
import PlatformFinancial from "./pages/platform/PlatformFinancial";
import PlatformScheduling from "./pages/platform/PlatformScheduling";
import PlatformAIAgent from "./pages/platform/PlatformAIAgent";
import PlatformAnalytics from "./pages/platform/PlatformAnalytics";
import PlatformSettings from "./pages/platform/PlatformSettings";
import QuestionnairePublic from "./pages/QuestionnairePublic";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ClientConfigProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Landing e Onboarding */}
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Admin Dashboard */}
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Plataformas Multi-tenant */}
              <Route path="/platform/:clientId" element={<PlatformDashboard />} />
              <Route path="/platform/:clientId/dashboard" element={<PlatformDashboard />} />
              <Route path="/platform/:clientId/login" element={<PlatformLogin />} />
              <Route path="/platform/:clientId/clientes" element={<PlatformClients />} />
              <Route path="/platform/:clientId/chat" element={<PlatformChat />} />
              <Route path="/platform/:clientId/ai-agent" element={<PlatformAIAgent />} />
              <Route path="/platform/:clientId/agendamentos" element={<PlatformScheduling />} />
              <Route path="/platform/:clientId/analytics" element={<PlatformAnalytics />} />
              <Route path="/platform/:clientId/questionnaires" element={<PlatformQuestionnaires />} />
              <Route path="/platform/:clientId/meal-plans" element={<PlatformMealPlans />} />
              <Route path="/platform/:clientId/planos-alimentares" element={<PlatformMealPlans />} />
              <Route path="/platform/:clientId/comunicacao" element={<PlatformChat />} />
              <Route path="/platform/:clientId/financial" element={<PlatformFinancial />} />
              <Route path="/platform/:clientId/settings" element={<PlatformSettings />} />
              
              {/* Questionários Públicos */}
              <Route path="/questionnaire/:questionnaireId" element={<QuestionnairePublic />} />
              
              {/* Redirecionamentos das rotas antigas para as novas */}
              <Route path="/nutricionista" element={<RedirectToGabrielGandin />} />
              <Route path="/clinic" element={<RedirectToClinicaExemplo />} />
              <Route path="/login" element={<RedirectToAdmin />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ClientConfigProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
