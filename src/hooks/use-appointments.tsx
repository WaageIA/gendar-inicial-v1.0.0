
import { useState, useEffect, useCallback } from 'react';
import { Appointment } from '@/types';
import { isToday, isFuture, isPast, startOfDay, endOfDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { appointmentService } from '@/services/appointmentService';
import { financialService } from '@/services/financialService';
import { toast } from 'sonner';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [cancelledAppointments, setCancelledAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    console.log('[useAppointments] Iniciando busca de agendamentos');
    setLoading(true);
    try {
      const { data, error } = await appointmentService.getAppointments();
      if (error) {
        console.error('[useAppointments] Erro ao buscar agendamentos:', error);
        // Fallback para localStorage em caso de erro
        const savedAppointments = localStorage.getItem('nail-appointments');
        if (savedAppointments) {
          const parsedAppointments = JSON.parse(savedAppointments).map((app: any) => ({
            ...app,
            date: new Date(app.date),
          })) as Appointment[];
          console.log('[useAppointments] Carregados do localStorage (fallback):', parsedAppointments.length);
          setAppointments(parsedAppointments);
        } else {
          console.log('[useAppointments] Nenhum agendamento encontrado no localStorage');
          setAppointments([]);
        }
      } else {
        console.log('[useAppointments] Carregados do Supabase:', data?.length || 0);
        setAppointments(data || []);
        
        // Sync with localStorage for backup
        if (data && data.length > 0) {
          localStorage.setItem('nail-appointments', JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error('[useAppointments] Erro na busca:', error);
      // Fallback final para localStorage
      const savedAppointments = localStorage.getItem('nail-appointments');
      if (savedAppointments) {
        const parsedAppointments = JSON.parse(savedAppointments).map((app: any) => ({
          ...app,
          date: new Date(app.date),
        })) as Appointment[];
        console.log('[useAppointments] Usando fallback localStorage após erro:', parsedAppointments.length);
        setAppointments(parsedAppointments);
      } else {
        setAppointments([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    console.log('[useAppointments] Processando', appointments.length, 'agendamentos');
    const now = new Date();
    
    // Filter appointments
    const today = appointments.filter(app => {
      const isAppToday = isToday(new Date(app.date));
      const isScheduled = app.status === 'scheduled';
      console.log(`[useAppointments] Agendamento ${app.id}: hoje=${isAppToday}, agendado=${isScheduled}`);
      return isAppToday && isScheduled;
    });
    
    const upcoming = appointments.filter(app => 
      (isFuture(new Date(app.date)) && !isToday(new Date(app.date))) && app.status === 'scheduled'
    );
    
    const past = appointments.filter(app => 
      isPast(new Date(app.date)) && !isToday(new Date(app.date)) && app.status === 'scheduled'
    );
    
    const completed = appointments.filter(app => app.status === 'completed');
    const cancelled = appointments.filter(app => app.status === 'cancelled');
    
    // Sort by date
    const sortByDate = (a: Appointment, b: Appointment) => 
      new Date(a.date).getTime() - new Date(b.date).getTime();
    
    console.log('[useAppointments] Agendamentos processados:', {
      hoje: today.length,
      futuros: upcoming.length,
      passados: past.length,
      concluidos: completed.length,
      cancelados: cancelled.length
    });
    
    setTodayAppointments(today.sort(sortByDate));
    setUpcomingAppointments(upcoming.sort(sortByDate));
    setPastAppointments(past.sort(sortByDate));
    setCompletedAppointments(completed.sort(sortByDate));
    setCancelledAppointments(cancelled.sort(sortByDate));
  }, [appointments]);

  const changeAppointmentStatus = async (appointment: Appointment, status: 'scheduled' | 'completed' | 'cancelled') => {
    console.log('[useAppointments] Alterando status do agendamento:', appointment.id, 'para', status);
    try {
      const { data, error } = await appointmentService.changeAppointmentStatus(appointment.id, status);
      if (error) {
        console.error('[useAppointments] Erro ao alterar status:', error);
        // Fallback para localStorage
        const savedAppointments = localStorage.getItem('nail-appointments');
        if (savedAppointments) {
          const appointments = JSON.parse(savedAppointments);
          const updatedAppointments = appointments.map((app: Appointment) => 
            app.id === appointment.id ? { ...app, status } : app
          );
          localStorage.setItem('nail-appointments', JSON.stringify(updatedAppointments));
          // Update local state
          setAppointments(prev => prev.map(app => app.id === appointment.id ? { ...app, status } : app));
          toast.success(`Status alterado para ${status}`);
        }
        return;
      }
      
      // If completing appointment, create financial transaction
      if (status === 'completed' && appointment.price && appointment.price > 0) {
        const financialResult = await financialService.createTransaction({
          appointment_id: appointment.id,
          client_id: appointment.clientId,
          type: 'income',
          amount: appointment.price,
          description: `Receita - ${appointment.service} - ${appointment.clientName}`,
          payment_method: 'dinheiro',
          transaction_date: new Date()
        });

        if (financialResult.error) {
          console.error('[useAppointments] Erro ao criar transação financeira:', financialResult.error);
          toast.error('Agendamento concluído, mas erro ao registrar receita');
        } else {
          toast.success(`Agendamento concluído e receita de R$ ${appointment.price.toFixed(2)} registrada!`);
        }
      }
      
      // Update local appointments state
      setAppointments(prev => prev.map(app => app.id === appointment.id ? { ...app, status } : app));
      
      return data;
    } catch (error) {
      console.error('[useAppointments] Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do agendamento');
    }
  };
  
  const createAppointment = async (appointment: Omit<Appointment, 'id' | 'user_id'>) => {
    console.log('[useAppointments] Criando novo agendamento:', appointment);
    try {
      const { data, error } = await appointmentService.createAppointment(appointment);
      if (error) {
        console.error('[useAppointments] Erro ao criar agendamento:', error);
        // Fallback para localStorage
        const newAppointment = {
          ...appointment,
          id: crypto.randomUUID(),
          user_id: 'local-user'
        };
        const savedAppointments = localStorage.getItem('nail-appointments');
        const currentAppointments = savedAppointments ? JSON.parse(savedAppointments) : [];
        const updatedAppointments = [...currentAppointments, newAppointment];
        localStorage.setItem('nail-appointments', JSON.stringify(updatedAppointments));
        
        setAppointments(prev => [...prev, newAppointment as Appointment]);
        toast.success('Agendamento criado localmente!');
        return newAppointment;
      }
      
      console.log('[useAppointments] Agendamento criado com sucesso:', data);
      
      // Update local appointments state
      setAppointments(prev => [...prev, data!]);
      
      return data;
    } catch (error) {
      console.error('[useAppointments] Erro na criação:', error);
      return null;
    }
  };

  return {
    appointments,
    todayAppointments,
    upcomingAppointments,
    pastAppointments,
    completedAppointments,
    cancelledAppointments,
    loading,
    getAppointmentsCountByDay: () => {
      const counts: Record<string, number> = {};
      
      if (!appointments) return counts;
      
      appointments.forEach(app => {
        const dateStr = format(new Date(app.date), 'yyyy-MM-dd');
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      });
      
      return counts;
    },
    getAppointmentsByDate: (date: Date) => {
      const start = startOfDay(date);
      const end = endOfDay(date);
      
      return appointments.filter(app => {
        const appDate = new Date(app.date);
        return appDate >= start && appDate <= end;
      });
    },
    getAppointmentsSummary: () => {
      const total = appointments.length;
      const scheduled = appointments.filter(app => app.status === 'scheduled').length;
      const completed = appointments.filter(app => app.status === 'completed').length;
      const cancelled = appointments.filter(app => app.status === 'cancelled').length;
      const today = appointments.filter(app => isToday(new Date(app.date))).length;
      
      return { total, scheduled, completed, cancelled, today };
    },
    getMostPopularServices: (limit = 5) => {
      const services: Record<string, number> = {};
      
      appointments.forEach(app => {
        services[app.service] = (services[app.service] || 0) + 1;
      });
      
      return Object.entries(services)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    },
    changeAppointmentStatus,
    createAppointment,
    refreshAppointments: fetchAppointments
  };
}
