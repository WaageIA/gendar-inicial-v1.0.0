
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@/types';

interface QuickActionsProps {
  clients?: Client[];
  onOpenAppointmentDialog?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  clients, 
  onOpenAppointmentDialog 
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => navigate('/clients')}
        >
          <Users className="h-4 w-4 mr-2" />
          Gerenciar Clientes {clients && `(${clients.length})`}
        </Button>
        <Button 
          className="w-full justify-start nail-button"
          onClick={onOpenAppointmentDialog}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Agendar Serviço
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => navigate('/financial')}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Controle Financeiro
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
