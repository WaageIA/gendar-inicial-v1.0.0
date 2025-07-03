import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { serviceService } from '@/services/serviceService';
import { Service } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const ServiceSettings = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({ name: '', price: '' });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  const fetchServices = async () => {
    setIsLoading(true);
    const { data, error } = await serviceService.getServices();
    if (error) {
      toast.error('Erro ao carregar serviços.');
      console.error('Error fetching services:', error);
    } else {
      setServices(data || []);
    }
    setIsLoading(false);
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price) {
      toast.error('Preencha o nome e o preço do serviço.');
      return;
    }
    const servicePrice = parseFloat(newService.price);
    if (isNaN(servicePrice) || servicePrice <= 0) {
      toast.error('Preço inválido. Insira um número positivo.');
      return;
    }

    const { data, error } = await serviceService.createService({
      name: newService.name,
      price: servicePrice,
    });

    if (error) {
      toast.error('Erro ao adicionar serviço.');
      console.error('Error adding service:', error);
    } else if (data) {
      setNewService({ name: '', price: '' });
      toast.success('Serviço adicionado com sucesso!');
      fetchServices();
    }
  };

  const handleUpdateService = async (id: string, field: string, value: string | number) => {
    const updatedValue = field === 'price' ? parseFloat(value as string) : value;
    const { error } = await serviceService.updateService(id, { [field]: updatedValue });
    if (error) {
      toast.error('Erro ao atualizar serviço.');
      console.error('Error updating service:', error);
    } else {
      toast.success('Serviço atualizado com sucesso!');
      fetchServices();
    }
  };

  const handleDeleteService = async (id: string) => {
    const { error } = await serviceService.deleteService(id);
    if (error) {
      toast.error('Erro ao remover serviço.');
      console.error('Error deleting service:', error);
    } else {
      toast.success('Serviço removido com sucesso!');
      fetchServices();
    }
  };

  if (isLoading) {
    return <p className="text-center text-muted-foreground">Carregando serviços...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Adicionar Novo Serviço */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <Label htmlFor="service-name" className="text-nail-dark font-medium">Nome do Serviço</Label>
          <Input
            id="service-name"
            placeholder="Ex: Manicure"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
            className="mt-1 border-nail-secondary focus:ring-nail-primary"
          />
        </div>
        <div>
          <Label htmlFor="service-price" className="text-nail-dark font-medium">Preço</Label>
          <Input
            id="service-price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={newService.price}
            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
            className="mt-1 border-nail-secondary focus:ring-nail-primary"
          />
        </div>
        <Button onClick={handleAddService} className="nail-button">
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Serviço
        </Button>
      </div>

      {/* Lista de Serviços Existentes */}
      <div className="space-y-4">
        {services.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhum serviço cadastrado.</p>
        ) : (
          services.map((service) => (
            <div key={service.id} className="flex items-center gap-4 p-3 border border-nail-secondary rounded-md bg-white shadow-sm">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <Input
                    value={service.name}
                    onChange={(e) => handleUpdateService(service.id, 'name', e.target.value)}
                    className="mt-1 border-nail-secondary focus:ring-nail-primary"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Preço</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={service.price}
                    onChange={(e) => handleUpdateService(service.id, 'price', parseFloat(e.target.value))}
                    className="mt-1 border-nail-secondary focus:ring-nail-primary"
                  />
                </div>
              </div>
              <Button variant="destructive" size="icon" onClick={() => handleDeleteService(service.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceSettings;
