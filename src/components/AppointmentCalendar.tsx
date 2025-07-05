
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDaySelect: (date: Date) => void;
  selectedDate: Date | undefined;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onDaySelect,
  selectedDate,
}) => {
  // Função para verificar se um dia tem agendamentos
  const hasDayAppointment = (date: Date) => {
    return appointments.some(
      appointment => 
        appointment.status === 'scheduled' && 
        isSameDay(appointment.date, date)
    );
  };

  return (
    <Card className="border border-nail-secondary w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-nail-primary" />
          Calendário de Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex justify-center w-full">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDaySelect}
            locale={ptBR}
            showOutsideDays
            className="rounded-md border-0 pointer-events-auto w-full flex justify-center"
            modifiers={{
              highlighted: (date) => hasDayAppointment(date)
            }}
            modifiersStyles={{
              highlighted: {
                fontWeight: 'bold',
                textDecoration: 'underline',
                color: 'hsl(var(--calendar-indicator))'
              }
            }}
          />
        </div>
        
        {selectedDate && (
          <div className="p-4 border-t border-nail-secondary bg-nail-light/50">
            <h3 className="font-medium mb-3 text-nail-dark">
              Agendamentos para {format(selectedDate, 'PPP', { locale: ptBR })}
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {appointments
                .filter(app => app.status === 'scheduled' && isSameDay(app.date, selectedDate))
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map(appointment => (
                  <div 
                    key={appointment.id} 
                    className="p-3 border border-nail-secondary rounded-md bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-nail-dark">{appointment.clientName}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(appointment.date, 'HH:mm')} - {appointment.service}
                        </p>
                        {appointment.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-nail-primary hover:bg-nail-dark ml-2">
                        {appointment.duration} min
                      </Badge>
                    </div>
                  </div>
                ))}
              {appointments.filter(app => 
                app.status === 'scheduled' && isSameDay(app.date, selectedDate)
              ).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">Nenhum agendamento para este dia.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentCalendar;
