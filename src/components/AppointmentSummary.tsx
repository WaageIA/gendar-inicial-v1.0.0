
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Check, Clock, Users } from 'lucide-react';
import { Appointment } from '@/types';
import { format, isToday, isFuture, parseISO, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentSummaryProps {
  appointments: Appointment[];
}

interface StatData {
  icon: React.ElementType;
  title: string;
  value: number;
  description: string;
}

const AppointmentSummary: React.FC<AppointmentSummaryProps> = ({
  appointments
}) => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [servicesData, setServicesData] = useState<{name: string, count: number}[]>([]);
  const [countUp, setCountUp] = useState<boolean>(false);
  
  useEffect(() => {
    if (appointments?.length) {
      // Hoje
      const todayAppointments = appointments.filter(app => 
        isToday(new Date(app.date))
      );
      
      // Futuros
      const futureAppointments = appointments.filter(app => 
        isFuture(new Date(app.date)) && !isToday(new Date(app.date))
      );
      
      // Concluídos
      const completedAppointments = appointments.filter(app => 
        app.status === 'completed'
      );
      
      // Estatísticas
      const newStats: StatData[] = [
        {
          icon: Users,
          title: 'Total',
          value: appointments.length,
          description: 'Agendamentos'
        },
        {
          icon: Calendar,
          title: 'Hoje',
          value: todayAppointments.length,
          description: format(new Date(), "dd 'de' MMMM", { locale: ptBR })
        },
        {
          icon: Clock,
          title: 'Futuros',
          value: futureAppointments.length,
          description: 'Agendamentos'
        },
        {
          icon: Check,
          title: 'Concluídos',
          value: completedAppointments.length,
          description: 'Serviços'
        }
      ];
      
      // Serviços mais agendados
      const servicesCount: Record<string, number> = {};
      appointments.forEach(app => {
        servicesCount[app.service] = (servicesCount[app.service] || 0) + 1;
      });
      
      const servicesArray = Object.entries(servicesCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setStats(newStats);
      setServicesData(servicesArray);
      
      // Trigger count up animation
      setCountUp(true);
    }
  }, [appointments]);
  
  const StatCard = ({ stat }: { stat: StatData }) => (
    <div className="stat-card animate-slide-in-bottom">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm text-muted-foreground">{stat.title}</p>
          <h3 className={`text-2xl font-bold ${countUp ? 'animate-count-up' : ''}`}>
            {stat.value}
          </h3>
        </div>
        <div className="p-2 rounded-full bg-nail-light">
          <stat.icon className="w-5 h-5 text-nail-primary" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{stat.description}</p>
    </div>
  );
  
  return (
    <Card className="border border-nail-secondary overflow-hidden">
      <CardHeader className="border-b border-nail-secondary bg-nail-light pb-3">
        <CardTitle className="text-lg font-semibold text-center gold-text">
          Resumo de Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {stats.map((stat, index) => (
            <StatCard 
              key={stat.title} 
              stat={stat} 
            />
          ))}
        </div>
        
        {servicesData.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Serviços mais agendados</h4>
            <div className="space-y-2">
              {servicesData.map((service) => (
                <div key={service.name} className="bg-nail-light rounded-md p-2 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{service.name}</span>
                    <span className="text-xs bg-nail-primary text-white px-2 py-0.5 rounded-full">{service.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-nail-secondary rounded-full w-full overflow-hidden">
                    <div 
                      className="bg-nail-primary h-full rounded-full gold-gradient"
                      style={{ width: `${Math.min(100, (service.count / Math.max(...servicesData.map(s => s.count))) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentSummary;
