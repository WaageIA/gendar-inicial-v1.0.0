
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Star, Award, Gift } from 'lucide-react';
import { Client, Appointment } from '@/types';
import { toast } from 'sonner';

interface LoyaltySystemProps {
  client?: Client;
  appointments: Appointment[];
}

interface LoyaltyData {
  points: number;
  level: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
  completedAppointments: number;
  nextLevelPoints: number;
  progress: number;
}

const LoyaltySystem: React.FC<LoyaltySystemProps> = ({
  client,
  appointments
}) => {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData>({
    points: 0,
    level: 'Bronze',
    completedAppointments: 0,
    nextLevelPoints: 100,
    progress: 0
  });
  
  useEffect(() => {
    if (client && appointments) {
      // Encontre todos os agendamentos concluídos para este cliente
      const clientAppointments = appointments.filter(
        app => app.clientId === client.id && app.status === 'completed'
      );
      
      // Calcular pontos (10 por agendamento concluído + 1 por minuto de serviço)
      const basePoints = clientAppointments.length * 10;
      const minutePoints = clientAppointments.reduce((sum, app) => sum + app.duration, 0);
      const totalPoints = basePoints + minutePoints;
      
      // Definir o nível baseado nos pontos
      let level: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante' = 'Bronze';
      let nextLevelPoints = 100;
      
      if (totalPoints >= 500) {
        level = 'Diamante';
        nextLevelPoints = 500;
      } else if (totalPoints >= 300) {
        level = 'Ouro';
        nextLevelPoints = 500;
      } else if (totalPoints >= 100) {
        level = 'Prata';
        nextLevelPoints = 300;
      } else {
        level = 'Bronze';
        nextLevelPoints = 100;
      }
      
      // Calcular progresso para o próximo nível
      const progress = level === 'Diamante' 
        ? 100 
        : Math.floor((totalPoints / nextLevelPoints) * 100);
      
      setLoyaltyData({
        points: totalPoints,
        level,
        completedAppointments: clientAppointments.length,
        nextLevelPoints,
        progress
      });
    }
  }, [client, appointments]);
  
  const getLevelColor = () => {
    switch (loyaltyData.level) {
      case 'Bronze': return 'text-amber-700';
      case 'Prata': return 'text-gray-500';
      case 'Ouro': return 'text-nail-gold';
      case 'Diamante': return 'text-blue-500';
    }
  };
  
  const getLevelBadge = () => {
    switch (loyaltyData.level) {
      case 'Bronze': 
        return <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">Bronze</div>;
      case 'Prata': 
        return <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">Prata</div>;
      case 'Ouro': 
        return <div className="px-3 py-1 rounded-full bg-yellow-100 text-nail-gold text-xs font-semibold animate-pulse-gold">Ouro</div>;
      case 'Diamante': 
        return <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-500 text-xs font-semibold">Diamante</div>;
    }
  };
  
  const getBenefitsList = () => {
    switch (loyaltyData.level) {
      case 'Bronze':
        return [
          '5% de desconto em serviços adicionais'
        ];
      case 'Prata':
        return [
          '10% de desconto em serviços adicionais',
          'Prioridade no agendamento'
        ];
      case 'Ouro':
        return [
          '15% de desconto em serviços adicionais',
          'Prioridade no agendamento',
          'Um serviço extra gratuito por mês'
        ];
      case 'Diamante':
        return [
          '20% de desconto em serviços adicionais',
          'Atendimento prioritário',
          'Um serviço completo gratuito por mês',
          'Brindes exclusivos'
        ];
    }
  };
  
  if (!client) {
    return (
      <Card className="border border-nail-secondary">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Star className="w-5 h-5 mr-2 text-nail-gold" />
            Programa de Fidelidade
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Selecione um cliente para ver seus dados de fidelidade.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border border-nail-secondary hoverable-gold">
      <CardHeader className="border-b border-nail-secondary bg-gradient-to-r from-white via-nail-secondary to-white pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Award className="w-5 h-5 mr-2 text-nail-gold" />
          Programa de Fidelidade
        </CardTitle>
        <CardDescription>
          Cliente: {client.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Nível</span>
          {getLevelBadge()}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{loyaltyData.points} pontos</span>
            <span>{loyaltyData.level !== 'Diamante' ? loyaltyData.nextLevelPoints + ' pontos' : 'Nível máximo'}</span>
          </div>
          <Progress 
            value={loyaltyData.progress} 
            className="h-2 bg-nail-secondary" 
          />
        </div>
        
        <div className="pt-2">
          <p className="text-sm font-medium mb-2 flex items-center">
            <Gift className="w-4 h-4 mr-1 text-nail-primary" />
            Benefícios do nível {loyaltyData.level}:
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            {getBenefitsList().map((benefit, index) => (
              <li key={index} className="animate-slide-in-bottom" style={{ animationDelay: `${index * 100}ms` }}>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-nail-light p-3 rounded-md text-center hoverable-gold">
          <p className="text-sm font-medium">Serviços realizados</p>
          <p className="text-2xl font-bold gold-text">{loyaltyData.completedAppointments}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => toast.success(`Cupom de desconto enviado para ${client.name}`)}
          className="w-full bg-nail-primary hover:bg-nail-dark text-white relative overflow-hidden group"
        >
          <span className="absolute inset-0 w-0 gold-gradient opacity-50 transition-all duration-300 ease-out group-hover:w-full"></span>
          <Gift className="w-4 h-4 mr-2 relative z-10" />
          <span className="relative z-10">Gerar Cupom de Desconto</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoyaltySystem;
