
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import BusinessCard from '@/components/BusinessCard';
import ShareOptions from '@/components/ShareOptions';
import AppointmentRequest from '@/components/AppointmentRequest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Marketing = () => {
  // Dados do Studio
  const studioData = {
    studioName: 'Gendar',
    professional: 'Anisy Candine',
    phone: '(21) 99999-9999',
    instagram: '@anisycandine',
    services: [
      { name: 'Molde F1 Novo', price: 'R$ 120,00' },
      { name: 'Manutenção Molde F1', price: 'R$ 80,00' },
      { name: 'Blindagem em Gel', price: 'R$ 60,00' },
      { name: 'Remoção', price: 'R$ 40,00' },
      { name: 'Decoração (por unha)', price: 'R$ 5,00' }
    ]
  };

  // Constante com a URL do cartão digital
  const cardUrl = window.location.origin + '/card/' + encodeURIComponent(studioData.studioName);
  
  // Estado para controlar qual tab está ativa  
  const [activeTab, setActiveTab] = useState('cartao');

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-nail-dark">Marketing Digital</h1>
          <p className="text-muted-foreground">
            Crie e compartilhe seu cartão digital para atrair novos clientes
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-nail-dark">
              Previsualização do Cartão Digital
            </h2>
            <BusinessCard {...studioData} />
          </div>
          
          <div className="space-y-6">
            <Tabs 
              defaultValue="compartilhar" 
              className="w-full"
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="compartilhar">Compartilhar</TabsTrigger>
                <TabsTrigger value="agendamento">Agendamento</TabsTrigger>
              </TabsList>
              
              <TabsContent value="compartilhar" className="mt-4">
                <ShareOptions 
                  shareUrl={cardUrl} 
                  studioName={studioData.studioName} 
                />
              </TabsContent>
              
              <TabsContent value="agendamento" className="mt-4">
                <AppointmentRequest 
                  phone={studioData.phone}
                  services={studioData.services}
                />
              </TabsContent>
            </Tabs>
            
            <div className="bg-nail-light p-4 rounded-lg border border-nail-secondary">
              <h3 className="text-sm font-medium mb-2">Como isso funciona:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Compartilhe seu cartão digital nas redes sociais</li>
                <li>• Clientes podem solicitar agendamentos via WhatsApp</li>
                <li>• Aumente sua visibilidade online</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-white rounded-lg border border-nail-secondary">
          <h2 className="text-lg font-semibold mb-3 text-nail-dark">
            Estratégias de Marketing Digital
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-3 bg-nail-light rounded border border-nail-secondary">
              <h3 className="font-medium mb-2">Compartilhe nos Stories</h3>
              <p className="text-sm text-muted-foreground">
                Poste regularmente seu cartão nos stories do Instagram para maior visibilidade.
              </p>
            </div>
            
            <div className="p-3 bg-nail-light rounded border border-nail-secondary">
              <h3 className="font-medium mb-2">Oferta para Indicações</h3>
              <p className="text-sm text-muted-foreground">
                Incentive clientes a indicarem amigas com descontos especiais.
              </p>
            </div>
            
            <div className="p-3 bg-nail-light rounded border border-nail-secondary">
              <h3 className="font-medium mb-2">Parcerias com Influencers</h3>
              <p className="text-sm text-muted-foreground">
                Busque parcerias locais para ampliar seu alcance.
              </p>
            </div>
            
            <div className="p-3 bg-nail-light rounded border border-nail-secondary">
              <h3 className="font-medium mb-2">Grupo no WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Crie um grupo para promoções exclusivas e novidades.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Marketing;
