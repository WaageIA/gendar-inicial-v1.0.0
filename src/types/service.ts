export interface Service {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceOffering {
  name: string;
  description?: string;
}