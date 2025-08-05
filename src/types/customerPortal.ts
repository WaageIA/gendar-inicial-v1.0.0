export interface CustomerPortalSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  business_name: string;
  business_slug: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  allow_cancellation: boolean;
  cancellation_hours_limit: number;
  allow_rescheduling: boolean;
  reschedule_hours_limit: number;
  email_notifications: boolean;
  sms_notifications: boolean;
  welcome_message?: string;
  terms_url?: string;
  privacy_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerPortalSettings {
  business_name: string;
  business_slug: string;
  enabled?: boolean;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  allow_cancellation?: boolean;
  cancellation_hours_limit?: number;
  allow_rescheduling?: boolean;
  reschedule_hours_limit?: number;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  welcome_message?: string;
  terms_url?: string;
  privacy_url?: string;
}