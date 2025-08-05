import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Service, Professional, CustomerData } from '@/types';

interface SchedulingState {
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  customerData: CustomerData | null;
  businessSlug: string | null;
  currentStep: number;
}

interface SchedulingContextType extends SchedulingState {
  // Actions
  setSelectedService: (service: Service) => void;
  setSelectedProfessional: (professional: Professional | null) => void;
  setSelectedDateTime: (date: Date, time: string) => void;
  setCustomerData: (data: CustomerData) => void;
  setBusinessSlug: (slug: string) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetScheduling: () => void;
  canProceedToNextStep: () => boolean;
}

const SchedulingContext = createContext<SchedulingContextType | undefined>(undefined);

const initialState: SchedulingState = {
  selectedService: null,
  selectedProfessional: null,
  selectedDate: null,
  selectedTime: null,
  customerData: null,
  businessSlug: null,
  currentStep: 1,
};

interface SchedulingProviderProps {
  children: ReactNode;
}

export const SchedulingProvider: React.FC<SchedulingProviderProps> = ({ children }) => {
  const [state, setState] = useState<SchedulingState>(initialState);

  const setSelectedService = (service: Service) => {
    setState(prev => ({
      ...prev,
      selectedService: service,
      // Reset subsequent selections when service changes
      selectedProfessional: null,
      selectedDate: null,
      selectedTime: null,
    }));
  };

  const setSelectedProfessional = (professional: Professional | null) => {
    setState(prev => ({
      ...prev,
      selectedProfessional: professional,
      // Reset subsequent selections when professional changes
      selectedDate: null,
      selectedTime: null,
    }));
  };

  const setSelectedDateTime = (date: Date, time: string) => {
    setState(prev => ({
      ...prev,
      selectedDate: date,
      selectedTime: time,
    }));
  };

  const setCustomerData = (data: CustomerData) => {
    setState(prev => ({
      ...prev,
      customerData: data,
    }));
  };

  const setBusinessSlug = (slug: string) => {
    setState(prev => ({
      ...prev,
      businessSlug: slug,
    }));
  };

  const setCurrentStep = (step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: step,
    }));
  };

  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
  };

  const previousStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
    }));
  };

  const resetScheduling = () => {
    setState(initialState);
  };

  const canProceedToNextStep = (): boolean => {
    switch (state.currentStep) {
      case 1: // Service Selection
        return state.selectedService !== null;
      case 2: // Professional Selection (optional step)
        return true; // Can proceed even without selecting professional
      case 3: // Time Selection
        return state.selectedDate !== null && state.selectedTime !== null;
      case 4: // Review and Confirm
        return state.customerData !== null;
      default:
        return false;
    }
  };

  const value: SchedulingContextType = {
    ...state,
    setSelectedService,
    setSelectedProfessional,
    setSelectedDateTime,
    setCustomerData,
    setBusinessSlug,
    setCurrentStep,
    nextStep,
    previousStep,
    resetScheduling,
    canProceedToNextStep,
  };

  return (
    <SchedulingContext.Provider value={value}>
      {children}
    </SchedulingContext.Provider>
  );
};

export const useScheduling = (): SchedulingContextType => {
  const context = useContext(SchedulingContext);
  if (context === undefined) {
    throw new Error('useScheduling must be used within a SchedulingProvider');
  }
  return context;
};