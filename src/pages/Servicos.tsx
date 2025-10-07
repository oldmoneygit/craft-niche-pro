import React, { useState } from 'react';
import { Plus, Package, CheckCircle, DollarSign } from 'lucide-react';
import { ServiceStatCard } from '@/components/servicos/ServiceStatCard';
import { ServiceCard } from '@/components/servicos/ServiceCard';
import { ServiceModal } from '@/components/servicos/ServiceModal';

export default function Servicos() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const services = [
    {
      title: 'Acompanhamento Mensal',
      description: 'Plano ideal para quem está começando a jornada nutricional com acompanhamento completo',
      duration: '30 dias',
      consultations: '4 consultas',
      modality: 'Online',
      price: 'R$ 297,00',
      period: 'por mês',
      variant: 'mensal' as const,
      isActive: true
    },
    {
      title: 'Acompanhamento Trimestral',
      description: 'Plano completo com economia e foco em resultados sustentáveis a médio prazo',
      duration: '90 dias',
      consultations: '12 consultas',
      modality: 'Híbrido',
      price: 'R$ 797,00',
      period: 'a cada 3 meses',
      variant: 'trimestral' as const,
      isActive: true
    },
    {
      title: 'Acompanhamento Semestral',
      description: 'Transformação completa com acompanhamento intensivo e resultados duradouros',
      duration: '180 dias',
      consultations: '24 consultas',
      modality: 'Presencial',
      price: 'R$ 1.497,00',
      period: 'a cada 6 meses',
      variant: 'semestral' as const,
      isActive: true
    },
    {
      title: 'Acompanhamento Anual VIP',
      description: 'Plano premium com máxima economia e comprometimento com mudança definitiva de hábitos',
      duration: '365 dias',
      consultations: '48 consultas',
      modality: 'Híbrido',
      price: 'R$ 2.697,00',
      period: 'por ano',
      variant: 'anual' as const,
      isActive: true
    }
  ];

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
              Serviços e Pacotes
            </h1>
            <p style={{ fontSize: '15px', opacity: 0.7 }}>
              Gerencie os planos de acompanhamento nutricional
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-dark)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus className="w-5 h-5" />
            Novo Serviço
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <ServiceStatCard label="Total de Serviços" value={4} icon={<Package className="w-6 h-6" />} variant="total" />
          <ServiceStatCard label="Serviços Ativos" value={4} icon={<CheckCircle className="w-6 h-6" />} variant="active" />
          <ServiceStatCard label="Receita Mensal Média" value="R$ 297" icon={<DollarSign className="w-6 h-6" />} variant="revenue" />
        </div>

        {/* Services Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>

      <ServiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
