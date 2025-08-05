export interface Professional {
  id: string;
  user_id?: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfessionalData {
  name: string;
  bio?: string;
  avatar_url?: string;
}