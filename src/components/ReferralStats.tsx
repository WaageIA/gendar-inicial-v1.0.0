
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client } from '@/types';
import { Users } from 'lucide-react';

interface ReferralStatsProps {
  clients: Client[];
}

const ReferralStats: React.FC<ReferralStatsProps> = ({ clients }) => {
  // Count referrals by each client
  const referralCounts = clients.reduce((counts: Record<string, number>, client) => {
    if (client.indicatedBy) {
      if (!counts[client.indicatedBy]) {
        counts[client.indicatedBy] = 0;
      }
      counts[client.indicatedBy]++;
    }
    return counts;
  }, {});
  
  // Get top referrers
  const topReferrers = Object.entries(referralCounts)
    .map(([clientId, count]) => ({ 
      client: clients.find(c => c.id === clientId) || { id: clientId, name: 'Cliente Desconhecido' }, 
      count 
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Get total referral count
  const totalReferrals = clients.filter(client => client.indicatedBy).length;
  
  return (
    <Card className="nail-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" /> Estatísticas de Indicações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Total de clientes indicados</p>
            <p className="text-2xl font-bold">{totalReferrals}</p>
          </div>
          
          {topReferrers.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Principais indicadores</p>
              <ul className="space-y-2">
                {topReferrers.map(({ client, count }) => (
                  <li key={client.id} className="flex justify-between items-center">
                    <span>{client.name}</span>
                    <span className="font-semibold">{count} indicações</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {topReferrers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma indicação registrada ainda.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralStats;
