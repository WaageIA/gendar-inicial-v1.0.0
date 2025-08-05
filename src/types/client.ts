export type LoyaltyLevel = 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  rating?: number;
  notes?: string;
  created_at: string;
  birth_date?: string;
  indicated_by?: string;
  indicated_by_name?: string;
  loyalty_points: number;
  loyalty_level: LoyaltyLevel;
}

export interface CreateClientData {
  name: string;
  phone?: string;
  email?: string;
  rating?: number;
  notes?: string;
  birth_date?: string;
  indicated_by?: string;
  indicated_by_name?: string;
}