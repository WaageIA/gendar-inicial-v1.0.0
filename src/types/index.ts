import { Appointment, AppointmentStatus, CreateAppointmentData, AvailableSlot } from './appointment';
import { Client, LoyaltyLevel, CreateClientData } from './client';
import { Customer, CustomerData, CreateCustomerData } from './customer';
import { Professional, CreateProfessionalData } from './professional';
import { Service, ServiceOffering } from './service';
import { CustomerPortalSettings, CreateCustomerPortalSettings } from './customerPortal';

// Re-export all types
export type { 
  Appointment, 
  AppointmentStatus, 
  CreateAppointmentData, 
  AvailableSlot,
  Client, 
  LoyaltyLevel, 
  CreateClientData,
  Customer,
  CustomerData,
  CreateCustomerData,
  Professional,
  CreateProfessionalData,
  Service, 
  ServiceOffering,
  CustomerPortalSettings,
  CreateCustomerPortalSettings
};

export type SocialMediaLink = {
  platform: string; // Ex: 'instagram', 'facebook', 'whatsapp'
  url: string;
};

export type ContactInfo = {
  phone?: string;
  email?: string;
  website?: string;
};

export type DigitalBusinessCard = {
  id: string; // ID único (ex: 'default' para o cartão do usuário)
  logoUrl?: string;
  businessName: string;
  tagline?: string;
  primaryColor: string; // Cor principal em formato HEX
  secondaryColor: string; // Cor secundária em formato HEX
  contact: ContactInfo;
  socialMedia: SocialMediaLink[];
  services: ServiceOffering[];
  qrCodeUrl?: string; // URL para o QR Code gerado
  cardUrl?: string; // URL pública do cartão digital
};