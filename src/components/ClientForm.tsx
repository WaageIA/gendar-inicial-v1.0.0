import React, { useState, useEffect } from 'react';
import { Client } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import StarRating from './StarRating';
import { v4 as uuidv4 } from 'uuid';
import DeleteClientDialog from './DeleteClientDialog';
import { Trash } from 'lucide-react';
import { clientService } from '@/services/clientService';
import { toast } from 'sonner';
import { clientSchema, ClientFormData } from '@/utils/validation';
import { z } from 'zod';
import { useIsMobile } from '@/hooks/use-mobile';

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  clients: Client[];
  onSave: (client: Client) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({
  open,
  onOpenChange,
  client,
  clients,
  onSave
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    rating: 5,
    notes: '',
    indicatedBy: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Reset form fields when the client changes
  useEffect(() => {
    if (open) { // Only reset when dialog opens
      if (client) {
        setFormData({
          name: client.name,
          phone: client.phone,
          email: client.email || '',
          birthDate: client.birthDate || '',
          rating: client.rating,
          notes: client.notes || '',
          indicatedBy: client.indicatedBy || '',
        });
      } else {
        setFormData({
          name: '',
          phone: '',
          email: '',
          birthDate: '',
          rating: 5,
          notes: '',
          indicatedBy: '',
        });
      }
      setErrors({});
    }
  }, [client, open]);

  const validateForm = (): boolean => {
    try {
      clientSchema.parse(formData);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }
    
    try {
      const indicatedByClient = formData.indicatedBy !== 'none' && formData.indicatedBy 
        ? clients.find(c => c.id === formData.indicatedBy) 
        : null;
      const indicatedByName = indicatedByClient?.name;
      
      const newClient: Client = {
        id: client?.id || uuidv4(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email || '',
        birthDate: formData.birthDate || undefined,
        rating: formData.rating,
        notes: formData.notes || undefined,
        createdAt: client?.createdAt || new Date(),
        indicatedBy: formData.indicatedBy && formData.indicatedBy !== 'none' ? formData.indicatedBy : undefined,
        indicatedByName: indicatedByName,
        loyaltyPoints: client?.loyaltyPoints || 0,
        loyaltyLevel: client?.loyaltyLevel || 'Bronze'
      };
      
      onSave(newClient);
      onOpenChange(false);
      toast.success(client ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Erro ao salvar cliente');
    }
  };
  
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const updateFormData = (field: keyof ClientFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">Nome *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="Nome do cliente"
          className={`min-h-[48px] text-base ${errors.name ? 'border-destructive' : ''}`}
          style={{ fontSize: '16px' }} // Evita zoom no iOS
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium">Telefone *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => updateFormData('phone', e.target.value)}
          placeholder="(00) 00000-0000"
          className={`min-h-[48px] text-base ${errors.phone ? 'border-destructive' : ''}`}
          style={{ fontSize: '16px' }}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          placeholder="email@exemplo.com"
          className={`min-h-[48px] text-base ${errors.email ? 'border-destructive' : ''}`}
          style={{ fontSize: '16px' }}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="birthDate" className="text-sm font-medium">Data de Nascimento</Label>
        <Input
          id="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={(e) => updateFormData('birthDate', e.target.value)}
          className="min-h-[48px] text-base"
          style={{ fontSize: '16px' }}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="rating" className="text-sm font-medium">Avaliação</Label>
        <div className="py-2">
          <StarRating 
            rating={formData.rating} 
            onRatingChange={(rating) => updateFormData('rating', rating)} 
            size="large" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="indicatedBy" className="text-sm font-medium">Indicado por</Label>
        <Select 
          value={formData.indicatedBy || 'none'} 
          onValueChange={(value) => updateFormData('indicatedBy', value === 'none' ? '' : value)}
        >
          <SelectTrigger className="min-h-[48px] text-base">
            <SelectValue placeholder="Selecione o cliente que indicou" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            <SelectItem value="none">Nenhum</SelectItem>
            {clients
              .filter(c => c.id !== client?.id)
              .map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => updateFormData('notes', e.target.value)}
          placeholder="Observações sobre este cliente..."
          className="min-h-[100px] text-base resize-none"
          style={{ fontSize: '16px' }}
        />
      </div>
    </form>
  );

  const ActionButtons = () => (
    <div className="flex flex-col-reverse sm:flex-row w-full gap-3 pt-4">
      {client && (
        <Button 
          type="button" 
          variant="outline" 
          className="text-destructive border-destructive hover:bg-destructive/10 min-h-[48px] order-2 sm:order-none"
          onClick={handleDelete}
        >
          <Trash className="w-4 h-4 mr-2" />
          Excluir
        </Button>
      )}
      
      <div className="flex gap-3 ml-auto order-1 sm:order-none">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          className="flex-1 sm:flex-none min-h-[48px]"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="flex-1 sm:flex-none nail-button min-h-[48px]"
          onClick={handleSubmit}
        >
          Salvar
        </Button>
      </div>
    </div>
  );
  
  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent 
            side="bottom" 
            className="h-[90vh] flex flex-col p-0 rounded-t-xl border-t-2 border-nail-secondary"
          >
            <SheetHeader className="px-4 pt-4 pb-2 border-b border-nail-secondary/50">
              <SheetTitle className="text-nail-dark text-lg font-semibold text-left">
                {client ? `Editar Cliente: ${client.name}` : 'Novo Cliente'}
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
        
        <DeleteClientDialog
          client={client || null}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDeleted={() => {
            onOpenChange(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-nail-dark">
              {client ? `Editar Cliente: ${client.name}` : 'Novo Cliente'}
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
      
      <DeleteClientDialog
        client={client || null}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleted={() => {
          onOpenChange(false);
        }}
      />
    </>
  );
};

export default ClientForm;
