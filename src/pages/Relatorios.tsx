import React from 'react';
import { Users, Calendar, CheckCircle, DollarSign, TrendingUp, FileText, UserPlus } from 'lucide-react';
import { MainStatCard } from '@/components/relatorios/MainStatCard';
import { SecondaryStatCard } from '@/components/relatorios/SecondaryStatCard';
import { ChartSection } from '@/components/relatorios/ChartSection';

export default function Relatorios() {
  const consultasData = [
    { month: 'set de 25', value: 0, subtitle: '0% taxa', percentage: 10 },
    { month: 'ago de 25', value: 0, subtitle: '0% taxa', percentage: 0 },
    { month: 'jul de 25', value: 0, subtitle: '0% taxa', percentage: 0 },
    { month: 'jun de 25', value: 0, subtitle: '0% taxa', percentage: 0 },
    { month: 'mai de 25', value: 0, subtitle: '0% taxa', percentage: 0 },
    { month: 'abr de 25', value: 0, subtitle: '0% taxa', percentage: 0 }
  ];

  const receitaData = [
    { month: 'set de 25', value: 'R$ 0', subtitle: 'média 0', percentage: 0 },
    { month: 'ago de 25', value: 'R$ 0', subtitle: 'média 0', percentage: 0 },
    { month: 'jul de 25', value: 'R$ 0', subtitle: 'média 0', percentage: 0 },
    { month: 'jun de 25', value: 'R$ 0', subtitle: 'média 0', percentage: 0 },
    { month: 'mai de 25', value: 'R$ 0', subtitle: 'média 0', percentage: 0 },
    { month: 'abr de 25', value: 'R$ 0', subtitle: 'média 0', percentage: 0 },
    { month: 'mar de 25', value: 'R$ 250', subtitle: 'média 0', percentage: 100 }
  ];

  const novosClientesData = [
    { month: 'set de 25', value: 3, subtitle: 'novos', percentage: 100 },
    { month: 'ago de 25', value: 0, subtitle: 'novos', percentage: 0 },
    { month: 'jul de 25', value: 0, subtitle: 'novos', percentage: 0 },
    { month: 'jun de 25', value: 0, subtitle: 'novos', percentage: 0 },
    { month: 'mai de 25', value: 0, subtitle: 'novos', percentage: 0 },
    { month: 'abr de 25', value: 0, subtitle: 'novos', percentage: 0 }
  ];

  const comparecimentoData = [
    { month: 'set de 25', value: '0%', subtitle: '0 de 1', percentage: 0 },
    { month: 'ago de 25', value: '0%', subtitle: '0 de 0', percentage: 0 },
    { month: 'jul de 25', value: '0%', subtitle: '0 de 0', percentage: 0 },
    { month: 'jun de 25', value: '0%', subtitle: '0 de 0', percentage: 0 },
    { month: 'mai de 25', value: '0%', subtitle: '0 de 0', percentage: 0 },
    { month: 'abr de 25', value: '0%', subtitle: '0 de 0', percentage: 0 }
  ];

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Relatórios e Analytics
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.7 }}>
            Acompanhe a evolução do seu consultório
          </p>
        </div>

        {/* Main Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <MainStatCard
            label="Total de Clientes"
            value={0}
            subtitle="0 ativos (60 dias)"
            icon={<Users className="w-7 h-7" />}
            variant="blue"
          />
          <MainStatCard
            label="Consultas Realizadas"
            value={0}
            subtitle="de 0 agendadas"
            icon={<Calendar className="w-7 h-7" />}
            variant="green"
          />
          <MainStatCard
            label="Taxa de Comparecimento"
            value="0%"
            subtitle="histórico geral"
            icon={<CheckCircle className="w-7 h-7" />}
            variant="purple"
          />
          <MainStatCard
            label="Receita Total"
            value="0.00"
            subtitle="todo o período"
            icon={<DollarSign className="w-7 h-7" />}
            variant="orange"
          />
        </div>

        {/* Secondary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <SecondaryStatCard
            title="Planos Alimentares Ativos"
            value={0}
            subtitle="clientes com plano ativo"
            icon={<TrendingUp className="w-5 h-5" />}
            variant="green"
          />
          <SecondaryStatCard
            title="Questionários Respondidos"
            value={0}
            subtitle="respostas completas"
            icon={<FileText className="w-5 h-5" />}
            variant="blue"
          />
        </div>

        {/* Charts */}
        <ChartSection
          title="Consultas por Mês"
          icon={<Calendar className="w-[18px] h-[18px]" />}
          totalValue="1"
          data={consultasData}
          variant="blue"
        />

        <ChartSection
          title="Receita por Mês"
          icon={<DollarSign className="w-[18px] h-[18px]" />}
          totalValue="R$ 250"
          data={receitaData}
          variant="green"
        />

        <ChartSection
          title="Novos Clientes"
          icon={<UserPlus className="w-[18px] h-[18px]" />}
          totalValue="3"
          data={novosClientesData}
          variant="purple"
        />

        <ChartSection
          title="Taxa de Comparecimento"
          icon={<CheckCircle className="w-[18px] h-[18px]" />}
          totalValue="0%"
          data={comparecimentoData}
          variant="red"
        />
      </div>
    </div>
  );
}
