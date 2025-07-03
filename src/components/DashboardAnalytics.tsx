
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment, Client } from '@/types';
import { StatsCard } from '@/components/ui/design-system';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

interface DashboardAnalyticsProps {
  appointments: Appointment[];
  clients: Client[];
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  appointments,
  clients
}) => {
  // Dados para gráfico de receita dos últimos 7 dias
  const revenueData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(date => {
      const dayAppointments = appointments.filter(app => 
        format(new Date(app.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
        app.status === 'completed'
      );
      
      const revenue = dayAppointments.reduce((sum, app) => sum + (app.price || 0), 0);
      
      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        receita: revenue,
        agendamentos: dayAppointments.length
      };
    });
  }, [appointments]);

  // Dados para gráfico de serviços mais populares
  const servicesData = useMemo(() => {
    const serviceCount: Record<string, number> = {};
    
    appointments.forEach(app => {
      serviceCount[app.service] = (serviceCount[app.service] || 0) + 1;
    });

    return Object.entries(serviceCount)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [appointments]);

  // Dados para gráfico de pizza - status dos agendamentos
  const statusData = useMemo(() => {
    const statusCount = {
      scheduled: 0,
      completed: 0,
      cancelled: 0
    };

    appointments.forEach(app => {
      statusCount[app.status as keyof typeof statusCount]++;
    });

    return [
      { name: 'Agendados', value: statusCount.scheduled, color: '#D4AF37' },
      { name: 'Concluídos', value: statusCount.completed, color: '#10B981' },
      { name: 'Cancelados', value: statusCount.cancelled, color: '#EF4444' }
    ];
  }, [appointments]);

  // Métricas principais
  const metrics = useMemo(() => {
    const totalRevenue = appointments
      .filter(app => app.status === 'completed')
      .reduce((sum, app) => sum + (app.price || 0), 0);

    const thisMonth = new Date().getMonth();
    const thisMonthAppointments = appointments.filter(app => 
      new Date(app.date).getMonth() === thisMonth
    );

    const averageTicket = totalRevenue / appointments.filter(app => app.status === 'completed').length || 0;

    return {
      totalRevenue,
      monthlyAppointments: thisMonthAppointments.length,
      totalClients: clients.length,
      averageTicket
    };
  }, [appointments, clients]);

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Receita Total"
          value={`R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Agendamentos concluídos"
          icon={<DollarSign className="h-6 w-6" />}
          variant="success"
        />
        
        <StatsCard
          title="Agendamentos/Mês"
          value={metrics.monthlyAppointments}
          description="Neste mês"
          icon={<Calendar className="h-6 w-6" />}
          variant="primary"
        />
        
        <StatsCard
          title="Total de Clientes"
          value={metrics.totalClients}
          description="Cadastrados"
          icon={<Users className="h-6 w-6" />}
          variant="info"
        />
        
        <StatsCard
          title="Ticket Médio"
          value={`R$ ${metrics.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Por agendamento"
          icon={<TrendingUp className="h-6 w-6" />}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Receita */}
        <Card>
          <CardHeader>
            <CardTitle>Receita dos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'receita' 
                      ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                      : value,
                    name === 'receita' ? 'Receita' : 'Agendamentos'
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="#D4AF37" 
                  strokeWidth={3}
                  name="Receita"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Serviços Mais Populares */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Mais Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={servicesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="service" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#D4AF37" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAnalytics;
