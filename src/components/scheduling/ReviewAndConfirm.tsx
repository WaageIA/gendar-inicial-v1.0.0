import React, { useState } from 'react';
import { useScheduling } from '@/contexts/SchedulingContext';
import { customerService } from '@/services/customerService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingState } from '@/components/common/LoadingState';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const customerSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').optional().or(z.literal('')),
  notes: z.string().optional(),
  terms: z.boolean().refine(val => val === true, 'Você deve aceitar os termos'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export const ReviewAndConfirm: React.FC = () => {
  const {
    businessSlug,
    selectedService,
    selectedProfessional,
    selectedDate,
    selectedTime,
    resetScheduling,
  } = useScheduling();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const termsAccepted = watch('terms');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const onSubmit = async (data: CustomerFormData) => {
    if (!selectedService || !selectedDate || !selectedTime || !businessSlug) {
      toast.error('Dados do agendamento incompletos');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create appointment date
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      // Prepare customer data
      const customerData = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || undefined,
      };

      // Prepare appointment data
      const appointmentData = {
        client_name: data.full_name,
        date: appointmentDate,
        service: selectedService.name,
        duration: selectedService.duration,
        price: selectedService.price,
        notes: data.notes || undefined,
        professional_id: selectedProfessional?.id,
      };

      // Create appointment
      const { data: result, error } = await customerService.createPublicAppointment(
        businessSlug,
        appointmentData,
        customerData
      );

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast.success('Agendamento realizado com sucesso!');

    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error(error.message || 'Erro ao realizar agendamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewAppointment = () => {
    setIsSuccess(false);
    resetScheduling();
  };

  if (!selectedService || !selectedDate || !selectedTime) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Dados incompletos
        </h3>
        <p className="text-gray-600">
          Volte e complete todas as etapas do agendamento.
        </p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-8 space-y-6">
        <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Agendamento Confirmado!
          </h2>
          <p className="text-gray-600">
            Seu agendamento foi realizado com sucesso.
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Serviço:</span>
                <span className="font-medium">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">
                  {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horário:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className="font-medium">{formatPrice(selectedService.price)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Você receberá uma confirmação por email em breve.
          </p>
          
          <Button onClick={handleNewAppointment} variant="outline">
            Fazer novo agendamento
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Confirme seu agendamento
        </h2>
        <p className="text-gray-600">
          Revise os dados e preencha suas informações
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{selectedService.name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedService.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedService.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatPrice(selectedService.price)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Professional */}
            {selectedProfessional ? (
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedProfessional.avatar_url} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedProfessional.name}</h3>
                  <p className="text-sm text-gray-600">Profissional selecionado</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium">Qualquer profissional</h3>
                  <p className="text-sm text-gray-600">Profissional disponível</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Date and Time */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">
                  {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{selectedTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Form */}
        <Card>
          <CardHeader>
            <CardTitle>Seus Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="full_name">Nome completo *</Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  placeholder="Seu nome completo"
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="seu@email.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
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

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Alguma observação especial?"
                  rows={3}
                />
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setValue('terms', !!checked)}
                />
                <Label htmlFor="terms" className="text-sm leading-5">
                  Aceito os termos de uso e política de privacidade *
                </Label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-500">
                  {errors.terms.message}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingState size="sm" />
                    Confirmando...
                  </>
                ) : (
                  'Confirmar Agendamento'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};