import { Appointment } from './appointment';
import { Client } from './client';
import { Expense } from './expense';
import { FinancialTransaction } from './financial';
import { Service } from './service';
import { User } from './user';

export type { Appointment, Client, Expense, FinancialTransaction, Service, User };

export type SocialMediaLink = {
  platform: string; // Ex: 'instagram', 'facebook', 'whatsapp'
  url: string;
};

export type ServiceOffering = {
  name: string;
  description?: string;
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