
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SchedulingProvider, useScheduling } from '@/contexts/SchedulingContext';
import { ServiceSelection } from '@/components/scheduling/ServiceSelection';
import { ProfessionalSelection } from '@/components/scheduling/ProfessionalSelection';
import { TimeSelection } from '@/components/scheduling/TimeSelection';
import { ReviewAndConfirm } from '@/components/scheduling/ReviewAndConfirm';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Service } from '@/types';

const PublicSchedulerContent: React.FC = () => {
  const { business_slug } = useParams<{ business_slug: string }>();
  const {
    currentStep,
    selectedService,
    setSelectedService,
    setBusinessSlug,
    nextStep,
    previousStep,
    canProceedToNextStep,
  } = useScheduling();

  useEffect(() => {
    if (business_slug) {
      setBusinessSlug(business_slug);
    }
  }, [business_slug, setBusinessSlug]);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    nextStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ServiceSelection onSelectService={handleSelectService} />;
      case 2:
        return <ProfessionalSelection />;
      case 3:
        return <TimeSelection />;
      case 4:
        return <ReviewAndConfirm />;
      default:
        return <ServiceSelection onSelectService={handleSelectService} />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Escolha o Serviço';
      case 2:
        return 'Selecione o Profissional';
      case 3:
        return 'Escolha Data e Horário';
      case 4:
        return 'Confirme seus Dados';
      default:
        return 'Agendamento';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agende seu Horário
          </h1>
          <p className="text-gray-600">
            {getStepTitle()}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 ${
                      step < currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        {currentStep > 1 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={previousStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>

            {currentStep < 4 && (
              <Button
                onClick={nextStep}
                disabled={!canProceedToNextStep()}
                className="flex items-center gap-2"
              >
                Continuar
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Service Summary (when service is selected) */}
        {selectedService && currentStep > 1 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Serviço Selecionado:</h3>
            <div className="flex justify-between items-center text-sm text-blue-800">
              <span>{selectedService.name}</span>
              <span>R$ {selectedService.price.toFixed(2)} • {selectedService.duration} min</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PublicScheduler: React.FC = () => {
  return (
    <SchedulingProvider>
      <PublicSchedulerContent />
    </SchedulingProvider>
  );
};

export default PublicScheduler;
