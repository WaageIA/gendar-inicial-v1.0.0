import React from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Settings as SettingsIcon, QrCode, DollarSign, Database, Smartphone } from 'lucide-react';
import ServiceSettings from '@/components/ServiceSettings';
import BackupManager from '@/components/BackupManager';
import { Button } from '@/components/ui/button';
import DigitalBusinessCardSettings from '@/pages/DigitalBusinessCardSettings';

const Settings = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold gold-text">Configurações</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Tabs defaultValue="services" className="space-y-6">
            <TabsList className="flex w-full justify-start items-center gap-2 bg-nail-light rounded-md p-2">
              <TabsTrigger value="services" className="flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-nail transition text-slate-950 data-[state=active]:bg-nail-primary data-[state=active]:text-white data-[state=active]:font-semibold">
                <DollarSign className="h-4 w-4" />
                Serviços
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-nail transition text-slate-950 data-[state=active]:bg-nail-primary data-[state=active]:text-white data-[state=active]:font-semibold">
                <SettingsIcon className="h-4 w-4" />
                Automação
              </TabsTrigger>
              <TabsTrigger value="digital-card" className="flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-nail transition text-slate-950 data-[state=active]:bg-nail-primary data-[state=active]:text-white data-[state=active]:font-semibold" onClick={() => navigate('/settings/digital-card')}>
                <QrCode className="h-4 w-4" />
                Cartão Digital
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-6">
              <Card className="border-nail-secondary">
                <CardHeader className="bg-nail-light/50">
                  <CardTitle className="flex items-center text-nail-dark">
                    <SettingsIcon className="h-5 w-5 mr-2" />
                    Configurações de Serviços
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ServiceSettings />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="digital-card" className="space-y-6">
              <Card className="border-nail-secondary">
                <CardHeader className="bg-nail-light/50">
                  <CardTitle className="flex items-center text-nail-dark">
                    <QrCode className="h-5 w-5 mr-2" />
                    Configurações do Cartão Digital
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <DigitalBusinessCardSettings />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;