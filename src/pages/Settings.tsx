import React from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Settings as SettingsIcon, Database, Smartphone } from 'lucide-react';
import ServiceSettings from '@/components/ServiceSettings';
import BackupManager from '@/components/BackupManager';

const Settings = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold gold-text">Configurações</h1>
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

          <TabsContent value="automation" className="space-y-6">
            <Tabs defaultValue="backup" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="backup" className="gap-2">
                  <Database className="h-4 w-4" />
                  Backup & Restauração
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Smartphone className="h-4 w-4" />
                  Notificações
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  Configurações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="backup" className="mt-6">
                <BackupManager />
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuração de Notificações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Sistema de notificações em desenvolvimento. 
                      Em breve você poderá configurar lembretes automáticos para clientes.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações Avançadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Configurações avançadas do sistema em desenvolvimento.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
