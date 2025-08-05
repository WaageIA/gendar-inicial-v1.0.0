import React from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Settings as SettingsIcon, QrCode, DollarSign, Database, Smartphone, Users } from 'lucide-react';
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

        <div className="grid grid-cols-1 gap-6">
          {/* Quick Settings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card 
              className="border-nail-secondary cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/settings/customer-portal')}
            >
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-nail-primary" />
                <h3 className="font-semibold text-nail-dark mb-1">Portal do Cliente</h3>
                <p className="text-sm text-gray-600">Configure o autoatendimento</p>
                <ChevronRight className="h-4 w-4 mx-auto mt-2 text-gray-400" />
              </CardContent>
            </Card>

            <Card 
              className="border-nail-secondary cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/settings/digital-card')}
            >
              <CardContent className="p-6 text-center">
                <QrCode className="h-8 w-8 mx-auto mb-2 text-nail-primary" />
                <h3 className="font-semibold text-nail-dark mb-1">Cartão Digital</h3>
                <p className="text-sm text-gray-600">QR Code e links</p>
                <ChevronRight className="h-4 w-4 mx-auto mt-2 text-gray-400" />
              </CardContent>
            </Card>

            <Card className="border-nail-secondary">
              <CardContent className="p-6 text-center">
                <Database className="h-8 w-8 mx-auto mb-2 text-nail-primary" />
                <h3 className="font-semibold text-nail-dark mb-1">Backup</h3>
                <p className="text-sm text-gray-600">Dados e segurança</p>
                <ChevronRight className="h-4 w-4 mx-auto mt-2 text-gray-400" />
              </CardContent>
            </Card>
          </div>

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