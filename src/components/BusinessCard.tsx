
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Instagram, Phone } from 'lucide-react';

interface BusinessCardProps {
  studioName: string;
  professional: string;
  phone: string;
  instagram?: string;
  services: Array<{
    name: string;
    price: string;
  }>;
}

const BusinessCard: React.FC<BusinessCardProps> = ({
  studioName,
  professional,
  phone,
  instagram,
  services
}) => {
  return <Card className="w-full max-w-md mx-auto overflow-hidden border-2 border-nail-primary">
      <CardHeader className="bg-gradient-to-r from-nail-primary to-nail-accent p-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Studio Logo" className="h-12 w-12 rounded-full bg-white p-1" />
            <div>
              <h2 className="text-2xl font-bold">{studioName}</h2>
              <p className="text-sm opacity-90">Especialista em Molde F1</p>
            </div>
          </div>
        </div>
        <p className="mt-2 text-lg">Profissional: {professional}</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-3 text-nail-dark">Nossos Serviços:</h3>
        <ul className="space-y-2">
          {services.map((service, index) => <li key={index} className="flex justify-between items-center border-b border-nail-secondary pb-1">
              <span>{service.name}</span>
              <span className="font-medium text-nail-dark">{service.price}</span>
            </li>)}
        </ul>
      </CardContent>
      
      <CardFooter className="bg-nail-light p-4 flex flex-col items-start space-y-2">
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-nail-dark" />
          <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-nail-dark hover:underline">
            {phone}
          </a>
        </div>
        
        {instagram && <div className="flex items-center">
            <Instagram className="h-4 w-4 mr-2 text-nail-dark" />
            <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-nail-dark hover:underline">
              {instagram}
            </a>
          </div>}
          
        <div className="flex items-center mt-2">
          <img src="/logo.png" alt="Studio Logo" className="h-6 w-6 mr-2" />
          <span className="text-xs text-nail-accent">Agendamentos simples, atendimentos incríveis</span>
        </div>
      </CardFooter>
    </Card>;
};

export default BusinessCard;
