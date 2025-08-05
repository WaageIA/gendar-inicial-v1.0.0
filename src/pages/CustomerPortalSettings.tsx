import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useCustomerPortalSettings, useUpdateCustomerPortalSettings, useCheckBusinessSlug, useCustomerPortalStats } from '@/hooks/useCustomerPortal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { 
  Settings, 
  Users, 
  Calendar, 
  UserPlus,
  Eye,
  Save,
  ExternalLink,
  Palette,
  Bell,
  Shield,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const portalSettingsSchema = z.object({
  business_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  business_slug: z.string()
    .min(3, 'Slug deve ter pelo menos 3 caracteres')
    .max(50, 'Slug deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  enabled: z.boolean(),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato #RRGGBB'),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato #RRGGBB'),
  allow_cancellation: z.boolean(),
  cancellation_hours_limit: z.number().min(1, 'Mínimo 1 hora').max(168, 'Máximo 168 horas (7 dias)'),
  allow_rescheduling: z.boolean(),
  reschedule_hours_limit: z.number().min(1, 'Mínimo 1 hora').max(168, 'Máximo 168 horas (7 dias)'),
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  welcome_message: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  terms_url: z.string().url('URL inválida').optional().or(z.literal('')),
  privacy_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

type PortalSettingsFormData = z.infer<typeof portalSettingsSchema>;

const CustomerPortalSettings: React.FC = () => {
  const { data: settings, isLoading, error, refetch } = useCustomerPortalSettings();
  const { data: stats } = useCustomerPortalStats();
  const updateSettings = useUpdateCustomerPortalSettings();
  const checkSlug = useCheckBusinessSlug();
  
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<PortalSettingsFormData>({
    resolver: zodResolver(portalSettingsSchema),
    defaultValues: {
      business_name: '',
      business_slug: '',
      enabled: true,
      logo_url: '',
      primary_color: '#3b82f6',
      secondary_color: '#1e40af',
      allow_cancellation: true,
      cancellation_hours_limit: 24,
      allow_rescheduling: true,
      reschedule_hours_limit: 24,
      email_notifications: true,
      sms_notifications: false,
      welcome_message: '',
      terms_url: '',
      privacy_url: '',
    },
  });

  const watchedSlug = watch('business_slug');
  const watchedEnabled = watch('enabled');
  const watchedPrimaryColor = watch('primary_color');
  const watchedSecondaryColor = watch('secondary_color');

  // Load settings when data is available
  useEffect(() => {
    if (settings) {
      reset({
        business_name: settings.business_name,
        business_slug: settings.business_slug,
        enabled: settings.enabled,
        logo_url: settings.logo_url || '',
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        allow_cancellation: settings.allow_cancellation,
        cancellation_hours_limit: settings.cancellation_hours_limit,
        allow_rescheduling: settings.allow_rescheduling,
        reschedule_hours_limit: settings.reschedule_hours_limit,
        email_notifications: settings.email_notifications,
        sms_notifications: settings.sms_notifications,
        welcome_message: settings.welcome_message || '',
        terms_url: settings.terms_url || '',
        privacy_url: settings.privacy_url || '',
      });
      setSlugAvailable(true); // Current slug is available for this user
    }
  }, [settings, reset]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!watchedSlug || watchedSlug === settings?.business_slug) {
      setSlugAvailable(settings?.business_slug ? true : null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const available = await checkSlug.mutateAsync(watchedSlug);
        setSlugAvailable(available);
      } catch (error) {
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedSlug, settings?.business_slug, checkSlug]);

  const onSubmit = async (data: PortalSettingsFormData) => {
    try {
      await updateSettings.mutateAsync(data);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const getPortalUrl = () => {
    if (!watchedSlug) return '';
    return `${window.location.origin}/${watchedSlug}/cliente/login`;
  };

  const getSchedulingUrl = () => {
    if (!watchedSlug) return '';
    return `${window.location.origin}/agendar/${watchedSlug}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingState message="Carregando configurações..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorState 
          message="Erro ao carregar configurações"
          onRetry={() => refetch()}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Portal do Cliente
            </h1>
            <p className="text-gray-600 mt-1">
              Configure o portal de autoatendimento para seus clientes
            </p>
          </div>

          {watchedEnabled && watchedSlug && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(getSchedulingUrl(), '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Ver Agendamento
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(getPortalUrl(), '_blank')}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Ver Portal
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">
                    {stats?.totalCustomers || 0}
                  </p>
                  <p className="text-xs text-blue-800">Clientes cadastrados</p>
                </div>

                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-1 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">
                    {stats?.customerAppointments || 0}
                  </p>
                  <p className="text-xs text-green-800">Agendamentos online</p>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <UserPlus className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-600">
                    {stats?.recentCustomers || 0}
                  </p>
                  <p className="text-xs text-purple-800">Novos (30 dias)</p>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    watchedEnabled ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {watchedEnabled ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <p className="font-medium">
                    {watchedEnabled ? 'Portal Ativo' : 'Portal Inativo'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {watchedEnabled ? 'Clientes podem acessar' : 'Portal desabilitado'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Settings */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enable Portal */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enabled">Ativar Portal do Cliente</Label>
                      <p className="text-sm text-gray-500">
                        Permite que clientes acessem o portal de autoatendimento
                      </p>
                    </div>
                    <Switch
                      id="enabled"
                      checked={watchedEnabled}
                      onCheckedChange={(checked) => setValue('enabled', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Business Name */}
                  <div>
                    <Label htmlFor="business_name">Nome do Negócio</Label>
                    <Input
                      id="business_name"
                      {...register('business_name')}
                      placeholder="Meu Salão de Beleza"
                      className={errors.business_name ? 'border-red-500' : ''}
                    />
                    {errors.business_name && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.business_name.message}
                      </p>
                    )}
                  </div>

                  {/* Business Slug */}
                  <div>
                    <Label htmlFor="business_slug">Link do Negócio</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="business_slug"
                        {...register('business_slug')}
                        placeholder="meu-salao"
                        className={`${errors.business_slug ? 'border-red-500' : ''} ${
                          slugAvailable === false ? 'border-red-500' : ''
                        } ${slugAvailable === true ? 'border-green-500' : ''}`}
                      />
                      {checkingSlug && (
                        <Clock className="h-4 w-4 text-gray-400 animate-spin" />
                      )}
                      {!checkingSlug && slugAvailable === true && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {!checkingSlug && slugAvailable === false && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    {errors.business_slug && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.business_slug.message}
                      </p>
                    )}
                    {slugAvailable === false && (
                      <p className="text-sm text-red-500 mt-1">
                        Este link já está em uso
                      </p>
                    )}
                    {watchedSlug && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">URLs geradas:</p>
                        <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-3 w-3" />
                            <span>Agendamento: {getSchedulingUrl()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-3 w-3" />
                            <span>Portal: {getPortalUrl()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logo URL */}
                  <div>
                    <Label htmlFor="logo_url">URL do Logo (opcional)</Label>
                    <Input
                      id="logo_url"
                      {...register('logo_url')}
                      placeholder="https://exemplo.com/logo.png"
                      className={errors.logo_url ? 'border-red-500' : ''}
                    />
                    {errors.logo_url && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.logo_url.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Appearance Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Aparência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary Color */}
                    <div>
                      <Label htmlFor="primary_color">Cor Primária</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primary_color"
                          type="color"
                          {...register('primary_color')}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={watchedPrimaryColor}
                          onChange={(e) => setValue('primary_color', e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                      {errors.primary_color && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.primary_color.message}
                        </p>
                      )}
                    </div>

                    {/* Secondary Color */}
                    <div>
                      <Label htmlFor="secondary_color">Cor Secundária</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          {...register('secondary_color')}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={watchedSecondaryColor}
                          onChange={(e) => setValue('secondary_color', e.target.value)}
                          placeholder="#1e40af"
                          className="flex-1"
                        />
                      </div>
                      {errors.secondary_color && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.secondary_color.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Welcome Message */}
                  <div>
                    <Label htmlFor="welcome_message">Mensagem de Boas-vindas (opcional)</Label>
                    <Textarea
                      id="welcome_message"
                      {...register('welcome_message')}
                      placeholder="Bem-vindo ao nosso portal! Aqui você pode gerenciar seus agendamentos..."
                      rows={3}
                      className={errors.welcome_message ? 'border-red-500' : ''}
                    />
                    {errors.welcome_message && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.welcome_message.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Policies Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Políticas de Agendamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cancellation */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allow_cancellation">Permitir Cancelamento</Label>
                        <p className="text-sm text-gray-500">
                          Clientes podem cancelar seus próprios agendamentos
                        </p>
                      </div>
                      <Switch
                        id="allow_cancellation"
                        {...register('allow_cancellation')}
                        onCheckedChange={(checked) => setValue('allow_cancellation', checked)}
                      />
                    </div>

                    {watch('allow_cancellation') && (
                      <div>
                        <Label htmlFor="cancellation_hours_limit">Limite para Cancelamento (horas)</Label>
                        <Input
                          id="cancellation_hours_limit"
                          type="number"
                          min="1"
                          max="168"
                          {...register('cancellation_hours_limit', { valueAsNumber: true })}
                          className={errors.cancellation_hours_limit ? 'border-red-500' : ''}
                        />
                        {errors.cancellation_hours_limit && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.cancellation_hours_limit.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Clientes podem cancelar até {watch('cancellation_hours_limit')} horas antes
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Rescheduling */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allow_rescheduling">Permitir Reagendamento</Label>
                        <p className="text-sm text-gray-500">
                          Clientes podem reagendar seus compromissos
                        </p>
                      </div>
                      <Switch
                        id="allow_rescheduling"
                        {...register('allow_rescheduling')}
                        onCheckedChange={(checked) => setValue('allow_rescheduling', checked)}
                      />
                    </div>

                    {watch('allow_rescheduling') && (
                      <div>
                        <Label htmlFor="reschedule_hours_limit">Limite para Reagendamento (horas)</Label>
                        <Input
                          id="reschedule_hours_limit"
                          type="number"
                          min="1"
                          max="168"
                          {...register('reschedule_hours_limit', { valueAsNumber: true })}
                          className={errors.reschedule_hours_limit ? 'border-red-500' : ''}
                        />
                        {errors.reschedule_hours_limit && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.reschedule_hours_limit.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Clientes podem reagendar até {watch('reschedule_hours_limit')} horas antes
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notifications Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email_notifications">Notificações por Email</Label>
                      <p className="text-sm text-gray-500">
                        Enviar confirmações e lembretes por email
                      </p>
                    </div>
                    <Switch
                      id="email_notifications"
                      {...register('email_notifications')}
                      onCheckedChange={(checked) => setValue('email_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms_notifications">Notificações por SMS</Label>
                      <p className="text-sm text-gray-500">
                        Enviar lembretes por SMS (requer configuração adicional)
                      </p>
                    </div>
                    <Switch
                      id="sms_notifications"
                      {...register('sms_notifications')}
                      onCheckedChange={(checked) => setValue('sms_notifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Legal Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Links Legais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="terms_url">URL dos Termos de Uso (opcional)</Label>
                    <Input
                      id="terms_url"
                      {...register('terms_url')}
                      placeholder="https://exemplo.com/termos"
                      className={errors.terms_url ? 'border-red-500' : ''}
                    />
                    {errors.terms_url && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.terms_url.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="privacy_url">URL da Política de Privacidade (opcional)</Label>
                    <Input
                      id="privacy_url"
                      {...register('privacy_url')}
                      placeholder="https://exemplo.com/privacidade"
                      className={errors.privacy_url ? 'border-red-500' : ''}
                    />
                    {errors.privacy_url && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.privacy_url.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateSettings.isPending || slugAvailable === false}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateSettings.isPending ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerPortalSettings;