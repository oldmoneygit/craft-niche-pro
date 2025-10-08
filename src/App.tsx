import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from '@/components/ui/toaster';
import { TwentyFirstToolbar } from '@21st-extension/toolbar-react';
import { ReactPlugin } from '@21st-extension/react';
import { Layout } from './components/layout/Layout';
import LandingLayout from './layouts/LandingLayout';

// Admin Pages
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

// Landing Pages
import Home from './pages/landing/Home';
import About from './pages/landing/About';
import Privacy from './pages/landing/Privacy';
import Terms from './pages/landing/Terms';
import Contact from './pages/landing/Contact';
import Blog from './pages/landing/Blog';
import BlogPost from './pages/landing/BlogPost';
import Help from './pages/landing/Help';
import Cookies from './pages/landing/Cookies';
import Security from './pages/landing/Security';
import Status from './pages/landing/Status';

function App() {
  return (
    <>
      <TwentyFirstToolbar 
        config={{
          plugins: [ReactPlugin]
        }}
      />
      <QueryProvider>
        <BrowserRouter>
        <Routes>
          {/* LANDING PAGE ROUTES (Público) */}
          <Route path="/" element={<LandingLayout />}>
            <Route index element={<Home />} />
            <Route path="sobre" element={<About />} />
            <Route path="privacidade" element={<Privacy />} />
            <Route path="termos" element={<Terms />} />
            <Route path="contato" element={<Contact />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="ajuda" element={<Help />} />
            <Route path="cookies" element={<Cookies />} />
            <Route path="seguranca" element={<Security />} />
            <Route path="status" element={<Status />} />
          </Route>

          {/* Rota pública para resposta de questionário */}
          <Route path="/questionario/:token" element={<PublicQuestionnaireResponse />} />
          
          {/* ADMIN ROUTES (Plataforma) */}
          <Route path="/app" element={<Layout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="leads" element={<Leads />} />
            <Route path="agendamentos" element={<Agendamentos />} />
            <Route path="planos" element={<PlanosAlimentares />} />
            <Route path="questionarios" element={<Questionarios />} />
            <Route path="questionarios/novo" element={<QuestionariosBuilder />} />
            <Route path="questionarios/:id/editar" element={<QuestionariosBuilder />} />
            <Route path="recordatorio" element={<Recordatorio />} />
            <Route path="feedbacks" element={<FeedbacksSemanais />} />
            <Route path="servicos" element={<Servicos />} />
            <Route path="mensagens" element={<Mensagens />} />
            <Route path="lembretes" element={<Lembretes />} />
            <Route path="agente-ia" element={<AgenteIA />} />
            <Route path="base-conhecimento" element={<BaseConhecimento />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
        <Toaster />
      </QueryProvider>
    </>
  );
}

export default App;
