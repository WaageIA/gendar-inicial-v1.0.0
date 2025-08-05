import React, { useState } from 'react';
import { CustomerLayout } from '@/components/customer/CustomerLayout';
import { useCustomerAppointments, useCancelAppointment } from '@/hooks/useCustomerAppointments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  MapPin,
  X,
  RotateCcw,
  Plus,
  CalendarDays
} from 'lucide-react';
import { format, isFuture, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MeusAgendamentos: React.FC = () => {
  const { data: appointments = [], isLoading, error, refetch } = useCustomerAppointments();
  const cancelAppointment = useCancelAppointment();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelAppointment = async (appointmentId: string) => {
    setCancellingId(appointmentId);
    try {
      await cancelAppointment.mutateAsync(appointmentId);
    } finally {
      setCancellingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getStatusBadge = (status: string, date: Date) => {
    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelado</Badge>;
    }
    if (status === 'completed') {
      return <Badge variant="default" className="bg-green-500">Concluído</Badge>;
    }
    if (isPast(date)) {
      return <Badge variant="secondary">Expirado</Badge>;
    }
    return <Badge variant="outline">Agendado</Badge>;
  };

  // Separate appointments
  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' && isFuture(apt.date)
  );
  
  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' || apt.status === 'cancelled' || 
    (apt.status === 'scheduled' && isPast(apt.date))
  );

  const AppointmentCard = ({ appointment, showActions = false }: { appointment: any, showActions?: boolean }) => (
    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3 flex-1">
            {/* Service and Status */}
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg text-gray-900">
                {appointment.service}
              </h3>
              {getStatusBadge(appointment.status, appointment.date)}
            </div>

            {/* Date and Time */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(appointment.date, "dd 'de' MMMM", { locale: ptBR })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(appointment.date, 'HH:mm')}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {formatPrice(appointment.price)}
              </div>
            </div>

            {/* Professional */}
            {appointment.professional_name && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <User className="h-4 w-4" />
                {appointment.professional_name}
              </div>
            )}

            {/* Location */}
            {appointment.location && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {appointment.location}
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {appointment.notes}
              </p>
            )}
          </div>

          {/* Actions */}
          {showActions && appointment.status === 'scheduled' && isFuture(appointment.date) && (
            <div className="flex flex-col gap-2 md:w-auto w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  // TODO: Implement reschedule functionality
                  console.log('Reschedule appointment:', appointment.id);
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Reagendar
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={cancellingId === appointment.id}
                  >
                    <X className="h-4 w-4" />
                    {cancellingId === appointment.id ? 'Cancelando...' : 'Cancelar'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Não, manter</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sim, cancelar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* History Actions */}
          {!showActions && appointment.status === 'completed' && (
            <div className="md:w-auto w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 w-full md:w-auto"
                onClick={() => {
                  // TODO: Implement book again functionality
                  console.log('Book again:', appointment.service);
                }}
              >
                <Plus className="h-4 w-4" />
                Agendar Novamente
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <CustomerLayout>
        <LoadingState message="Carregando seus agendamentos..." />
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <ErrorState 
          message="Erro ao carregar agendamentos"
          onRetry={() => refetch()}
        />
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Meus Agendamentos
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus agendamentos e histórico
            </p>
          </div>
          
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Próximos ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Histórico ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Appointments */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum agendamento próximo
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Você não tem agendamentos futuros no momento.
                    </p>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Fazer novo agendamento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map(appointment => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Past Appointments */}
          <TabsContent value="history" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum histórico
                    </h3>
                    <p className="text-gray-600">
                      Você ainda não tem agendamentos no histórico.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastAppointments
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(appointment => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment} 
                      showActions={false}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
};

export default MeusAgendamentos;