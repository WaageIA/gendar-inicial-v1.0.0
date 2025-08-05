import React from 'react';
import { useScheduling } from '@/contexts/SchedulingContext';
import { useProfessionalsByBusiness } from '@/hooks/useProfessionals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { User, Users } from 'lucide-react';

export const ProfessionalSelection: React.FC = () => {
  const {
    businessSlug,
    selectedProfessional,
    setSelectedProfessional,
    nextStep,
  } = useScheduling();

  const {
    data: professionals = [],
    isLoading,
    error,
    refetch,
  } = useProfessionalsByBusiness(businessSlug || undefined);

  const handleSelectProfessional = (professional: any) => {
    setSelectedProfessional(professional);
  };

  const handleSkip = () => {
    setSelectedProfessional(null);
    nextStep();
  };

  const handleContinue = () => {
    nextStep();
  };

  if (isLoading) {
    return <LoadingState message="Carregando profissionais..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Erro ao carregar profissionais"
        onRetry={() => refetch()}
      />
    );
  }

  // If no professionals available, skip this step
  if (professionals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Seleção de Profissional
          </h2>
          <p className="text-gray-600">
            Nenhum profissional específico disponível
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium text-gray-900 mb-2">
              Qualquer profissional disponível
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              O serviço será realizado pelo profissional disponível no horário escolhido.
            </p>
            <Button onClick={handleSkip} className="w-full">
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Escolha o profissional
        </h2>
        <p className="text-gray-600">
          Selecione quem realizará seu serviço (opcional)
        </p>
      </div>

      {/* Skip Option */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Qualquer profissional
                </h3>
                <p className="text-sm text-gray-600">
                  Deixe que escolhemos o melhor profissional para você
                </p>
              </div>
            </div>
            <Button
              variant={!selectedProfessional ? "default" : "outline"}
              onClick={handleSkip}
            >
              {!selectedProfessional ? "Selecionado" : "Selecionar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Professionals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {professionals.map((professional) => (
          <Card
            key={professional.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedProfessional?.id === professional.id
                ? 'border-primary border-2 bg-primary/5'
                : 'border-gray-200 hover:border-primary/50'
            }`}
            onClick={() => handleSelectProfessional(professional)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage 
                    src={professional.avatar_url} 
                    alt={professional.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {professional.name}
                  </h3>
                  
                  {professional.bio && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {professional.bio}
                    </p>
                  )}
                  
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant={
                        selectedProfessional?.id === professional.id 
                          ? "default" 
                          : "outline"
                      }
                      className="w-full"
                    >
                      {selectedProfessional?.id === professional.id 
                        ? "Selecionado" 
                        : "Selecionar"
                      }
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Button */}
      {selectedProfessional && (
        <div className="flex justify-center">
          <Button onClick={handleContinue} size="lg" className="px-8">
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
};