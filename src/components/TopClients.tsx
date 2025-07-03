
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Calendar } from 'lucide-react';
import { Client } from '@/types';

interface TopClientsProps {
  clients: Client[];
  onClientSelect?: (client: Client) => void;
}

const TopClients: React.FC<TopClientsProps> = ({ clients, onClientSelect }) => {
  // Sort clients by rating and take top 5
  const topClients = clients
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top Clientes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topClients.length > 0 ? (
          topClients.map((client) => (
            <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-nail-light">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-nail-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-nail-dark">{client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ⭐ {client.rating}/5
                  </p>
                </div>
              </div>
              {onClientSelect && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onClientSelect(client)}
                  className="text-xs"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Agendar
                </Button>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum cliente cadastrado
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TopClients;
