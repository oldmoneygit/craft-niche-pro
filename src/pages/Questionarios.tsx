import React, { useState, useEffect } from 'react';
import { Plus, FileText, CheckCircle, MessageSquare, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { QuestionarioCard } from '@/components/questionarios/QuestionarioCard';
import { QuestionarioModal } from '@/components/questionarios/QuestionarioModal';

export default function Questionarios() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 
                    document.body.getAttribute('data-theme') ||
                    (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setIsDark(theme === 'dark');
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    return () => observer.disconnect();
  }, []);

  const filters = ['Todos', 'Anamnese', 'Hábitos', 'Recordatório', 'Satisfação'];

  const questionarios = [
    {
      title: 'Anamnese Nutricional Inicial',
      description: 'Avaliação completa do histórico clínico, hábitos alimentares e objetivos do paciente',
      category: 'anamnese' as const,
      isActive: true,
      questions: 24,
      duration: 15,
      responses: 87,
      completion: 92
    },
    {
      title: 'Avaliação de Hábitos Alimentares',
      description: 'Identificação de padrões alimentares, preferências e restrições do paciente',
      category: 'habitos' as const,
      isActive: true,
      questions: 18,
      duration: 10,
      responses: 65,
      completion: 88
    },
    {
      title: 'Recordatório Alimentar 24h',
      description: 'Registro detalhado de tudo que foi consumido nas últimas 24 horas',
      category: 'recordatorio' as const,
      isActive: true,
      questions: 12,
      duration: 8,
      responses: 143,
      completion: 95
    },
    {
      title: 'Pesquisa de Satisfação',
      description: 'Avaliação da experiência e resultados obtidos durante o acompanhamento',
      category: 'satisfacao' as const,
      isActive: true,
      questions: 8,
      duration: 5,
      responses: 52,
      completion: 78
    },
    {
      title: 'Questionário de Frequência Alimentar',
      description: 'Avaliação da frequência de consumo de diferentes grupos alimentares',
      category: 'habitos' as const,
      isActive: false,
      questions: 32,
      duration: 20,
      responses: 0,
      completion: null
    },
    {
      title: 'Avaliação Antropométrica',
      description: 'Medidas corporais, composição corporal e avaliação física do paciente',
      category: 'anamnese' as const,
      isActive: true,
      questions: 15,
      duration: 12,
      responses: 0,
      completion: null
    }
  ];

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
              Questionários
            </h1>
            <p style={{ color: isDark ? '#a3a3a3' : '#6b7280', fontSize: '15px' }}>
              Gerencie questionários e anamneses para seus pacientes
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: '#10b981',
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
              e.currentTarget.style.background = '#059669';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus className="w-5 h-5" />
            Novo Questionário
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard label="Total de Questionários" value={12} icon={<FileText className="w-6 h-6" />} variant="primary" />
          <StatCard label="Ativos" value={8} icon={<CheckCircle className="w-6 h-6" />} variant="success" />
          <StatCard label="Respostas Coletadas" value={347} icon={<MessageSquare className="w-6 h-6" />} variant="warning" />
          <StatCard label="Taxa de Conclusão" value="89%" icon={<TrendingUp className="w-6 h-6" />} variant="purple" />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                background: activeFilter === filter ? '#10b981' : (isDark ? 'rgba(26, 26, 26, 0.7)' : 'rgba(255, 255, 255, 0.9)'),
                backdropFilter: 'blur(10px)',
                color: activeFilter === filter ? 'white' : (isDark ? '#a3a3a3' : '#374151'),
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (activeFilter !== filter) {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.color = '#10b981';
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== filter) {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
                  e.currentTarget.style.color = isDark ? '#a3a3a3' : '#374151';
                }
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Questionários Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {questionarios.map((q, index) => (
            <QuestionarioCard key={index} {...q} />
          ))}
        </div>
      </div>

      <QuestionarioModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
