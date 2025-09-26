import { ClientConfig, BusinessType } from '../types/client';

// Mock data para desenvolvimento - no futuro virá do backend
export const mockClientConfigs: Record<string, ClientConfig> = {
  'gabriel-gandin': {
    id: 'gabriel-gandin',
    name: 'Gabriel Gandin - Nutricionista',
    businessType: 'nutritionist',
    subdomain: 'gabriel-gandin',
    theme: {
      primaryColor: 'hsl(142, 71%, 45%)',
      secondaryColor: 'hsl(142, 33%, 24%)',
      accentColor: 'hsl(47, 96%, 53%)',
    },
    modules: {
      clientManagement: true,
      whatsappChat: true,
      aiAgent: true,
      analytics: true,
      scheduling: true,
      questionnaires: true,
      mealPlans: true,
    },
    settings: {
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      businessHours: {
        monday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
        tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
        wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
        thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
        friday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
        saturday: { isOpen: false, openTime: '00:00', closeTime: '00:00' },
        sunday: { isOpen: false, openTime: '00:00', closeTime: '00:00' },
      },
      notifications: {
        email: true,
        sms: false,
        whatsapp: true,
        push: true,
      },
    },
    branding: {
      companyName: 'Gabriel Gandin Nutrição',
      customColors: {
        primary: 'hsl(142, 71%, 45%)',
        secondary: 'hsl(142, 33%, 24%)',
        accent: 'hsl(47, 96%, 53%)',
      },
    },
  },
  'clinica-exemplo': {
    id: 'clinica-exemplo',
    name: 'Clínica Exemplo',
    businessType: 'clinic',
    subdomain: 'clinica-exemplo',
    theme: {
      primaryColor: 'hsl(210, 100%, 50%)',
      secondaryColor: 'hsl(210, 50%, 25%)',
      accentColor: 'hsl(120, 100%, 40%)',
    },
    modules: {
      clientManagement: true,
      whatsappChat: true,
      aiAgent: true,
      analytics: true,
      scheduling: true,
      medicalRecords: true,
    },
    settings: {
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      businessHours: {
        monday: { isOpen: true, openTime: '07:00', closeTime: '19:00' },
        tuesday: { isOpen: true, openTime: '07:00', closeTime: '19:00' },
        wednesday: { isOpen: true, openTime: '07:00', closeTime: '19:00' },
        thursday: { isOpen: true, openTime: '07:00', closeTime: '19:00' },
        friday: { isOpen: true, openTime: '07:00', closeTime: '19:00' },
        saturday: { isOpen: true, openTime: '08:00', closeTime: '12:00' },
        sunday: { isOpen: false, openTime: '00:00', closeTime: '00:00' },
      },
      notifications: {
        email: true,
        sms: true,
        whatsapp: true,
        push: true,
      },
    },
    branding: {
      companyName: 'Clínica Exemplo',
      customColors: {
        primary: 'hsl(210, 100%, 50%)',
        secondary: 'hsl(210, 50%, 25%)',
        accent: 'hsl(120, 100%, 40%)',
      },
    },
  },
};

export function getClientConfig(clientId: string): ClientConfig | null {
  return mockClientConfigs[clientId] || null;
}

export function getAllClients(): ClientConfig[] {
  return Object.values(mockClientConfigs);
}

export function getBusinessTypeModules(businessType: BusinessType) {
  const baseModules = {
    clientManagement: true,
    whatsappChat: true,
    aiAgent: true,
    analytics: true,
    scheduling: true,
  };

  switch (businessType) {
    case 'nutritionist':
      return { ...baseModules, questionnaires: true, mealPlans: true };
    case 'clinic':
      return { ...baseModules, medicalRecords: true };
    case 'salon':
      return { ...baseModules, servicesCatalog: true, loyaltyProgram: true };
    case 'fitness':
      return { ...baseModules, workoutPlans: true, nutritionTracking: true };
    default:
      return baseModules;
  }
}