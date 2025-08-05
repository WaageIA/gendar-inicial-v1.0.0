import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anonymous key are required.");
}

// Enhanced Supabase client with better configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Auto refresh tokens
    autoRefreshToken: true,
    
    // Persist session in localStorage
    persistSession: true,
    
    // Detect session in URL (for email confirmations)
    detectSessionInUrl: true,
    
    // Storage key for session
    storageKey: 'gendar-auth-token',
    
    // Custom storage (could be enhanced for encryption)
    storage: window.localStorage,
    
    // Flow type for auth
    flowType: 'pkce'
  },
  
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'gendar-web-app',
    },
  },
  
  // Realtime configuration
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  
  // Database configuration
  db: {
    schema: 'public',
  },
});

// Enhanced error handling
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`[Auth] Event: ${event}`, {
    userId: session?.user?.id,
    email: session?.user?.email,
    timestamp: new Date().toISOString(),
  });
  
  // Log auth events for monitoring
  if (event === 'SIGNED_OUT') {
    // Clear any cached data
    localStorage.removeItem('gendar-user-cache');
  }
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('[Auth] Token refreshed successfully');
  }
});

// Add request timeout and retry logic
const originalRequest = supabase.rest.request;
supabase.rest.request = async function(options) {
  const maxRetries = 3;
  const timeout = 30000; // 30 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await originalRequest.call(this, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error: any) {
      console.warn(`[Supabase] Request attempt ${attempt} failed:`, error.message);
      
      // Don't retry on auth errors or client errors
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export default supabase;