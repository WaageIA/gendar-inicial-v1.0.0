import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, CheckCircle, XCircle, Calendar, MapPin, DollarSign, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types';
import { Badge } from '@/components/ui/badge';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancelClick: (appointment: Appointment) => void;
  onCompleteClick: (appointment: Appointment) => void;
  onDeleteClick: (appointment: Appointment) => void;
}
const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancelClick,
  onCompleteClick,
  onDeleteClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const getStatusBadge = () => {
    if (appointment.status === 'completed') {
      return <Badge className="bg-completed text-white">Concluído</Badge>;
    } else if (appointment.status === 'cancelled') {
      return <Badge className="bg-destructive text-white">Cancelado</Badge>;
    }
    return <Badge className="bg-nail-primary text-white">Agendado</Badge>;
  };
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  return <Card className="nail-card hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-nail-dark">{appointment.service}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{appointment.clientName}</span>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{format(new Date(appointment.date), 'dd/MM/yyyy', {
              locale: ptBR
            })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{format(new Date(appointment.date), 'HH:mm', {
              locale: ptBR
            })} ({appointment.duration} min)</span>
          </div>
        </div>
        
        {appointment.price && appointment.price > 0 && <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <DollarSign className="w-4 h-4" />
              <span>R$ {appointment.price.toFixed(2)}</span>
            </div>
          </div>}
        
        {isExpanded && appointment.notes && <div className="mt-3 p-3 bg-nail-light rounded-md">
            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
          </div>}
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between gap-2 rounded-none">
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" onClick={e => {
          e.stopPropagation();
          onDeleteClick(appointment);
        }} className="bg-destructive hover:bg-destructive/80 text-xs">
            <Trash2 className="w-3.5 h-3.5 mr-1" /> 
            Excluir
          </Button>
        </div>
        
        {appointment.status === 'scheduled' && <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={e => {
          e.stopPropagation();
          onCancelClick(appointment);
        }} className="text-xs text-destructive border-destructive/20 hover:bg-destructive/10 font-thin text-center">
              <XCircle className="w-3.5 h-3.5 mr-1" /> 
              Cancelar
            </Button>
            <Button size="sm" onClick={e => {
          e.stopPropagation();
          onCompleteClick(appointment);
        }} className="text-xs bg-completed hover:bg-completed/80 text-white">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> 
              Concluir
            </Button>
          </div>}
      </CardFooter>
    </Card>;
};
export default AppointmentCard;