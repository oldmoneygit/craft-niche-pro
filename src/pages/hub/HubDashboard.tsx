import React from 'react';
import { GridGradientBackground } from '@/components/hub/GridGradientBackground';
import { HubSidebar } from '@/components/hub/HubSidebar';
import { StatCard } from '@/components/hub/StatCard';
import { PlatformCard } from '@/components/hub/PlatformCard';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
import { DollarSign, Users, Package, TrendingUp } from 'lucide-react';

export function HubDashboard() {
  return (
    <>
      <GridGradientBackground />

      <div className="flex min-h-screen">
        <HubSidebar />

        <main className="flex-1 p-10 relative z-10 transition-colors duration-300">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--hub-text-primary)' }}>
              Dashboard Hub
            </h1>
            <p style={{ color: 'var(--hub-text-tertiary)' }}>
              Gestão centralizada das plataformas KorLab
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard
              variant="revenue"
              label="Receita Mensal"
              value="R$ 284.7K"
              change={{ value: '+12.5% vs mês anterior', positive: true }}
              icon={DollarSign}
            />
            <StatCard
              variant="clients"
              label="Total de Clientes"
              value="1,247"
              change={{ value: '+8.2% este mês', positive: true }}
              icon={Users}
            />
            <StatCard
              variant="modules"
              label="Módulos Ativos"
              value="156"
              change={{ value: '+24 novos', positive: true }}
              icon={Package}
            />
            <StatCard
              variant="growth"
              label="Taxa de Crescimento"
              value="23.8%"
              change={{ value: 'Anual', positive: true }}
              icon={TrendingUp}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold" style={{ color: 'var(--hub-text-primary)' }}>
                Plataformas por Vertical
              </h2>
              <a href="#" className="text-indigo-500 hover:text-indigo-400 font-semibold text-sm">
                Ver todas →
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PlatformCard
                vertical="nutrition"
                title="NutriPro Manager"
                subtitle="Nutrição Clínica"
                badge="Nutrição"
                metrics={[
                  { label: 'Nutricionistas', value: '89' },
                  { label: 'Pacientes', value: '1,542' },
                  { label: 'Planos', value: '423' },
                  { label: 'Templates', value: '67' },
                ]}
              />

              <PlatformCard
                vertical="fitness"
                title="FitTrack Pro"
                subtitle="Educação Física"
                badge="Fitness"
                metrics={[
                  { label: 'Profissionais', value: '134' },
                  { label: 'Alunos', value: '2,891' },
                  { label: 'Treinos', value: '1,284' },
                  { label: 'Avaliações', value: '892' },
                ]}
              />

              <PlatformCard
                vertical="wellness"
                title="WellnessHub"
                subtitle="Bem-estar Corporativo"
                badge="Wellness"
                metrics={[
                  { label: 'Empresas', value: '23' },
                  { label: 'Colaboradores', value: '4,782' },
                  { label: 'Programas', value: '156' },
                  { label: 'Engajamento', value: '87%' },
                ]}
              />

              <PlatformCard
                vertical="mental"
                title="MindCare Connect"
                subtitle="Saúde Mental"
                badge="Mental"
                metrics={[
                  { label: 'Psicólogos', value: '67' },
                  { label: 'Pacientes', value: '1,124' },
                  { label: 'Sessões/mês', value: '892' },
                  { label: 'Satisfação', value: '94%' },
                ]}
              />
            </div>
          </div>
        </main>

        <ThemeToggle />
      </div>
    </>
  );
}
