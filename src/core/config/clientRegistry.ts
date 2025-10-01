import { ClientConfig, BusinessType } from '../types/client';

// Simplified config for nutritionist platform only
export const mockClientConfigs: Record<string, ClientConfig> = {
  'gabriel-gandin': {
    id: 'gabriel-gandin',
    name: 'Gabriel Gandin - Nutricionista',
    businessType: 'nutrition',
    subdomain: 'gabriel-gandin',
    theme: {
      primaryColor: '142 69% 58%',
      secondaryColor: '217 91% 60%',
      accentColor: '142 69% 95%',
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
        primary: '142 69% 58%',
        secondary: '217 91% 60%',
        accent: '142 69% 95%',
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
  // Simplified - only nutritionist modules
  return {
    clientManagement: true,
    whatsappChat: true,
    aiAgent: true,
    analytics: true,
    scheduling: true,
    questionnaires: true,
    mealPlans: true,
  };
}