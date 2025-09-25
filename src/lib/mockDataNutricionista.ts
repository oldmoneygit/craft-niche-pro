// Mock data for Gabriel Gandin Nutricionista Platform

export const mockNutriData = {
  user: {
    name: "Gabriel Gandin",
    email: "gabriel@gabrielgandin.com.br",
    specialty: "Nutricionista Clínico",
    crn: "CRN-3 45678",
    registrationDate: "2019-03-15",
    avatar: "/placeholder-avatar.jpg"
  },

  clinicInfo: {
    name: "Gabriel Gandin Nutricionista",
    address: "Rua das Palmeiras, 123 - Vila Madalena, São Paulo - SP",
    phone: "(11) 99999-9999",
    email: "contato@gabrielgandin.com.br",
    totalPatients: 120,
    activePatients: 105,
    monthlyRevenue: 18500,
    renovationRate: 85
  },

  dashboardMetrics: {
    patientsActive: 120,
    consultationsToday: 5,
    nextWeekConsultations: 15,
    monthlyRevenue: 18500,
    renovationRate: 85,
    plansExpiring: 10,
    inactivePatients: 5,
    pendingTasks: 3
  },

  recentActivity: [
    { type: "new_patient", message: "Novo Paciente: Ana Silva", time: "2h atrás", icon: "UserPlus" },
    { type: "consultation", message: "Consulta Realizada: João Pereira", time: "4h atrás", icon: "Calendar" },
    { type: "plan_renewed", message: "Plano Renovado: Maria Souza", time: "6h atrás", icon: "RefreshCw" },
    { type: "payment", message: "Pagamento Recebido: Carlos Lima - R$ 350", time: "1d atrás", icon: "DollarSign" },
    { type: "chat", message: "Mensagem IA enviada para 15 pacientes", time: "2d atrás", icon: "Bot" }
  ],

  patients: [
    {
      id: 1,
      name: "Ana Silva",
      email: "ana.silva@email.com",
      phone: "(11) 98765-4321",
      age: 32,
      plan: "Mensal",
      planPrice: 350,
      startDate: "2024-01-15",
      expiryDate: "2024-12-15",
      lastConsultation: "2024-11-20",
      status: "Ativo",
      weight: [68.5, 67.8, 67.2, 66.9],
      goal: "Emagrecimento",
      notes: "Paciente muito dedicada, segue bem o plano alimentar."
    },
    {
      id: 2,
      name: "João Pereira", 
      email: "joao.pereira@email.com",
      phone: "(11) 98765-4322",
      age: 45,
      plan: "Trimestral",
      planPrice: 900,
      startDate: "2024-09-01",
      expiryDate: "2024-12-01",
      lastConsultation: "2024-11-18",
      status: "Ativo",
      weight: [82.3, 81.5, 80.8, 79.9],
      goal: "Controle do Diabetes",
      notes: "Diabetes Tipo 2 controlado, excelente adesão às orientações."
    },
    {
      id: 3,
      name: "Maria Souza",
      email: "maria.souza@email.com", 
      phone: "(11) 98765-4323",
      age: 28,
      plan: "Semestral",
      planPrice: 1600,
      startDate: "2024-06-01",
      expiryDate: "2024-12-01",
      lastConsultation: "2024-11-15",
      status: "Ativo",
      weight: [58.2, 59.1, 59.8, 60.2],
      goal: "Ganho de Massa Muscular",
      notes: "Atleta amadora, foco em performance e composição corporal."
    },
    {
      id: 4,
      name: "Carlos Lima",
      email: "carlos.lima@email.com",
      phone: "(11) 98765-4324", 
      age: 38,
      plan: "Mensal",
      planPrice: 350,
      startDate: "2024-10-01",
      expiryDate: "2024-11-30",
      lastConsultation: "2024-10-15",
      status: "Vencendo",
      weight: [95.4, 94.2, 93.8, 92.5],
      goal: "Emagrecimento",
      notes: "Executivo com pouco tempo, precisa de planos práticos."
    },
    {
      id: 5,
      name: "Fernanda Costa",
      email: "fernanda.costa@email.com",
      phone: "(11) 98765-4325",
      age: 25,
      plan: "Mensal", 
      planPrice: 350,
      startDate: "2024-08-15",
      expiryDate: "2024-10-15",
      lastConsultation: "2024-09-30",
      status: "Inativo",
      weight: [62.1, 61.8, 61.5, 61.0],
      goal: "Manutenção",
      notes: "Paciente não retornou após vencimento do plano."
    }
  ],

  appointments: [
    {
      id: 1,
      patientName: "Ana Silva",
      date: "2024-11-25",
      time: "09:00",
      type: "Presencial",
      status: "Agendado",
      notes: "Consulta de acompanhamento mensal"
    },
    {
      id: 2, 
      patientName: "João Pereira",
      date: "2024-11-25",
      time: "10:30", 
      type: "Online",
      status: "Agendado",
      notes: "Revisão do plano alimentar"
    },
    {
      id: 3,
      patientName: "Maria Souza", 
      date: "2024-11-25",
      time: "14:00",
      type: "Presencial", 
      status: "Agendado",
      notes: "Avaliação corporal completa"
    },
    {
      id: 4,
      patientName: "Carlos Lima",
      date: "2024-11-26", 
      time: "08:30",
      type: "Online",
      status: "Agendado", 
      notes: "Consulta de renovação do plano"
    },
    {
      id: 5,
      patientName: "Lucia Santos",
      date: "2024-11-26",
      time: "16:00",
      type: "Presencial",
      status: "Agendado",
      notes: "Primeira consulta"
    }
  ],

  mealPlans: [
    {
      id: 1,
      name: "Plano Emagrecimento - Ana Silva",
      patientId: 1,
      createdDate: "2024-11-01", 
      calories: 1400,
      status: "Ativo",
      type: "Emagrecimento"
    },
    {
      id: 2,
      name: "Plano Diabetes - João Pereira", 
      patientId: 2,
      createdDate: "2024-10-15",
      calories: 1800,
      status: "Ativo", 
      type: "Controle Glicêmico"
    },
    {
      id: 3,
      name: "Plano Hipertrofia - Maria Souza",
      patientId: 3, 
      createdDate: "2024-10-20",
      calories: 2200,
      status: "Ativo",
      type: "Ganho de Massa"
    }
  ],

  templates: [
    { id: 1, name: "Emagrecimento Feminino 1400kcal", type: "Emagrecimento", calories: 1400 },
    { id: 2, name: "Emagrecimento Masculino 1800kcal", type: "Emagrecimento", calories: 1800 },
    { id: 3, name: "Diabético 1600kcal", type: "Controle Glicêmico", calories: 1600 },
    { id: 4, name: "Hipertrofia Feminina 2000kcal", type: "Ganho de Massa", calories: 2000 },
    { id: 5, name: "Hipertrofia Masculina 2500kcal", type: "Ganho de Massa", calories: 2500 }
  ],

  financialData: {
    monthlyRevenue: 18500,
    monthlyExpenses: 3200,
    monthlyProfit: 15300,
    revenueChart: [
      { month: "Jul", revenue: 14500, expenses: 2800 },
      { month: "Ago", revenue: 16200, expenses: 3000 },
      { month: "Set", revenue: 17800, expenses: 3100 },
      { month: "Out", revenue: 18500, expenses: 3200 },
      { month: "Nov", revenue: 19200, expenses: 3300 }
    ],
    transactions: [
      { id: 1, type: "Receita", description: "Plano Mensal - Ana Silva", amount: 350, date: "2024-11-20", status: "Pago" },
      { id: 2, type: "Receita", description: "Plano Trimestral - João Pereira", amount: 900, date: "2024-11-18", status: "Pago" },
      { id: 3, type: "Despesa", description: "Software de Gestão", amount: -89, date: "2024-11-15", status: "Pago" },
      { id: 4, type: "Receita", description: "Plano Semestral - Maria Souza", amount: 1600, date: "2024-11-12", status: "Pago" },
      { id: 5, type: "Despesa", description: "Material de Escritório", amount: -120, date: "2024-11-10", status: "Pago" }
    ],
    pendingPayments: [
      { id: 1, patientName: "Carlos Lima", amount: 350, dueDate: "2024-11-30", plan: "Mensal" },
      { id: 2, patientName: "Fernanda Costa", amount: 350, dueDate: "2024-10-15", plan: "Mensal", overdue: true }
    ]
  },

  chatMessages: [
    {
      id: 1,
      patientName: "Ana Silva",
      message: "Olá Dr. Gabriel, posso substituir o frango por peixe no almoço?",
      time: "10:30",
      type: "received",
      answered: true
    },
    {
      id: 2, 
      patientName: "João Pereira",
      message: "Bom dia! Como posso controlar a fome entre as refeições?",
      time: "09:15",
      type: "received", 
      answered: false
    },
    {
      id: 3,
      patientName: "IA Assistant", 
      message: "Mensagem automática enviada para 15 pacientes sobre renovação de planos",
      time: "08:00",
      type: "system",
      answered: true
    }
  ],

  analyticsData: {
    patientsEvolution: [
      { month: "Jul", total: 95, active: 85, new: 12 },
      { month: "Ago", total: 102, active: 92, new: 15 },
      { month: "Set", total: 108, active: 98, new: 18 },
      { month: "Out", total: 115, active: 105, new: 20 },
      { month: "Nov", total: 120, active: 110, new: 14 }
    ],
    planDistribution: [
      { name: "Mensal", value: 60, color: "#22c55e" },
      { name: "Trimestral", value: 35, color: "#3b82f6" }, 
      { name: "Semestral", value: 25, color: "#f59e0b" }
    ],
    renewalRate: 85,
    averageWeight: [
      { month: "Jul", avgLoss: 2.3 },
      { month: "Ago", avgLoss: 2.8 },
      { month: "Set", avgLoss: 3.1 },
      { month: "Out", avgLoss: 2.9 },
      { month: "Nov", avgLoss: 3.2 }
    ]
  }
};