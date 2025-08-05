
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter 
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Client, Appointment, Service } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { appointmentSchema, AppointmentFormData } from '@/utils/validation';
import { serviceService } from '@/services/serviceService';
import { z } from 'zod';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  onSave: (appointment: Omit<Appointment, 'id'>) => void;
}

const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  open,
  onOpenChange,
  client,
  onSave
}) => {
  const [formData, setFormData] = useState<Omit<AppointmentFormData, 'date'> & { date: string }>({
    clientId: '',
    clientName: '',
    date: new Date().toISOString().slice(0, 16),
    service: 'Molde F1 Completo',
    duration: 60,
    price: 80.00,
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();
  
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await serviceService.getServices();
      if (data) {
        setServices(data);
      } else {
        console.error("Erro ao buscar serviços:", error);
        toast.error("Erro ao carregar serviços.");
      }
    };
    fetchServices();
  }, []);

  // Update price when service changes
  useEffect(() => {
    const selectedService = services.find(s => s.name === formData.service);
    if (selectedService) {
      setFormData(prev => ({ ...prev, price: selectedService.price }));
    } else {
      setFormData(prev => ({ ...prev, price: 0 })); // Set to 0 or a default if no service is selected
    }
  }, [formData.service, services]);

  // Reset form when dialog opens/closes or client changes
  useEffect(() => {
    if (open && client) {
      setFormData({
        clientId: client.id,
        clientName: client.name,
        date: new Date().toISOString().slice(0, 16),
        service: 'Molde F1 Completo',
        duration: 60,
        price: 80.00,
        notes: ''
      });
      setErrors({});
    }
  }, [open, client]);

  const validateForm = (): boolean => {
    try {
      // Convert date string to Date object for validation
      const validationData = {
        ...formData,
        date: new Date(formData.date)
      };
      appointmentSchema.parse(validationData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const updateFormData = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!client) {
      toast.error("Informações do cliente ausentes");
      return;
    }

    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }
    
    onSave({
      clientId: client.id,
      clientName: client.name,
      date: new Date(formData.date),
      service: formData.service,
      duration: formData.duration,
      status: 'scheduled',
      notes: formData.notes,
      price: formData.price
    });
    
    onOpenChange(false);
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-medium">Data & Hora *</Label>
        <Input
          id="date"
          type="datetime-local"
          value={formData.date}
          onChange={(e) => updateFormData('date', e.target.value)}
          className={`min-h-[48px] text-base ${errors.date ? 'border-red-500' : ''}`}
          style={{ fontSize: '16px' }}
        />
        {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="service" className="text-sm font-medium">Serviço *</Label>
        <Select 
          value={formData.service}
          onValueChange={(value) => updateFormData('service', value)}
        >
          <SelectTrigger className={`min-h-[48px] text-base ${errors.service ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Selecione o serviço" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            {services.map((svc) => (
              <SelectItem key={svc.id} value={svc.name}>
                {svc.name} - R$ {svc.price.toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.service && <p className="text-sm text-red-500">{errors.service}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price" className="text-sm font-medium">Valor do Serviço *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
            className={`min-h-[48px] text-base pl-10 ${errors.price ? 'border-red-500' : ''}`}
            placeholder="0,00"
            style={{ fontSize: '16px' }}
          />
        </div>
        {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
        <p className="text-xs text-gray-500">
          Preço padrão: {services.find(s => s.name === formData.service)?.price.toFixed(2) || 'N/A'}
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="duration" className="text-sm font-medium">Duração (minutos) *</Label>
        <Select 
          value={formData.duration.toString()}
          onValueChange={(value) => updateFormData('duration', parseInt(value))}
        >
          <SelectTrigger className={`min-h-[48px] text-base ${errors.duration ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Selecione a duração" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            <SelectItem value="30">30 minutos</SelectItem>
            <SelectItem value="45">45 minutos</SelectItem>
            <SelectItem value="60">60 minutos</SelectItem>
            <SelectItem value="90">90 minutos</SelectItem>
            <SelectItem value="120">120 minutos</SelectItem>
          </SelectContent>
        </Select>
        {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => updateFormData('notes', e.target.value)}
          className="min-h-[100px] text-base resize-none"
          placeholder="Observações adicionais sobre este agendamento..."
          style={{ fontSize: '16px' }}
        />
      </div>
    </form>
  );

  const ActionButtons = () => (
    <div className="flex gap-3 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => onOpenChange(false)}
        className="flex-1 min-h-[48px]"
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        className="flex-1 nail-button min-h-[48px]"
        onClick={handleSubmit}
      >
        Agendar
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] flex flex-col p-0 rounded-t-xl border-t-2 border-nail-secondary"
        >
          <SheetHeader className="px-4 pt-4 pb-2 border-b border-nail-secondary/50">
            <SheetTitle className="text-nail-dark text-lg font-semibold text-left">
              {client ? `Agendar para ${client.name}` : 'Novo Agendamento'}
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="flex-1 px-4">
            <div className="py-4">
              <FormContent />
            </div>
          </ScrollArea>
          
          <SheetFooter className="px-4 pb-4 pt-2 border-t border-nail-secondary/50 mt-auto">
            <ActionButtons />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-nail-dark">
            {client ? `Agendar para ${client.name}` : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="pt-4">
            <FormContent />
          </div>
        </ScrollArea>
        
        <DialogFooter className="pt-4 mt-auto">
          <ActionButtons />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;
