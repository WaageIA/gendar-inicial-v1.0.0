
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from '@/components/ui/use-toast';
import { Calendar } from 'lucide-react';

interface AppointmentRequestProps {
  phone: string;
  services: Array<{name: string, price: string}>;
}

const AppointmentRequest: React.FC<AppointmentRequestProps> = ({
  phone,
  services
}) => {
  const [name, setName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedService, setSelectedService] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !contactPhone || !selectedService) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }
    
    // Formatar mensagem para WhatsApp
    const message = `Olá! Meu nome é ${name} e gostaria de agendar o serviço: ${selectedService}. Meu telefone para contato: ${contactPhone}`;
    
    // Número formatado para link do WhatsApp (remover caracteres não numéricos)
    const formattedPhone = phone.replace(/\D/g, '');
    
    // Abrir WhatsApp com mensagem pré-preenchida
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    
    toast({
      title: "Solicitação enviada!",
      description: "Sua solicitação de agendamento foi enviada pelo WhatsApp.",
    });
    
    // Limpar formulário
    setName('');
    setContactPhone('');
    setSelectedService('');
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-nail-dark">
          <Calendar className="h-5 w-5 mr-2" />
          Solicitar Agendamento
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Seu Nome</Label>
            <Input 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Seu Telefone</Label>
            <Input 
              id="phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="service">Serviço Desejado</Label>
            <select 
              id="service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full border border-input rounded-md h-10 px-3 py-2 text-base md:text-sm"
            >
              <option value="">Selecione um serviço</option>
              {services.map((service, index) => (
                <option key={index} value={service.name}>
                  {service.name} - {service.price}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full bg-nail-primary hover:bg-nail-dark">
            Solicitar via WhatsApp
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AppointmentRequest;
