
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types';

import { Button } from '@/components/ui/button';

interface TodayScheduleProps {
  appointments: Appointment[];
  onCancel?: (appointment: Appointment) => void;
  onComplete?: (appointment: Appointment) => void;
}

const TodaySchedule: React.FC<TodayScheduleProps> = ({ 
  appointments, 
  onCancel, 
  onComplete 
}) => {
  console.log('[TodaySchedule] Agendamentos recebidos:', appointments);
  console.log('[TodaySchedule] Total de agendamentos:', appointments.length);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Agendamentos de Hoje</CardTitle>
        <span className="text-sm text-muted-foreground">
          {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} hoje
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map((appointment) => {
            console.log('[TodaySchedule] Renderizando agendamento:', {
              id: appointment.id,
              clientName: appointment.clientName,
              service: appointment.service,
              date: appointment.date,
              status: appointment.status
            });
            
            return (
              <div key={appointment.id} className="flex items-center space-x-4 p-3 rounded-lg bg-nail-light">
                <div className="w-10 h-10 rounded-full bg-nail-primary flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {appointment.service.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-nail-dark truncate">
                    {appointment.service}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    <span className="truncate">{appointment.clientName}</span>
                    <span className="mx-2">•</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{format(new Date(appointment.date), 'HH:mm', { locale: ptBR })}</span>
                    <span className="mx-2">•</span>
                    <span>{appointment.duration} min</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <p className="text-sm font-medium text-green-600">
                    R$ {(appointment.price || 0).toFixed(2)}
                  </p>
                  {(onComplete || onCancel) && (
                    <div className="flex space-x-1">
                      {onComplete && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onComplete(appointment)}
                          className="h-6 w-6 p-0"
                          title="Concluir agendamento"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      {onCancel && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCancel(appointment)}
                          className="h-6 w-6 p-0"
                          title="Cancelar agendamento"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              Nenhum agendamento para hoje
            </p>
            <p className="text-xs text-gray-400">
              Use o botão "Novo Agendamento" para criar um agendamento
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaySchedule;
