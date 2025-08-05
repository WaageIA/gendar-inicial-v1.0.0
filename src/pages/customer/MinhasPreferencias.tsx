import React, { useState } from 'react';
import { CustomerLayout } from '@/components/customer/CustomerLayout';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useCustomerAppointments, useUpdateCustomerProfile } from '@/hooks/useCustomerAppointments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { 
  User, 
  Mail, 
  Phone, 
  Star, 
  TrendingUp,
  Calendar,
  Save,
  Edit
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const MinhasPreferencias: React.FC = () => {
  const { customer } = useCustomerAuth();
  const { data: appointments = [] } = useCustomerAppointments();
  const updateProfile = useUpdateCustomerProfile();
  
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: customer?.full_name || '',
      phone: customer?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelEdit = () => {
    reset({
      full_name: customer?.full_name || '',
      phone: customer?.phone || '',
    });
    setIsEditing(false);
  };

  // Calculate statistics
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const totalSpent = completedAppointments.reduce((sum, apt) => sum + apt.price, 0);
  
  // Get most used services
  const serviceCount = completedAppointments.reduce((acc, apt) => {
    acc[apt.service] = (acc[apt.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostUsedServices = Object.entries(serviceCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (!customer) {
    return (
      <CustomerLayout>
        <LoadingState message="Carregando dados..." />
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Minhas Preferências
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie seu perfil e veja suas estatísticas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <div>
                      <Label htmlFor="full_name">Nome completo</Label>
                      <Input
                        id="full_name"
                        {...register('full_name')}
                        className={errors.full_name ? 'border-red-500' : ''}
                      />
                      {errors.full_name && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.full_name.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="(11) 99999-9999"
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Email (read-only) */}
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={customer.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        O email não pode ser alterado
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={updateProfile.isPending}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {updateProfile.isPending ? 'Salvando...' : 'Salvar'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{customer.full_name}</p>
                        <p className="text-sm text-gray-500">Nome completo</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{customer.email}</p>
                        <p className="text-sm text-gray-500">Email</p>
                      </div>
                    </div>

                    {customer.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{customer.phone}</p>
                          <p className="text-sm text-gray-500">Telefone</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-500">Cliente desde</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Most Used Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Serviços Mais Utilizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mostUsedServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum serviço utilizado ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mostUsedServices.map(([service, count], index) => (
                      <div key={service} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium">{service}</span>
                        </div>
                        <Badge variant="secondary">
                          {count} {count === 1 ? 'vez' : 'vezes'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Suas Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {completedAppointments.length}
                  </p>
                  <p className="text-sm text-blue-800">
                    Agendamentos concluídos
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(totalSpent)}
                  </p>
                  <p className="text-sm text-green-800">
                    Total investido
                  </p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {appointments.length}
                  </p>
                  <p className="text-sm text-purple-800">
                    Total de agendamentos
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="h-4 w-4 mr-2" />
                  Avaliar Serviços
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default MinhasPreferencias;