export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  user_id: string;
  customer_id?: string;
  professional_id?: string;
  client_id: string;
  clientId: string; // Alias for compatibility
  client_name: string;
  clientName: string; // Alias for compatibility
  date: Date;
  service: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  location?: string;
  price: number;
}

export interface CreateAppointmentData {
  customer_id?: string;
  professional_id?: string;
  client_name: string;
  date: Date;
  service: string;
  duration: number;
  notes?: string;
  location?: string;
  price: number;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
  reason?: string;
}