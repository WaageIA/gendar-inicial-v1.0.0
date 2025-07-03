
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter,
  SheetDescription 
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client } from '@/types';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface WhatsAppReminderDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WhatsAppReminderDialog: React.FC<WhatsAppReminderDialogProps> = ({
  client,
  open,
  onOpenChange,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const isMobile = useIsMobile();

  const templates = {
    confirmacao: {
      name: 'Confirmação de Agendamento',
      message: `Olá {{nome}}! 😊\n\nSeu agendamento está confirmado:\n📅 Data: [DATA]\n⏰ Horário: [HORÁRIO]\n💅 Serviço: [SERVIÇO]\n\nEstou ansiosa para te atender! Se precisar remarcar, me avise com antecedência.\n\nObrigada! 💖`
    },
    lembrete24h: {
      name: 'Lembrete 24h Antes',
      message: `Oi {{nome}}! 💕\n\nLembrando que amanhã você tem seu agendamento comigo:\n📅 Data: [DATA]\n⏰ Horário: [HORÁRIO]\n💅 Serviço: [SERVIÇO]\n\nEstou te esperando! Se tiver algum imprevisto, me avise. 😘`
    },
    lembrete2h: {
      name: 'Lembrete 2h Antes',
      message: `Oi {{nome}}! ⏰\n\nSeu horário é daqui a 2 horas:\n⏰ Horário: [HORÁRIO]\n💅 Serviço: [SERVIÇO]\n\nJá estou me preparando para te receber! Te espero aqui! 💖`
    },
    posAtendimento: {
      name: 'Pós-Atendimento',
      message: `Oi {{nome}}! 💅\n\nEspero que tenha gostado do resultado! Suas unhas ficaram lindas! ✨\n\nQualquer coisa, me chama! E não esqueça de cuidar bem delas seguindo as dicas que eu passei.\n\nObrigada pela confiança! 💕`
    },
    aniversario: {
      name: 'Aniversário',
      message: `PARABÉNS {{nome}}! 🎉🎂\n\nMuitas felicidades, saúde e realizações!\n\nQue tal comemorar com umas unhas lindas? Tenho uma surpresa especial para você! 💅✨\n\nMe chama para agendar! 💖`
    },
    promocao: {
      name: 'Promoção Especial',
      message: `Oi {{nome}}! 🔥\n\nTenho uma promoção especial só para você:\n💅 [DESCRIÇÃO DA PROMOÇÃO]\n⏰ Válida até: [DATA]\n\nNão perca! Me chama para agendar! 💖`
    },
    retorno: {
      name: 'Retorno de Cliente',
      message: `Oi {{nome}}! 💕\n\nSentindo sua falta aqui! Que tal agendar um novo horário para cuidar das suas unhas?\n\nTenho novidades incríveis para te mostrar! 💅✨\n\nMe chama quando puder! 😘`
    }
  };

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    if (templateKey && templates[templateKey as keyof typeof templates]) {
      const template = templates[templateKey as keyof typeof templates];
      const message = template.message.replace('{{nome}}', client?.name || '[NOME]');
      setCustomMessage(message);
    } else {
      setCustomMessage('');
    }
  };

  const handleSendWhatsApp = () => {
    if (!client || !customMessage.trim()) {
      toast.error('Selecione um template ou digite uma mensagem');
      return;
    }

    // Remove caracteres especiais do número de telefone
    const phoneNumber = client.phone.replace(/\D/g, '');
    
    // Adiciona código do país se não tiver
    const formattedPhone = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;
    
    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(customMessage);
    
    // Cria o link do WhatsApp
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    // Abre o WhatsApp
    window.open(whatsappUrl, '_blank');
    
    toast.success('Redirecionando para o WhatsApp...');
    onOpenChange(false);
  };

  const resetDialog = () => {
    setSelectedTemplate('');
    setCustomMessage('');
  };

  const FormContent = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="template" className="text-sm font-medium">Template de Mensagem</Label>
        <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
          <SelectTrigger className="min-h-[48px] text-base">
            <SelectValue placeholder="Selecione um template..." />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            {Object.entries(templates).map(([key, template]) => (
              <SelectItem key={key} value={key}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium">Mensagem</Label>
        <Textarea
          id="message"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Digite sua mensagem personalizada ou selecione um template acima..."
          className="min-h-[200px] text-base resize-none"
          style={{ fontSize: '16px' }}
        />
      </div>
      
      {selectedTemplate && (
        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
          <p className="font-medium">Dica:</p>
          <p>Substitua [DATA], [HORÁRIO], [SERVIÇO] pelas informações reais do agendamento.</p>
        </div>
      )}
    </div>
  );

  const ActionButtons = () => (
    <div className="flex gap-3 pt-4">
      <Button
        variant="outline"
        onClick={() => onOpenChange(false)}
        className="flex-1 min-h-[48px]"
      >
        Cancelar
      </Button>
      
      <Button
        onClick={handleSendWhatsApp}
        disabled={!customMessage.trim()}
        className="flex-1 bg-green-600 hover:bg-green-700 text-white min-h-[48px]"
      >
        <Send className="h-4 w-4 mr-2" />
        Enviar WhatsApp
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) resetDialog();
      }}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] flex flex-col p-0 rounded-t-xl border-t-2 border-nail-secondary"
        >
          <SheetHeader className="px-4 pt-4 pb-2 border-b border-nail-secondary/50">
            <SheetTitle className="flex items-center gap-2 text-nail-dark text-lg font-semibold text-left">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Enviar Lembrete WhatsApp
            </SheetTitle>
            {client && (
              <SheetDescription className="text-left text-sm text-muted-foreground">
                Enviar mensagem para {client.name} ({client.phone})
              </SheetDescription>
            )}
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
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetDialog();
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Enviar Lembrete WhatsApp
          </DialogTitle>
          <DialogDescription>
            {client && `Enviar mensagem para ${client.name} (${client.phone})`}
          </DialogDescription>
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

export default WhatsAppReminderDialog;
