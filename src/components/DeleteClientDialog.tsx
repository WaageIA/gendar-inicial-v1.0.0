
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Client } from '@/types';
import { Input } from '@/components/ui/input';
import { clientService } from '@/services/clientService';
import { toast } from 'sonner';

interface DeleteClientDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

const DeleteClientDialog: React.FC<DeleteClientDialogProps> = ({
  client,
  open,
  onOpenChange,
  onDeleted,
}) => {
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!client) return;
    
    if (confirmation !== client.name) {
      toast.error('Por favor, digite o nome do cliente corretamente para confirmar a exclusão');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await clientService.deleteClient(client.id);
      
      if (error) {
        toast.error(`Erro ao excluir cliente: ${error}`);
      } else {
        toast.success('Cliente excluído com sucesso');
        onOpenChange(false);
        onDeleted();
        setConfirmation('');
      }
    } catch (error) {
      toast.error('Erro ao excluir cliente');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Excluir Cliente</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. O cliente e todos os seus dados serão permanentemente excluídos.
          </DialogDescription>
        </DialogHeader>
        
        {client && (
          <div className="py-4 space-y-4">
            <div className="bg-red-50 p-3 rounded-md border border-red-200">
              <p className="text-sm text-red-800">
                Para confirmar, digite <strong>{client.name}</strong> abaixo:
              </p>
            </div>
            
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Digite o nome do cliente"
              className="nail-input"
            />
          </div>
        )}
        
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setConfirmation('');
            }}
          >
            Cancelar
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || confirmation !== (client?.name || '')}
          >
            {loading ? 'Excluindo...' : 'Excluir Cliente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteClientDialog;
