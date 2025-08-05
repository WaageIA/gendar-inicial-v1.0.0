import React, { useState } from 'react';
import { useScheduling } from '@/contexts/SchedulingContext';
import { useAvailableSlots } from '@/hooks/useServices';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const TimeSelection: React.FC = () => {
  const {
    businessSlug,
    selectedService,
    selectedProfessional,
    selectedDate,
    selectedTime,
    setSelectedDateTime,
    nextStep,
    canProceedToNextStep,
  } = useScheduling();

  const [tempSelectedDate, setTempSelectedDate] = useState<Date | undefined>(selectedDate || undefined);

  const {
    data: availableSlots = [],
    isLoading,
    error,
    refetch,
  } = useAvailableSlots(
    businessSlug || undefined,
    selectedService?.id,
    tempSelectedDate,
    selectedProfessional?.id
  );

  const handleDateSelect = (date: Date | undefined) => {
    setTempSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    if (tempSelectedDate) {
      setSelectedDateTime(tempSelectedDate, time);
    }
  };

  const handleContinue = () => {
    if (canProceedToNextStep()) {
      nextStep();
    }
  };

  // Filter out past dates
  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    return isBefore(date, today);
  };

  if (!selectedService) {
    return (
      <ErrorState 
        message="Nenhum serviço selecionado. Volte e escolha um serviço."
        title="Serviço não encontrado"
        showRetry={false}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Escolha data e horário
        </h2>
        <p className="text-gray-600">
          Selecione quando deseja realizar o serviço
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Selecione a data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={tempSelectedDate}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              locale={ptBR}
              className="rounded-md border"
              fromDate={new Date()}
              toDate={addDays(new Date(), 60)} // Allow booking up to 60 days in advance
            />
          </CardContent>
        </Card>

        {/* Time Slots Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários disponíveis
            </CardTitle>
            {tempSelectedDate && (
              <p className="text-sm text-gray-600">
                {format(tempSelectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {!tempSelectedDate ? (
              <div className="flex items-center justify-center h-40 text-gray-500">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Selecione uma data para ver os horários</p>
                </div>
              </div>
            ) : isLoading ? (
              <LoadingState message="Carregando horários..." size="sm" />
            ) : error ? (
              <ErrorState 
                message="Erro ao carregar horários disponíveis"
                onRetry={() => refetch()}
                showRetry={true}
              />
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum horário disponível para esta data</p>
                <p className="text-sm mt-1">Tente selecionar outra data</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => handleTimeSelect(slot.time)}
                    className={`text-xs ${
                      !slot.available 
                        ? 'opacity-50 cursor-not-allowed' 
                        : selectedTime === slot.time
                        ? 'bg-primary text-white'
                        : 'hover:bg-primary/10'
                    }`}
                    title={slot.reason || undefined}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-900 mb-1">
                  Horário selecionado
                </h3>
                <p className="text-sm text-green-800">
                  {format(selectedDate, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700">Duração</p>
                <p className="font-medium text-green-900">
                  {selectedService.duration} minutos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      {selectedDate && selectedTime && (
        <div className="flex justify-center">
          <Button 
            onClick={handleContinue}
            size="lg"
            className="px-8"
          >
            Continuar para confirmação
          </Button>
        </div>
      )}
    </div>
  );
};