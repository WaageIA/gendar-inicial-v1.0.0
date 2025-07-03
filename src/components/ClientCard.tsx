
import React, { useState, memo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Calendar, Edit, Users, Trash2, MessageSquare, TrendingUp, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import StarRating from './StarRating';
import { Client, Appointment } from '@/types';


interface ClientCardProps {
  client: Client;
  appointments?: Appointment[];
  onEditClick: (client: Client) => void;
  onScheduleClick: (client: Client) => void;
  onDeleteClick: (client: Client) => void;
  onWhatsAppClick: (client: Client) => void;
}

const ClientCard: React.FC<ClientCardProps> = memo(({
  client,
  appointments = [],
  onEditClick,
  onScheduleClick,
  onDeleteClick,
  onWhatsAppClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate client statistics
  const clientAppointments = appointments.filter(app => app.clientId === client.id);
  const completedAppointments = clientAppointments.filter(app => app.status === 'completed');
  const totalSpent = completedAppointments.reduce((sum, app) => sum + (app.price || 0), 0);
  const totalAppointments = completedAppointments.length;
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="mobile-card">
      {/* Header otimizado para mobile */}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold gold-text truncate">{client.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="w-4 h-4 text-nail-dark flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate">{client.phone}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <StarRating rating={client.rating} readOnly />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
              className="p-1 h-auto w-auto"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 space-y-3">
        {/* Informações básicas sempre visíveis */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-nail-light rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Atendimentos</p>
              <p className="text-sm font-bold text-blue-600">{totalAppointments}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Total Gasto</p>
              <p className="text-sm font-bold text-green-600">R$ {totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        {/* Informações expandidas */}
        {isExpanded && (
          <div className="space-y-3 animate-fade-in">
            {client.birthDate && (
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 text-nail-dark flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                  <p className="text-sm font-medium">{new Date(client.birthDate).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            )}
            
            {client.indicatedByName && (
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <Users className="w-4 h-4 text-nail-dark flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Indicado por</p>
                  <p className="text-sm font-medium">{client.indicatedByName}</p>
                </div>
              </div>
            )}
            
            {client.notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Observações</p>
                <p className="text-sm text-gray-700 leading-relaxed">{client.notes}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 flex flex-col gap-3">
        {/* Botões principais - mobile first */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onScheduleClick(client);
            }}
            className="mobile-button-primary relative overflow-hidden group"
          >
            <Calendar className="w-4 h-4 mr-2" /> 
            <span className="font-semibold">Agendar</span>
          </Button>
          
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onWhatsAppClick(client);
            }}
            className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-lg px-4 py-3 font-semibold text-sm transition-all duration-200 min-h-[48px] shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center"
            style={{ touchAction: 'manipulation' }}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            <span>Lembrete</span>
          </Button>
        </div>
        
        {/* Botões secundários */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(client);
            }}
            className="mobile-button-secondary"
          >
            <Edit className="w-4 h-4 mr-2" />
            <span>Editar</span>
          </Button>
          
          <Button 
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(client);
            }}
            className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg px-4 py-3 font-medium text-sm transition-all duration-200 min-h-[48px] shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center"
            style={{ touchAction: 'manipulation' }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            <span>Excluir</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});

ClientCard.displayName = 'ClientCard';

export default ClientCard;
