// Dados simulados para a plataforma

export const mockUser = {
  id: '1',
  name: 'Dr. Maria Silva',
  email: 'maria.silva@email.com',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
  plan: 'Profissional',
  createdAt: '2024-01-15',
};

export const mockPlatforms = [
  {
    id: '1',
    name: 'Clínica Mente Sã',
    type: 'clinica-psicologica',
    status: 'active',
    url: 'https://clinicamentesa.com.br',
    createdAt: '2024-03-15',
    monthlyVisits: 1250,
    totalPatients: 45,
    monthlyRevenue: 12500,
    aiInteractions: 340,
    description: 'Clínica especializada em terapia cognitivo-comportamental e atendimento psicológico.',
  },
];

export const mockAnalytics = {
  totalVisits: 1250,
  totalPatients: 45,
  totalRevenue: 12500,
  aiInteractions: 340,
  conversionRate: 15.6,
  averageSessionTime: '4m 32s',
  bounceRate: 32.4,
  monthlyGrowth: {
    visits: 18.2,
    patients: 12.5,
    revenue: 22.1,
    interactions: 45.3,
  },
  chartData: {
    visits: [
      { month: 'Jan', visits: 856, patients: 28 },
      { month: 'Fev', visits: 982, patients: 35 },
      { month: 'Mar', visits: 1250, patients: 45 },
      { month: 'Abr', visits: 1180, patients: 42 },
      { month: 'Mai', visits: 1350, patients: 48 },
      { month: 'Jun', visits: 1420, patients: 52 },
    ],
    revenue: [
      { month: 'Jan', revenue: 8400 },
      { month: 'Fev', revenue: 10500 },
      { month: 'Mar', revenue: 12500 },
      { month: 'Abr', revenue: 11800 },
      { month: 'Mai', revenue: 13200 },
      { month: 'Jun', revenue: 14600 },
    ],
  },
};

export const mockAppointments = [
  {
    id: '1',
    patientName: 'Ana Costa',
    date: '2024-12-26',
    time: '09:00',
    type: 'Terapia Individual',
    status: 'confirmed',
    duration: 50,
    notes: 'Primeira consulta - ansiedade generalizada',
  },
  {
    id: '2',
    patientName: 'João Santos',
    date: '2024-12-26',
    time: '10:30',
    type: 'Terapia de Casal',
    status: 'confirmed',
    duration: 60,
    notes: 'Sessão de continuidade - questões de comunicação',
  },
  {
    id: '3',
    patientName: 'Carla Oliveira',
    date: '2024-12-26',
    time: '14:00',
    type: 'Avaliação Psicológica',
    status: 'pending',
    duration: 90,
    notes: 'Avaliação neuropsicológica solicitada',
  },
  {
    id: '4',
    patientName: 'Pedro Lima',
    date: '2024-12-27',
    time: '09:30',
    type: 'Terapia Individual',
    status: 'confirmed',
    duration: 50,
    notes: 'Sessão semanal - transtorno do pânico',
  },
];

export const mockPatients = [
  {
    id: '1',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 98765-4321',
    birthDate: '1985-03-15',
    registeredAt: '2024-01-10',
    lastSession: '2024-12-20',
    totalSessions: 8,
    status: 'active',
    diagnosis: 'Transtorno de Ansiedade Generalizada',
    notes: 'Paciente apresenta boa evolução no tratamento com TCC.',
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao.santos@email.com',
    phone: '(11) 97654-3210',
    birthDate: '1978-07-22',
    registeredAt: '2024-02-05',
    lastSession: '2024-12-19',
    totalSessions: 12,
    status: 'active',
    diagnosis: 'Terapia de Casal',
    notes: 'Casal em processo de melhoria da comunicação.',
  },
  {
    id: '3',
    name: 'Carla Oliveira',
    email: 'carla.oliveira@email.com',
    phone: '(11) 96543-2109',
    birthDate: '1992-11-08',
    registeredAt: '2024-03-01',
    lastSession: '2024-12-18',
    totalSessions: 6,
    status: 'active',
    diagnosis: 'Episódio Depressivo',
    notes: 'Resposta positiva ao tratamento medicamentoso e psicoterapia.',
  },
];

export const mockChatMessages = [
  {
    id: '1',
    type: 'user',
    message: 'Oi, gostaria de agendar uma consulta',
    timestamp: '2024-12-25 14:30',
    patientName: 'Marina Silva',
    phone: '(11) 99887-6655',
  },
  {
    id: '2',
    type: 'ai',
    message: 'Olá Marina! Fico feliz em ajudar você a agendar sua consulta. Temos horários disponíveis para esta semana e a próxima. Você gostaria de uma consulta inicial ou já é nossa paciente?',
    timestamp: '2024-12-25 14:30',
  },
  {
    id: '3',
    type: 'user',
    message: 'É minha primeira vez, preciso de uma consulta inicial',
    timestamp: '2024-12-25 14:32',
    patientName: 'Marina Silva',
    phone: '(11) 99887-6655',
  },
  {
    id: '4',
    type: 'ai',
    message: 'Perfeito! Para primeira consulta reservamos 60 minutos. Temos as seguintes opções:\n\n📅 **Quinta-feira (26/12)**: 16:00h\n📅 **Sexta-feira (27/12)**: 10:30h ou 15:00h\n📅 **Segunda-feira (30/12)**: 09:00h ou 14:30h\n\nQual horário fica melhor para você?',
    timestamp: '2024-12-25 14:32',
  },
  {
    id: '5',
    type: 'user',
    message: 'Sexta-feira às 15:00h seria ideal!',
    timestamp: '2024-12-25 14:35',
    patientName: 'Marina Silva',
    phone: '(11) 99887-6655',
  },
];

export const mockQuestionnaireData = {
  businessType: 'clinica-psicologica',
  businessName: 'Clínica Mente Sã',
  ownerName: 'Dra. Maria Silva',
  crp: 'CRP 06/123456',
  specialties: ['Terapia Cognitivo-Comportamental', 'Ansiedade', 'Depressão'],
  sessionTypes: ['Consulta Individual', 'Terapia de Casal', 'Avaliação Psicológica'],
  workingHours: {
    monday: '08:00-18:00',
    tuesday: '08:00-18:00',
    wednesday: '08:00-18:00',
    thursday: '08:00-18:00',
    friday: '08:00-17:00',
  },
  sessionDuration: {
    individual: 50,
    couple: 60,
    evaluation: 90,
  },
  pricing: {
    individual: 120,
    couple: 180,
    evaluation: 250,
  },
  insurances: ['Unimed', 'Bradesco Saúde', 'SulAmérica'],
  communicationPreference: 'WhatsApp',
  emergencyContact: '(11) 99999-9999',
};