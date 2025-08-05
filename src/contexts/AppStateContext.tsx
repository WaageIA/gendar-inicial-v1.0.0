
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Client, Appointment, FinancialTransaction, Expense } from '@/types';
import { clientService } from '@/services/clientService';
import { appointmentService } from '@/services/appointmentService';
import { financialService } from '@/services/financialService';
import { expenseService } from '@/services/expenseService';

interface AppState {
  clients: Client[];
  appointments: Appointment[];
  transactions: FinancialTransaction[];
  expenses: Expense[];
  loading: {
    clients: boolean;
    appointments: boolean;
    transactions: boolean;
    expenses: boolean;
  };
  errors: {
    clients: string | null;
    appointments: string | null;
    transactions: string | null;
    expenses: string | null;
  };
}

type AppAction =
  | { type: 'SET_LOADING'; entity: keyof AppState['loading']; loading: boolean }
  | { type: 'SET_ERROR'; entity: keyof AppState['errors']; error: string | null }
  | { type: 'SET_CLIENTS'; clients: Client[] }
  | { type: 'ADD_CLIENT'; client: Client }
  | { type: 'UPDATE_CLIENT'; client: Client }
  | { type: 'DELETE_CLIENT'; clientId: string }
  | { type: 'SET_APPOINTMENTS'; appointments: Appointment[] }
  | { type: 'ADD_APPOINTMENT'; appointment: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; appointment: Appointment }
  | { type: 'DELETE_APPOINTMENT'; appointmentId: string }
  | { type: 'SET_TRANSACTIONS'; transactions: FinancialTransaction[] }
  | { type: 'ADD_TRANSACTION'; transaction: FinancialTransaction }
  | { type: 'SET_EXPENSES'; expenses: Expense[] }
  | { type: 'ADD_EXPENSE'; expense: Expense };

const initialState: AppState = {
  clients: [],
  appointments: [],
  transactions: [],
  expenses: [],
  loading: {
    clients: false,
    appointments: false,
    transactions: false,
    expenses: false,
  },
  errors: {
    clients: null,
    appointments: null,
    transactions: null,
    expenses: null,
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.entity]: action.loading },
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.entity]: action.error },
      };
    case 'SET_CLIENTS':
      return { ...state, clients: action.clients };
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.client] };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.client.id ? action.client : client
        ),
      };
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.clientId),
      };
    case 'SET_APPOINTMENTS':
      return { ...state, appointments: action.appointments };
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.appointment] };
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(app =>
          app.id === action.appointment.id ? action.appointment : app
        ),
      };
    case 'DELETE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.filter(app => app.id !== action.appointmentId),
      };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.transactions };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.transaction] };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.expenses };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.expense] };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    loadAllData: () => Promise<void>;
    refreshClients: () => Promise<void>;
    refreshAppointments: () => Promise<void>;
    refreshTransactions: () => Promise<void>;
    refreshExpenses: () => Promise<void>;
  };
}

