import { z } from 'zod';

// Password strength validation
export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^a-zA-Z0-9]/, 'Senha deve conter pelo menos um caractere especial');

// Email validation
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(5, 'Email deve ter pelo menos 5 caracteres')
  .max(100, 'Email deve ter no máximo 100 caracteres');

// Rate limiting for login attempts
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000, blockDurationMs = 30 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  canAttempt(identifier: string): { allowed: boolean; remainingTime?: number } {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      return { allowed: true };
    }

    // Check if window has expired
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.delete(identifier);
      return { allowed: true };
    }

    // Check if blocked
    if (record.count >= this.maxAttempts) {
      const remainingTime = this.blockDurationMs - (now - record.lastAttempt);
      if (remainingTime > 0) {
        return { 
          allowed: false, 
          remainingTime: Math.ceil(remainingTime / 1000) 
        };
      } else {
        this.attempts.delete(identifier);
        return { allowed: true };
      }
    }

    return { allowed: true };
  }

  recordAttempt(identifier: string, success: boolean) {
    const now = Date.now();
    const record = this.attempts.get(identifier) || { count: 0, lastAttempt: now };

    if (success) {
      // Reset on successful login
      this.attempts.delete(identifier);
    } else {
      // Increment failed attempts
      record.count += 1;
      record.lastAttempt = now;
      this.attempts.set(identifier, record);
    }
  }

  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return this.maxAttempts;
    
    const now = Date.now();
    if (now - record.lastAttempt > this.windowMs) {
      return this.maxAttempts;
    }
    
    return Math.max(0, this.maxAttempts - record.count);
  }
}

export const loginRateLimiter = new RateLimiter();

// Password strength checker
export const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 2) strength = 'weak';
  else if (score < 3) strength = 'fair';
  else if (score < 4) strength = 'good';
  else strength = 'strong';

  return {
    score,
    strength,
    checks,
    isValid: score >= 4,
  };
};

// Generate secure password
export const generateSecurePassword = (length = 12): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Validate session token
export const validateSessionToken = (token: string): boolean => {
  if (!token) return false;
  
  try {
    // Basic JWT structure validation
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload (without verification - just structure check)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const setCSRFToken = (token: string) => {
  sessionStorage.setItem('csrf-token', token);
};

export const getCSRFToken = (): string | null => {
  return sessionStorage.getItem('csrf-token');
};

export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return storedToken === token;
};