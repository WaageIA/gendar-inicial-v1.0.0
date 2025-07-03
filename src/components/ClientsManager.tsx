
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Client, Appointment } from '@/types';
import ClientCard from './ClientCard';
import { UserPlus, Search, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ClientsManagerProps {
  clients: Client[];
  appointments?: Appointment[];
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onScheduleAppointment: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
  onWhatsAppReminder: (client: Client) => void;
}

const ClientsManager: React.FC<ClientsManagerProps> = ({
  clients,
  appointments = [],
  onAddClient,
  onEditClient,
  onScheduleAppointment,
  onDeleteClient,
  onWhatsAppReminder
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const isMobile = useIsMobile();
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );
  
  return (
    <div className="mobile-spacing">
      {/* Header responsivo */}
      <div className={cn(
        "flex justify-between items-center gap-3 mb-4 sm:mb-6",
        isMobile ? "flex-col space-y-3" : "flex-row"
      )}>
        <h2 className={cn(
          "font-bold text-nail-dark text-center sm:text-left",
          isMobile ? "text-xl" : "text-2xl"
        )}>
          Gerenciamento de Clientes
        </h2>
        <Button 
          onClick={onAddClient} 
          className={cn(
            "nail-button shadow-md hover:shadow-lg",
            isMobile ? "w-full" : "w-auto"
          )}
        >
          <UserPlus className="w-4 h-4 mr-2" /> 
          <span className="font-semibold">Adicionar Cliente</span>
        </Button>
      </div>
      
      {/* Barra de pesquisa otimizada */}
      <div className="relative mb-6">
        <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            "pl-10 pr-4 shadow-sm border-2 focus:border-nail-primary transition-all duration-200",
            isMobile ? "text-base h-12" : "h-11"
          )}
          style={{ fontSize: isMobile ? '16px' : undefined }} // Evita zoom no iOS
        />
      </div>
      
      {/* Grid de clientes otimizado */}
      <div className="pt-2">
        {filteredClients.length > 0 ? (
          <div className="mobile-grid">
            {filteredClients.map(client => (
              <ClientCard
                key={client.id}
                client={client}
                appointments={appointments}
                onEditClick={onEditClient}
                onScheduleClick={onScheduleAppointment}
                onDeleteClick={onDeleteClient}
                onWhatsAppClick={onWhatsAppReminder}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto bg-nail-light rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-nail-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-nail-dark">
                  {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {searchTerm 
                    ? 'Tente ajustar sua busca ou limpar o filtro.' 
                    : 'Adicione seu primeiro cliente para começar a gerenciar seus atendimentos.'
                  }
                </p>
              </div>
              {!searchTerm && (
                <Button 
                  onClick={onAddClient}
                  className="nail-button mt-4"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Cliente
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsManager;