const AppStateContext = createContext<AppContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const loadAllData = async () => {
    await Promise.all([
      refreshClients(),
      refreshAppointments(),
      refreshTransactions(),
      refreshExpenses(),
    ]);
  };

  const refreshClients = async () => {
    dispatch({ type: 'SET_LOADING', entity: 'clients', loading: true });
    dispatch({ type: 'SET_ERROR', entity: 'clients', error: null });

    // Timeout para evitar carregamento infinito
    const timeoutId = setTimeout(() => {
      console.warn('Timeout ao carregar clientes, usando fallback');
      const savedClients = localStorage.getItem('nail-clients');
      if (savedClients) {
        try {
          dispatch({ type: 'SET_CLIENTS', clients: JSON.parse(savedClients) });
        } catch (e) {
          dispatch({ type: 'SET_CLIENTS', clients: [] });
        }
      } else {
        dispatch({ type: 'SET_CLIENTS', clients: [] });
      }
      dispatch({ type: 'SET_LOADING', entity: 'clients', loading: false });
    }, 10000); // 10 segundos timeout

    try {
      const { data, error } = await clientService.getClients();
      clearTimeout(timeoutId);

      if (error) {
        // Fallback to localStorage
        const savedClients = localStorage.getItem('nail-clients');
        if (savedClients) {
          try {
            dispatch({ type: 'SET_CLIENTS', clients: JSON.parse(savedClients) });
          } catch (e) {
            dispatch({ type: 'SET_CLIENTS', clients: [] });
          }
        } else {
          dispatch({ type: 'SET_CLIENTS', clients: [] });
        }
        dispatch({ type: 'SET_ERROR', entity: 'clients', error: error });
      } else {
        dispatch({ type: 'SET_CLIENTS', clients: data });
        // Sync to localStorage
        localStorage.setItem('nail-clients', JSON.stringify(data));
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Erro ao carregar clientes:', error);

      // Fallback to localStorage em caso de erro
      const savedClients = localStorage.getItem('nail-clients');
      if (savedClients) {
        try {
          dispatch({ type: 'SET_CLIENTS', clients: JSON.parse(savedClients) });
        } catch (e) {
          dispatch({ type: 'SET_CLIENTS', clients: [] });
        }
      } else {
        dispatch({ type: 'SET_CLIENTS', clients: [] });
      }
      dispatch({ type: 'SET_ERROR', entity: 'clients', error: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', entity: 'clients', loading: false });
    }
  };

  const refreshAppointments = async () => {
    dispatch({ type: 'SET_LOADING', entity: 'appointments', loading: true });
    dispatch({ type: 'SET_ERROR', entity: 'appointments', error: null });

    // Timeout para evitar carregamento infinito
    const timeoutId = setTimeout(() => {
      console.warn('Timeout ao carregar agendamentos, usando fallback');
      const savedAppointments = localStorage.getItem('nail-appointments');
      if (savedAppointments) {
        try {
          const parsedAppointments = JSON.parse(savedAppointments).map((app: any) => ({
            ...app,
            date: new Date(app.date),
          }));
          dispatch({ type: 'SET_APPOINTMENTS', appointments: parsedAppointments });
        } catch (e) {
          dispatch({ type: 'SET_APPOINTMENTS', appointments: [] });
        }
      } else {
        dispatch({ type: 'SET_APPOINTMENTS', appointments: [] });
      }
      dispatch({ type: 'SET_LOADING', entity: 'appointments', loading: false });
    }, 10000); // 10 segundos timeout

    try {
      const { data, error } = await appointmentService.getAppointments();
      clearTimeout(timeoutId);

      if (error) {
        // Fallback to localStorage
        const savedAppointments = localStorage.getItem('nail-appointments');
        if (savedAppointments) {
          try {
            const parsedAppointments = JSON.parse(savedAppointments).map((app: any) => ({
              ...app,
              date: new Date(app.date),
            }));
            dispatch({ type: 'SET_APPOINTMENTS', appointments: parsedAppointments });
          } catch (e) {
            dispatch({ type: 'SET_APPOINTMENTS', appointments: [] });
          }
        } else {
          dispatch({ type: 'SET_APPOINTMENTS', appointments: [] });
        }
        dispatch({ type: 'SET_ERROR', entity: 'appointments', error: error });
      } else {
        dispatch({ type: 'SET_APPOINTMENTS', appointments: data });
        // Sync to localStorage
        localStorage.setItem('nail-appointments', JSON.stringify(data));
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Erro ao carregar agendamentos:', error);

      // Fallback to localStorage em caso de erro
      const savedAppointments = localStorage.getItem('nail-appointments');
      if (savedAppointments) {
        try {
          const parsedAppointments = JSON.parse(savedAppointments).map((app: any) => ({
            ...app,
            date: new Date(app.date),
          }));
          dispatch({ type: 'SET_APPOINTMENTS', appointments: parsedAppointments });
        } catch (e) {
          dispatch({ type: 'SET_APPOINTMENTS', appointments: [] });
        }
      } else {
        dispatch({ type: 'SET_APPOINTMENTS', appointments: [] });
      }
      dispatch({ type: 'SET_ERROR', entity: 'appointments', error: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', entity: 'appointments', loading: false });
    }
  };

  const refreshTransactions = async () => {
    dispatch({ type: 'SET_LOADING', entity: 'transactions', loading: true });
    dispatch({ type: 'SET_ERROR', entity: 'transactions', error: null });

    // Timeout para evitar carregamento infinito
    const timeoutId = setTimeout(() => {
      console.warn('Timeout ao carregar transações, usando fallback');
      dispatch({ type: 'SET_TRANSACTIONS', transactions: [] });
      dispatch({ type: 'SET_LOADING', entity: 'transactions', loading: false });
    }, 10000); // 10 segundos timeout

    try {
      const { data, error } = await financialService.getTransactions();
      clearTimeout(timeoutId);

      if (error) {
        dispatch({ type: 'SET_TRANSACTIONS', transactions: [] });
        dispatch({ type: 'SET_ERROR', entity: 'transactions', error: error });
      } else {
        dispatch({ type: 'SET_TRANSACTIONS', transactions: data });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Erro ao carregar transações:', error);
      dispatch({ type: 'SET_TRANSACTIONS', transactions: [] });
      dispatch({ type: 'SET_ERROR', entity: 'transactions', error: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', entity: 'transactions', loading: false });
    }
  };

  const refreshExpenses = async () => {
    dispatch({ type: 'SET_LOADING', entity: 'expenses', loading: true });
    dispatch({ type: 'SET_ERROR', entity: 'expenses', error: null });

    // Timeout para evitar carregamento infinito
    const timeoutId = setTimeout(() => {
      console.warn('Timeout ao carregar despesas, usando fallback');
      dispatch({ type: 'SET_EXPENSES', expenses: [] });
      dispatch({ type: 'SET_LOADING', entity: 'expenses', loading: false });
    }, 10000); // 10 segundos timeout

    try {
      const { data, error } = await expenseService.getExpenses();
      clearTimeout(timeoutId);

      if (error) {
        dispatch({ type: 'SET_EXPENSES', expenses: [] });
        dispatch({ type: 'SET_ERROR', entity: 'expenses', error: error });
      } else {
        dispatch({ type: 'SET_EXPENSES', expenses: data });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Erro ao carregar despesas:', error);
      dispatch({ type: 'SET_EXPENSES', expenses: [] });
      dispatch({ type: 'SET_ERROR', entity: 'expenses', error: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', entity: 'expenses', loading: false });
    }
  };

  const actions = {
    loadAllData,
    refreshClients,
    refreshAppointments,
    refreshTransactions,
    refreshExpenses,
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <AppStateContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
