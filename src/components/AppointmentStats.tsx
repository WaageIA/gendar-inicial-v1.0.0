import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Check, X, BarChart3 } from 'lucide-react';
import { StatsCard } from '@/components/ui/design-system';
interface AppointmentStatsProps {
  stats: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
  };
}
const AppointmentStats: React.FC<AppointmentStatsProps> = React.memo(({
  stats
}) => {
  console.log('[Agendamentos] Renderizando estatísticas:', stats);
  const statsData = [{
    title: 'Total',
    value: stats.total || 0,
    icon: <BarChart3 className="h-6 w-6" />,
    variant: 'info' as const,
    description: 'Agendamentos'
  }, {
    title: 'Agendados',
    value: stats.scheduled || 0,
    icon: <Calendar className="h-6 w-6" />,
    variant: 'primary' as const,
    description: 'Pendentes'
  }, {
    title: 'Concluídos',
    value: stats.completed || 0,
    icon: <Check className="h-6 w-6" />,
    variant: 'success' as const,
    description: 'Finalizados'
  }, {
    title: 'Cancelados',
    value: stats.cancelled || 0,
    icon: <X className="h-6 w-6" />,
    variant: 'danger' as const,
    description: 'Cancelados'
  }];
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in mx-[21px] my-0 px-[11px] py-0">
      {statsData.map((stat, index) => <StatsCard key={stat.title} title={stat.title} value={stat.value} description={stat.description} icon={stat.icon} variant={stat.variant} className="animate-slide-in-bottom" style={{
      animationDelay: `${index * 100}ms`
    } as React.CSSProperties} />)}
    </div>;
});
AppointmentStats.displayName = 'AppointmentStats';
export default AppointmentStats;