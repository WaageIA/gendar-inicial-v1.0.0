export interface Customer {
  id: string;
  auth_user_id: string;
  client_id?: string;
  full_name: string;
  phone?: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerData {
  full_name: string;
  phone?: string;
  email: string;
}

export interface CreateCustomerData {
  full_name: string;
  phone?: string;
  email: string;
  client_id?: string;
}