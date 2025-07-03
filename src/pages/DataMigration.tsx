
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { clientService } from '@/services/clientService';
import { appointmentService } from '@/services/appointmentService';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DataMigration: React.FC = () => {
  const [migratingClients, setMigratingClients] = useState(false);
  const [migratingAppointments, setMigratingAppointments] = useState(false);
  const [clientsMigrated, setClientsMigrated] = useState(false);
  const [appointmentsMigrated, setAppointmentsMigrated] = useState(false);
  const navigate = useNavigate();

  const migrateClients = async () => {
    setMigratingClients(true);
    try {
      const { error, data, message } = await clientService.migrateClientsFromLocalStorage();
      if (error) {
        toast.error(`Erro ao migrar clientes: ${error}`);
      } else if (message) {
        toast.info(message);
        setClientsMigrated(true);
      } else if (data) {
        toast.success(`${data.length} clientes migrados com sucesso!`);
        setClientsMigrated(true);
      }
    } catch (error) {
      toast.error('Erro ao migrar clientes');
      console.error(error);
    } finally {
      setMigratingClients(false);
    }
  };

  const migrateAppointments = async () => {
    setMigratingAppointments(true);
    try {
      const { error, data, message } = await appointmentService.migrateAppointmentsFromLocalStorage();
      if (error) {
        toast.error(`Erro ao migrar agendamentos: ${error}`);
      } else if (message) {
        toast.info(message);
        setAppointmentsMigrated(true);
      } else if (data) {
        toast.success(`${data.length} agendamentos migrados com sucesso!`);
        setAppointmentsMigrated(true);
      }
    } catch (error) {
      toast.error('Erro ao migrar agendamentos');
      console.error(error);
    } finally {
      setMigratingAppointments(false);
    }
  };

  const goToApp = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-nail-primary mb-6">Migração de Dados</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="nail-card">
            <CardHeader>
              <CardTitle>Migrar Clientes</CardTitle>
              <CardDescription>
                Migre seus clientes do armazenamento local para o Supabase para garantir que seus dados estejam seguros e acessíveis de qualquer dispositivo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={migrateClients} 
                disabled={migratingClients || clientsMigrated}
                className="w-full"
              >
                {migratingClients ? 'Migrando...' : clientsMigrated ? 'Clientes Migrados' : 'Migrar Clientes'}
              </Button>
            </CardContent>
          </Card>
          
          <Card className="nail-card">
            <CardHeader>
              <CardTitle>Migrar Agendamentos</CardTitle>
              <CardDescription>
                Transfira seus agendamentos para o Supabase para sincronizar em todos os seus dispositivos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={migrateAppointments} 
                disabled={migratingAppointments || appointmentsMigrated}
                className="w-full"
              >
                {migratingAppointments ? 'Migrando...' : appointmentsMigrated ? 'Agendamentos Migrados' : 'Migrar Agendamentos'}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 text-center">
          <p className="mb-4 text-muted-foreground">
            Após migrar seus dados, você pode continuar usando o aplicativo normalmente. Seus dados estarão seguros e sincronizados em todos os dispositivos.
          </p>
          <Button onClick={goToApp} className="nail-button">
            Ir para o Aplicativo
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default DataMigration;
