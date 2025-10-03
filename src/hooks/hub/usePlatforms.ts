import { useState, useEffect } from 'react';
import { Platform } from '@/types/hub';

const MOCK_PLATFORMS: Platform[] = [
  {
    id: '1',
    name: 'NutriPro Manager',
    slug: 'nutripro',
    vertical: 'nutrition',
    subtitle: 'Nutrição Clínica',
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    metrics: {
      professionals: 89,
      clients: 1542,
      templates: 67,
      monthly_revenue: 124700
    },
    features: ['Planos Alimentares', 'Anamnese', 'Bioimpedância', 'Teleconsulta']
  },
  {
    id: '2',
    name: 'FitTrack Pro',
    slug: 'fittrack',
    vertical: 'fitness',
    subtitle: 'Educação Física',
    status: 'active',
    created_at: '2024-02-20T10:00:00Z',
    metrics: {
      professionals: 134,
      clients: 2891,
      templates: 92,
      monthly_revenue: 89500
    },
    features: ['Treinos', 'Avaliação Física', 'Periodização', 'App Mobile']
  },
  {
    id: '3',
    name: 'WellnessHub',
    slug: 'wellness',
    vertical: 'wellness',
    subtitle: 'Bem-estar Corporativo',
    status: 'active',
    created_at: '2024-03-10T10:00:00Z',
    metrics: {
      professionals: 45,
      clients: 4782,
      templates: 34,
      monthly_revenue: 56800
    },
    features: ['Programas Corporativos', 'Desafios', 'Gamificação', 'Relatórios']
  },
  {
    id: '4',
    name: 'MindCare Connect',
    slug: 'mindcare',
    vertical: 'mental',
    subtitle: 'Saúde Mental',
    status: 'maintenance',
    created_at: '2024-04-05T10:00:00Z',
    metrics: {
      professionals: 67,
      clients: 1124,
      templates: 28,
      monthly_revenue: 45200
    },
    features: ['Terapia Online', 'Protocolos', 'Escalas', 'Prontuário']
  }
];

export function usePlatforms() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setPlatforms(MOCK_PLATFORMS);
      setLoading(false);
    }, 500);
  }, []);

  return {
    platforms,
    loading,
    error
  };
}
