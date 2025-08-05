import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseAuthTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  enabled?: boolean;
}

export const useAuthTimeout = ({
  timeoutMinutes = 30, // 30 minutes default
  warningMinutes = 5,  // 5 minutes warning
  enabled = true,
}: UseAuthTimeoutOptions = {}) => {
  const { user, signOut } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = useCallback(() => {
    if (!enabled || !user) return;

    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    lastActivityRef.current = Date.now();

    // Set warning timeout
    warningRef.current = setTimeout(() => {
      toast.warning(
        `Sua sessão expirará em ${warningMinutes} minutos por inatividade.`,
        {
          duration: 10000,
          action: {
            label: 'Continuar',
            onClick: () => resetTimeout(),
          },
        }
      );
    }, (timeoutMinutes - warningMinutes) * 60 * 1000);

    // Set logout timeout
    timeoutRef.current = setTimeout(async () => {
      toast.info('Sessão expirada por inatividade. Faça login novamente.');
      await signOut();
    }, timeoutMinutes * 60 * 1000);
  }, [enabled, user, signOut, timeoutMinutes, warningMinutes]);

  // Track user activity
  useEffect(() => {
    if (!enabled || !user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      const now = Date.now();
      // Only reset if more than 1 minute has passed (avoid too frequent resets)
      if (now - lastActivityRef.current > 60000) {
        resetTimeout();
      }
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timeout setup
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [enabled, user, resetTimeout]);

  // Manual extend session
  const extendSession = useCallback(() => {
    resetTimeout();
    toast.success('Sessão estendida com sucesso!');
  }, [resetTimeout]);

  return {
    extendSession,
    remainingTime: () => {
      if (!enabled || !user) return 0;
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = (timeoutMinutes * 60 * 1000) - elapsed;
      return Math.max(0, Math.floor(remaining / 1000));
    },
  };
};