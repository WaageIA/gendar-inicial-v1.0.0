
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useServicesByBusiness } from '@/hooks/useServices';
import { Service } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { Clock, DollarSign } from 'lucide-react';

interface ServiceSelectionProps {
  onSelectService: (service: Service) => void;
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({ onSelectService }) => {
  const { business_slug } = useParams<{ business_slug: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    data: services = [], 
    isLoading, 
    error, 
    refetch 
  } = useServicesByBusiness(business_slug);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (isLoading) return <LoadingState message="Carregando serviços..." />;
  if (error) return <ErrorState message={error.message || 'Erro ao carregar serviços'} onRetry={() => refetch()} />;

  if (services.length === 0) {
    return (
      <ErrorState 
        message="Nenhum serviço disponível no momento." 
        title="Sem serviços"
        showRetry={false}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Escolha seu serviço
        </h2>
        <p className="text-gray-600">
          Selecione o serviço que deseja agendar
        </p>
      </div>

      <Input
        placeholder="Pesquisar serviço..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="max-w-md mx-auto"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service, index) => (
          <Card 
            key={service.id} 
            onClick={() => onSelectService(service)} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary"
          >
            {service.image_url && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img 
                  src={service.image_url} 
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                {index < 3 && (
                  <Badge variant="secondary" className="text-xs">
                    Popular
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {service.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {service.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <DollarSign className="h-4 w-4" />
                  {formatPrice(service.price)}
                </div>
                
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock className="h-4 w-4" />
                  {service.duration} min
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Nenhum serviço encontrado para "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};
