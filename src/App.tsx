import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClientConfigProvider } from "@/core/contexts/ClientConfigContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { HubDashboard } from "./pages/hub/HubDashboard";
import PlatformDashboard from "./pages/platform/PlatformDashboard";
import PlatformLogin from "./pages/platform/PlatformLogin";
import PlatformAuth from "./pages/platform/PlatformAuth";
import PlatformProtectedRoute from "./components/auth/PlatformProtectedRoute";
import PlatformClients from "./pages/platform/PlatformClients";
import PlatformChat from "./pages/platform/PlatformChat";
import PlatformLeads from "./pages/platform/PlatformLeads";
import PlatformCommunication from "./pages/platform/PlatformCommunication";
import PlatformQuestionnaires from "./pages/platform/PlatformQuestionnaires";
import PlatformQuestionnaireResponses from "./pages/platform/PlatformQuestionnaireResponses";
import PlatformMealPlans from "./pages/platform/PlatformMealPlans";
import PlatformMealPlanEditor from "./pages/platform/PlatformMealPlanEditor";
import PlatformMealPlanViewer from "./pages/platform/PlatformMealPlanViewer";
import PlatformTemplateEditor from "./pages/platform/PlatformTemplateEditor";
import PlatformAIChat from "./pages/platform/PlatformAIChat";
import PlatformScheduling from "./pages/platform/PlatformScheduling";
import PlatformSettings from "./pages/platform/PlatformSettings";
import PlatformReminderSettings from "./pages/platform/PlatformReminderSettings";
import PlatformKnowledge from "./pages/platform/PlatformKnowledge";
import PlatformWeeklyFeedbacks from "./pages/platform/PlatformWeeklyFeedbacks";
import PlatformFinancial from "./pages/platform/PlatformFinancial";
import PlatformReports from "./pages/platform/PlatformReports";
import PlatformServices from "./pages/platform/PlatformServices";
import { PlatformQuestionnairePreview } from "./pages/platform/PlatformQuestionnairePreview";
import QuestionnairePublic from "./pages/QuestionnairePublic";
import PublicQuestionnaireResponse from "./pages/public/PublicQuestionnaireResponse";
import PublicMealPlanView from "./pages/public/PublicMealPlanView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <ClientConfigProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Hub Routes */}
                <Route path="/hub/dashboard" element={<HubDashboard />} />
                <Route path="/hub/platforms" element={<div className="p-10 text-white">Platforms Page - Em desenvolvimento</div>} />
                <Route path="/hub/clients" element={<div className="p-10 text-white">Clients Page - Em desenvolvimento</div>} />
                <Route path="/hub/analytics" element={<div className="p-10 text-white">Analytics Page - Em desenvolvimento</div>} />
                <Route path="/hub/settings" element={<div className="p-10 text-white">Settings Page - Em desenvolvimento</div>} />

                {/* Redirect root to hub */}
                <Route path="/" element={<Navigate to="/hub/dashboard" replace />} />
              
              {/* Platform Routes */}
              <Route path="/platform/:clientId/login" element={<PlatformAuth />} />
              <Route path="/platform/:clientId" element={<PlatformProtectedRoute><PlatformDashboard /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/dashboard" element={<PlatformProtectedRoute><PlatformDashboard /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/clientes" element={<PlatformProtectedRoute><PlatformClients /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/leads" element={<PlatformProtectedRoute><PlatformLeads /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/chat" element={<PlatformProtectedRoute><PlatformChat /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/agendamentos" element={<PlatformProtectedRoute><PlatformScheduling /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/questionnaires" element={<PlatformProtectedRoute><PlatformQuestionnaires /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/questionarios/:questionnaireId/respostas" element={<PlatformProtectedRoute><PlatformQuestionnaireResponses /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/feedbacks-semanais" element={<PlatformProtectedRoute><PlatformWeeklyFeedbacks /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/meal-plans" element={<PlatformProtectedRoute><PlatformMealPlans /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/planos-alimentares" element={<PlatformProtectedRoute><PlatformMealPlans /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/planos-alimentares/novo" element={<PlatformProtectedRoute><PlatformMealPlanEditor /></PlatformProtectedRoute>} />
              <Route path="/platform/templates/:templateId/editar" element={<PlatformProtectedRoute><PlatformTemplateEditor /></PlatformProtectedRoute>} />
              <Route path="/platform/templates/:templateId/visualizar" element={<PlatformProtectedRoute><PlatformMealPlanViewer /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/planos-alimentares/:planId" element={<PlatformProtectedRoute><PlatformMealPlanViewer /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/ai-chat" element={<PlatformProtectedRoute><PlatformAIChat /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/ai-agent" element={<PlatformProtectedRoute><PlatformAIChat /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/comunicacao" element={<PlatformProtectedRoute><PlatformCommunication /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/settings" element={<PlatformProtectedRoute><PlatformSettings /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/lembretes" element={<PlatformProtectedRoute><PlatformReminderSettings /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/conhecimento" element={<PlatformProtectedRoute><PlatformKnowledge /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/financeiro" element={<PlatformProtectedRoute><PlatformFinancial /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/finances" element={<PlatformProtectedRoute><PlatformFinancial /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/relatorios" element={<PlatformProtectedRoute><PlatformReports /></PlatformProtectedRoute>} />
              <Route path="/platform/:clientId/servicos" element={<PlatformProtectedRoute><PlatformServices /></PlatformProtectedRoute>} />
              
              {/* Public Questionnaires */}
              <Route path="/questionnaire/:questionnaireId" element={<QuestionnairePublic />} />
              <Route path="/questionario/preview/:questionnaireId" element={<PlatformQuestionnairePreview />} />
              <Route path="/responder/:token" element={<PublicQuestionnaireResponse />} />
              
              {/* Public Meal Plan */}
              <Route path="/plano/:token" element={<PublicMealPlanView />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ClientConfigProvider>
      </AuthProvider>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
