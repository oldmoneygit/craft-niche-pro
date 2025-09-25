export const academiaMembers = [
  {
    id: 1,
    name: "Carlos Silva",
    email: "carlos@email.com",
    phone: "(11) 99999-0001",
    plan: "Mensal Musculação",
    planExpiry: "2024-02-15",
    joinDate: "2023-08-15",
    status: "Ativo",
    checkIns: 42,
    lastCheckIn: "2024-01-10",
    emergencyContact: "Maria Silva - (11) 88888-0001",
    goals: "Ganho de massa muscular",
    trainer: "Prof. João"
  },
  {
    id: 2,
    name: "Ana Oliveira",
    email: "ana@email.com", 
    phone: "(11) 99999-0002",
    plan: "Anual Premium",
    planExpiry: "2024-08-20",
    joinDate: "2023-08-20",
    status: "Ativo",
    checkIns: 38,
    lastCheckIn: "2024-01-09",
    emergencyContact: "Pedro Oliveira - (11) 88888-0002",
    goals: "Perda de peso e condicionamento",
    trainer: "Prof. Carla"
  },
  {
    id: 3,
    name: "Roberto Santos",
    email: "roberto@email.com",
    phone: "(11) 99999-0003", 
    plan: "Mensal Crossfit",
    planExpiry: "2024-02-01",
    joinDate: "2023-11-01",
    status: "Pendente Renovação",
    checkIns: 25,
    lastCheckIn: "2024-01-05",
    emergencyContact: "Lucia Santos - (11) 88888-0003",
    goals: "Condicionamento físico",
    trainer: "Prof. Marcos"
  }
];

export const academiaPlans = [
  {
    id: 1,
    name: "Mensal Musculação",
    price: 89.90,
    duration: "30 dias",
    benefits: ["Acesso à musculação", "Avaliação física", "Suporte de professores"],
    active: true
  },
  {
    id: 2,
    name: "Anual Premium", 
    price: 79.90,
    duration: "12 meses",
    benefits: ["Todas as modalidades", "Personal trainer 2x/mês", "Nutricionista"],
    active: true
  },
  {
    id: 3,
    name: "Mensal Crossfit",
    price: 129.90,
    duration: "30 dias", 
    benefits: ["Aulas de crossfit", "Programação personalizada", "Competições"],
    active: true
  }
];

export const academiaClasses = [
  {
    id: 1,
    name: "Crossfit Iniciante",
    instructor: "Prof. Marcos",
    time: "07:00",
    date: "2024-01-11",
    duration: "60 min",
    capacity: 15,
    enrolled: 12,
    status: "Agendada"
  },
  {
    id: 2,
    name: "Yoga Matinal",
    instructor: "Prof. Carla",
    time: "08:00", 
    date: "2024-01-11",
    duration: "50 min",
    capacity: 20,
    enrolled: 18,
    status: "Agendada"
  },
  {
    id: 3,
    name: "Zumba",
    instructor: "Prof. Ana",
    time: "19:00",
    date: "2024-01-11", 
    duration: "45 min",
    capacity: 25,
    enrolled: 22,
    status: "Lotada"
  }
];

export const academiaStats = {
  totalMembers: 247,
  todayCheckIns: 89,
  scheduledClasses: 12,
  monthlyRenewals: 18,
  monthlyRevenue: 22150,
  activeMembers: 234,
  pendingRenewals: 13
};

export const academiaRecentActivity = [
  {
    id: 1,
    type: "check-in",
    member: "Carlos Silva",
    action: "Fez check-in",
    time: "2 min atrás"
  },
  {
    id: 2,
    type: "enrollment", 
    member: "Nova matrícula",
    action: "Mariana Costa se matriculou no Plano Mensal",
    time: "15 min atrás"
  },
  {
    id: 3,
    type: "class",
    member: "Prof. João",
    action: "Iniciou aula de Pilates",
    time: "30 min atrás"
  }
];

export const academiaEquipments = [
  {
    id: 1,
    name: "Esteira Profissional",
    brand: "Movement",
    status: "Funcionando",
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-02-05"
  },
  {
    id: 2,
    name: "Bicicleta Ergométrica",
    brand: "Kikos",
    status: "Manutenção",
    lastMaintenance: "2024-01-08",
    nextMaintenance: "2024-02-08"
  }
];