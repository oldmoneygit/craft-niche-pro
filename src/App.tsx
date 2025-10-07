import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TwentyFirstToolbar } from '@21st-extension/toolbar-react';
import { ReactPlugin } from '@21st-extension/react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { Leads } from './pages/Leads';
import { Agendamentos } from './pages/Agendamentos';
import PlanosAlimentares from './pages/PlanosAlimentares';
import Questionarios from './pages/Questionarios';
import QuestionariosBuilder from './pages/QuestionariosBuilder';
import Recordatorio from './pages/Recordatorio';
import { FeedbacksSemanais } from './pages/FeedbacksSemanais';
import Servicos from './pages/Servicos';
import { Mensagens } from './pages/Mensagens';
import Lembretes from './pages/Lembretes';
import { AgenteIA } from './pages/AgenteIA';
import { BaseConhecimento } from './pages/BaseConhecimento';
import Relatorios from './pages/Relatorios';
import Financeiro from './pages/Financeiro';
import { Configuracoes } from './pages/Configuracoes';
import PublicQuestionnaireResponse from './pages/public/PublicQuestionnaireResponse';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <>
      <TwentyFirstToolbar 
        config={{
          plugins: [ReactPlugin]
        }}
      />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <Routes>
          {/* Rota pública para resposta de questionário */}
          <Route path="/questionario/:token" element={<PublicQuestionnaireResponse />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
            <Route path="/planos" element={<PlanosAlimentares />} />
            <Route path="/questionarios" element={<Questionarios />} />
            <Route path="/questionarios/novo" element={<QuestionariosBuilder />} />
            <Route path="/questionarios/:id/editar" element={<QuestionariosBuilder />} />
            <Route path="/recordatorio" element={<Recordatorio />} />
            <Route path="/feedbacks" element={<FeedbacksSemanais />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/mensagens" element={<Mensagens />} />
            <Route path="/lembretes" element={<Lembretes />} />
            <Route path="/agente-ia" element={<AgenteIA />} />
            <Route path="/base-conhecimento" element={<BaseConhecimento />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            {/* Redirect old /platform/* routes to main routes */}
            <Route path="/platform/:slug" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        </BrowserRouter>
        <Toaster />
      </QueryClientProvider>
    </>
  );
}

export default App;
