export interface ClientConfig {
  id: string;
  name: string;
  businessType: string;
  subdomain: string;
  theme: ClientTheme;
  modules: EnabledModules;
  settings: ClientSettings;
  branding: ClientBranding;
}

export interface ClientTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  customCss?: string;
}

export interface EnabledModules {
  clientManagement: boolean;
  whatsappChat: boolean;
  aiAgent: boolean;
  analytics: boolean;
  scheduling: boolean;
  questionnaires?: boolean;
  mealPlans?: boolean;
  medicalRecords?: boolean;
  financialReports?: boolean;
}

export interface ClientSettings {
  language: string;
  timezone: string;
  currency: string;
  businessHours: BusinessHours;
  notifications: NotificationSettings;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  push: boolean;
}

export interface ClientBranding {
  companyName: string;
  logoUrl?: string;
  faviconUrl?: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export type BusinessType = 
  | 'nutrition'
  // Future business types will be added here when implemented
  // | 'psychology'
  // | 'fitness'
  // | 'clinic';