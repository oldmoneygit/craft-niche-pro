/**
 * Dados de teste para os testes E2E - KorLab Nutri
 * Fixtures com dados válidos para diferentes cenários de teste
 */

module.exports = {
  // Dados de usuário para testes
  users: {
    validUser: {
      email: 'nutricionista@kornutri.com',
      password: 'Nutri123!',
      name: 'Dr. João Nutricionista',
      tenant: 'kornutri-clinic',
    },
    invalidUser: {
      email: 'invalid@test.com',
      password: 'wrongpassword',
    },
    newUser: {
      email: 'novo.nutricionista@kornutri.com',
      password: 'NewNutri123!',
      name: 'Dr. Maria Nutricionista',
    },
  },

  // Dados de clientes para testes
  clients: {
    validClient: {
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999',
      birth_date: '1990-05-15',
      height_cm: 175,
      weight_kg: 70,
      goal: 'Perda de peso',
      activity_level: 'moderada',
      notes: 'Cliente de teste E2E',
    },
    minimalClient: {
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(11) 88888-8888',
    },
    invalidClient: {
      name: '', // Nome obrigatório vazio
      email: 'email-invalido',
      phone: '123', // Telefone inválido
    },
  },

  // Dados de questionários para testes
  questionnaires: {
    validQuestionnaire: {
      title: 'Questionário de Avaliação Nutricional',
      category: 'Avaliação Inicial',
      description: 'Questionário para avaliação inicial do cliente',
      estimated_time: 15,
      questions: [
        {
          question_text: 'Qual é o seu objetivo principal?',
          question_type: 'single_choice',
          options: ['Perda de peso', 'Ganho de peso', 'Manutenção', 'Melhora da saúde'],
          is_required: true,
          order_index: 0,
          scorable: true,
          weight: 10,
        },
        {
          question_text: 'Quantas refeições você faz por dia?',
          question_type: 'number',
          is_required: true,
          order_index: 1,
          scorable: true,
          weight: 5,
        },
        {
          question_text: 'Descreva seus hábitos alimentares atuais:',
          question_type: 'textarea',
          is_required: false,
          order_index: 2,
          scorable: false,
        },
      ],
    },
    minimalQuestionnaire: {
      title: 'Questionário Simples',
      category: 'Teste',
      questions: [
        {
          question_text: 'Pergunta de teste?',
          question_type: 'yes_no',
          is_required: true,
          order_index: 0,
        },
      ],
    },
  },

  // Dados de planos alimentares para testes
  mealPlans: {
    validMealPlan: {
      title: 'Plano de Emagrecimento',
      description: 'Plano alimentar para perda de peso saudável',
      target_calories: 1500,
      client_id: null, // Será preenchido dinamicamente
      meals: [
        {
          name: 'Café da Manhã',
          time: '08:00',
          foods: [
            {
              name: 'Aveia',
              quantity: 50,
              unit: 'g',
              calories: 180,
            },
            {
              name: 'Banana',
              quantity: 1,
              unit: 'unidade',
              calories: 90,
            },
          ],
        },
        {
          name: 'Almoço',
          time: '12:30',
          foods: [
            {
              name: 'Frango grelhado',
              quantity: 150,
              unit: 'g',
              calories: 250,
            },
            {
              name: 'Arroz integral',
              quantity: 80,
              unit: 'g',
              calories: 280,
            },
          ],
        },
      ],
    },
  },

  // Dados de agendamentos para testes
  appointments: {
    validAppointment: {
      client_id: null, // Será preenchido dinamicamente
      date: '2024-12-15',
      time: '14:00',
      duration: 60,
      type: 'Consulta',
      notes: 'Consulta de acompanhamento',
      status: 'scheduled',
    },
  },

  // Dados de leads para testes
  leads: {
    validLead: {
      name: 'Carlos Interessado',
      email: 'carlos@interessado.com',
      phone: '(11) 77777-7777',
      source: 'Website',
      status: 'new',
      notes: 'Interessado em consulta nutricional',
    },
  },

  // URLs e seletores para testes
  selectors: {
    // Autenticação
    loginForm: 'form[data-testid="login-form"]',
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    loginButton: 'button[type="submit"]',
    
    // Navegação
    navigation: '[data-testid="navigation"]',
    dashboard: '[data-testid="dashboard"]',
    userMenu: '[data-testid="user-menu"]',
    logoutButton: '[data-testid="logout-button"]',
    
    // Clientes
    clientForm: 'form[data-testid="client-form"]',
    clientList: '[data-testid="client-list"]',
    addClientButton: '[data-testid="add-client-button"]',
    
    // Questionários
    questionnaireForm: 'form[data-testid="questionnaire-form"]',
    questionnaireList: '[data-testid="questionnaire-list"]',
    addQuestionButton: '[data-testid="add-question-button"]',
    
    // Mensagens
    successMessage: '[data-testid="success-message"]',
    errorMessage: '[data-testid="error-message"]',
    loadingSpinner: '[data-testid="loading-spinner"]',
    
    // Modais
    modal: '[data-testid="modal"]',
    modalClose: '[data-testid="modal-close"]',
    confirmButton: '[data-testid="confirm-button"]',
    cancelButton: '[data-testid="cancel-button"]',
  },

  // Timeouts específicos
  timeouts: {
    short: 2000,
    medium: 5000,
    long: 10000,
    veryLong: 30000,
  },

  // Configurações de teste
  testConfig: {
    // Screenshots
    takeScreenshots: true,
    screenshotPath: './tests/screenshots',
    
    // Vídeos
    recordVideos: false,
    videoPath: './tests/videos',
    
    // Logs
    verbose: true,
    logLevel: 'info',
    
    // Retry
    retries: 2,
    retryDelay: 1000,
  },
};
