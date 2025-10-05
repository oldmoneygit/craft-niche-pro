import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { Leads } from './pages/Leads';
import { Agendamentos } from './pages/Agendamentos';
import { PlanosAlimentares } from './pages/PlanosAlimentares';
import { Questionarios } from './pages/Questionarios';
import { Recordatorio } from './pages/Recordatorio';
import { FeedbacksSemanais } from './pages/FeedbacksSemanais';
import { Servicos } from './pages/Servicos';
import { Mensagens } from './pages/Mensagens';
import { Lembretes } from './pages/Lembretes';
import { AgenteIA } from './pages/AgenteIA';
import { BaseConhecimento } from './pages/BaseConhecimento';
import { Relatorios } from './pages/Relatorios';
import { Financeiro } from './pages/Financeiro';
import { Configuracoes } from './pages/Configuracoes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
          <Route path="/planos" element={<PlanosAlimentares />} />
          <Route path="/questionarios" element={<Questionarios />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
