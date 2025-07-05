import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { digitalBusinessCardService } from '@/services/digitalBusinessCardService'; // Novo serviço
import { DigitalBusinessCard } from '@/types'; // Novo tipo
import { PlusCircle, Trash2, Share2, QrCode, Link, Copy, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils'; // Para classes condicionais

// Componente para adicionar/editar serviços (exemplo)
const ServiceItem: React.FC<{
  service: { name: string; description: string };
  onUpdate: (name: string, description: string) => void;
  onRemove: () => void;
}> = ({ service, onUpdate, onRemove }) => (
  <div className="flex items-center gap-2 p-2 border rounded-md bg-nail-light">
    <Input
      placeholder="Nome do Serviço"
      value={service.name}
      onChange={(e) => onUpdate(e.target.value, service.description)}
      className="flex-1"
    />
    <Input
      placeholder="Descrição (opcional)"
      value={service.description}
      onChange={(e) => onUpdate(service.name, e.target.value)}
      className="flex-1"
    />
    <Button variant="ghost" size="icon" onClick={onRemove}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </div>
);

// Componente para adicionar/editar redes sociais (exemplo)
const SocialMediaItem: React.FC<{
  social: { platform: string; url: string };
  onUpdate: (platform: string, url: string) => void;
  onRemove: () => void;
}> = ({ social, onUpdate, onRemove }) => (
  <div className="flex items-center gap-2 p-2 border rounded-md bg-nail-light">
    <Input
      placeholder="Plataforma (ex: Instagram)"
      value={social.platform}
      onChange={(e) => onUpdate(e.target.value, social.url)}
      className="flex-1"
    />
    <Input
      placeholder="URL (ex: https://instagram.com/seuuser)"
      value={social.url}
      onChange={(e) => onUpdate(social.platform, e.target.value)}
      className="flex-1"
    />
    <Button variant="ghost" size="icon" onClick={onRemove}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </div>
);


const DigitalBusinessCardSettings: React.FC = () => {
  const [cardSettings, setCardSettings] = useState<DigitalBusinessCard>({
    id: 'default', // Assumindo um único cartão por usuário
    logoUrl: '',
    businessName: '',
    tagline: '',
    primaryColor: '#397e96', // Cor padrão (azul médio)
    secondaryColor: '#f9fbfc', // Cor padrão (branco gelo)
    contact: {
      phone: '',
      email: '',
      website: '',
    },
    socialMedia: [],
    services: [],
    qrCodeUrl: '',
    cardUrl: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const { data, error } = await digitalBusinessCardService.getCardSettings();
      if (data) {
        setCardSettings(data);
      } else if (error && error.code !== 'PGRST116') { // Ignorar "no rows found"
        toast.error('Erro ao carregar configurações do Cartão Digital.');
        console.error(error);
      }
      setLoading(false);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    // Gerar QR Code e URL do cartão antes de salvar
    const generatedCardUrl = await digitalBusinessCardService.generateCardUrl(cardSettings.id);
    const generatedQrCodeUrl = await digitalBusinessCardService.generateQrCode(generatedCardUrl);

    const settingsToSave = {
      ...cardSettings,
      cardUrl: generatedCardUrl,
      qrCodeUrl: generatedQrCodeUrl,
    };

    const { error } = await digitalBusinessCardService.saveCardSettings(settingsToSave);
    if (!error) {
      setCardSettings(settingsToSave); // Atualiza o estado com os URLs gerados
      toast.success('Configurações do Cartão Digital salvas com sucesso!');
    } else {
      toast.error('Erro ao salvar configurações do Cartão Digital.');
      console.error(error);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setCardSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCardSettings(prev => ({
      ...prev,
      contact: { ...prev.contact, [id]: value }
    }));
  };

  const handleAddService = () => {
    setCardSettings(prev => ({
      ...prev,
      services: [...prev.services, { name: '', description: '' }]
    }));
  };

  const handleUpdateService = (index: number, name: string, description: string) => {
    setCardSettings(prev => {
      const newServices = [...prev.services];
      newServices[index] = { name, description };
      return { ...prev, services: newServices };
    });
  };

  const handleRemoveService = (index: number) => {
    setCardSettings(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleAddSocialMedia = () => {
    setCardSettings(prev => ({
      ...prev,
      socialMedia: [...prev.socialMedia, { platform: '', url: '' }]
    }));
  };

  const handleUpdateSocialMedia = (index: number, platform: string, url: string) => {
    setCardSettings(prev => {
      const newSocialMedia = [...prev.socialMedia];
      newSocialMedia[index] = { platform, url };
      return { ...prev, socialMedia: newSocialMedia };
    });
  };

  const handleRemoveSocialMedia = (index: number) => {
    setCardSettings(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index)
    }));
  };

  const handleCopyLink = () => {
    if (cardSettings.cardUrl) {
      navigator.clipboard.writeText(cardSettings.cardUrl);
      toast.success('Link do cartão copiado!');
    } else {
      toast.error('Salve as configurações para gerar o link.');
    }
  };

  const handleShareWhatsApp = () => {
    if (cardSettings.cardUrl && cardSettings.contact.phone) {
      const message = `Olá! Confira meu cartão digital: ${cardSettings.cardUrl}`;
      const whatsappUrl = `https://wa.me/${cardSettings.contact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      toast.error('Preencha o telefone e salve as configurações para compartilhar no WhatsApp.');
    }
  };


  if (loading) {
    return <Layout><p>Carregando configurações do Cartão Digital...</p></Layout>; // Usar LoadingState
  }

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-nail-primary">Configurar Cartão Digital</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna de Configurações */}
          <div className="space-y-6">
            <Card className="nail-card">
              <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Nome do Negócio</Label>
                  <Input id="businessName" value={cardSettings.businessName} onChange={handleChange} placeholder="Seu Nome / Nome do Salão" />
                </div>
                <div>
                  <Label htmlFor="tagline">Slogan/Subtítulo</Label>
                  <Input id="tagline" value={cardSettings.tagline} onChange={handleChange} placeholder="Ex: Especialista em unhas de gel" />
                </div>
                <div>
                  <Label htmlFor="logoUrl">URL da Logo</Label>
                  <Input id="logoUrl" value={cardSettings.logoUrl} onChange={handleChange} placeholder="Cole a URL da sua logo aqui" />
                  <p className="text-xs text-muted-foreground mt-1">Para upload de imagem, use um serviço externo e cole a URL.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="nail-card">
              <CardHeader><CardTitle>Cores e Estilo</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primaryColor">Cor Principal (Texto/Ícones)</Label>
                  <Input type="color" id="primaryColor" value={cardSettings.primaryColor} onChange={handleChange} className="w-full h-10" />
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Cor de Fundo do Cartão</Label>
                  <Input type="color" id="secondaryColor" value={cardSettings.secondaryColor} onChange={handleChange} className="w-full h-10" />
                </div>
              </CardContent>
            </Card>

            <Card className="nail-card">
              <CardHeader><CardTitle>Serviços Oferecidos</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {cardSettings.services.map((service, index) => (
                  <ServiceItem
                    key={index}
                    service={service}
                    onUpdate={(name, description) => handleUpdateService(index, name, description)}
                    onRemove={() => handleRemoveService(index)}
                  />
                ))}
                <Button variant="outline" onClick={handleAddService} className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Serviço
                </Button>
              </CardContent>
            </Card>

            <Card className="nail-card">
              <CardHeader><CardTitle>Informações de Contato</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                  <Input id="phone" value={cardSettings.contact.phone} onChange={handleContactChange} placeholder="(XX) XXXXX-XXXX" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={cardSettings.contact.email} onChange={handleContactChange} placeholder="seu@email.com" />
                </div>
                <div>
                  <Label htmlFor="website">Website/Linktree</Label>
                  <Input id="website" value={cardSettings.contact.website} onChange={handleContactChange} placeholder="https://seusite.com" />
                </div>
              </CardContent>
            </Card>

            <Card className="nail-card">
              <CardHeader><CardTitle>Redes Sociais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {cardSettings.socialMedia.map((social, index) => (
                  <SocialMediaItem
                    key={index}
                    social={social}
                    onUpdate={(platform, url) => handleUpdateSocialMedia(index, platform, url)}
                    onRemove={() => handleRemoveSocialMedia(index)}
                  />
                ))}
                <Button variant="outline" onClick={handleAddSocialMedia} className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Rede Social
                </Button>
              </CardContent>
            </Card>

            <Button onClick={handleSave} className="w-full nail-button" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Configurações do Cartão'}
            </Button>
          </div>

          {/* Coluna de Pré-visualização e Compartilhamento */}
          <div className="space-y-6">
            <Card className="nail-card">
              <CardHeader><CardTitle>Pré-visualização do Cartão Digital</CardTitle></CardHeader>
              <CardContent className="flex justify-center items-center p-6">
                <div
                  className="w-full max-w-sm p-6 rounded-lg shadow-lg text-center border border-gray-200"
                  style={{ backgroundColor: cardSettings.secondaryColor, color: cardSettings.primaryColor }}
                >
                  {cardSettings.logoUrl && (
                    <img src={cardSettings.logoUrl} alt="Logo" className="h-20 mx-auto mb-4 rounded-full object-cover" />
                  )}
                  <h2 className="text-2xl font-bold" style={{ color: cardSettings.primaryColor }}>
                    {cardSettings.businessName || 'Nome do Negócio'}
                  </h2>
                  <p className="text-sm mb-4" style={{ color: cardSettings.primaryColor }}>
                    {cardSettings.tagline || 'Seu Slogan Aqui'}
                  </p>

                  {cardSettings.services.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: cardSettings.primaryColor }}>Serviços</h3>
                      <ul className="list-disc list-inside text-left mx-auto" style={{ maxWidth: 'fit-content' }}>
                        {cardSettings.services.map((service, index) => (
                          <li key={index} className="text-sm" style={{ color: cardSettings.primaryColor }}>
                            {service.name} {service.description && `(${service.description})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    {cardSettings.contact.phone && (
                      <p className="text-sm" style={{ color: cardSettings.primaryColor }}>
                        Telefone: {cardSettings.contact.phone}
                      </p>
                    )}
                    {cardSettings.contact.email && (
                      <p className="text-sm" style={{ color: cardSettings.primaryColor }}>
                        Email: {cardSettings.contact.email}
                      </p>
                    )}
                    {cardSettings.contact.website && (
                      <p className="text-sm" style={{ color: cardSettings.primaryColor }}>
                        Website: <a href={cardSettings.contact.website} target="_blank" rel="noopener noreferrer" style={{ color: cardSettings.primaryColor, textDecoration: 'underline' }}>{cardSettings.contact.website}</a>
                      </p>
                    )}
                  </div>

                  {cardSettings.socialMedia.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: cardSettings.primaryColor }}>Redes Sociais</h3>
                      <div className="flex justify-center gap-3">
                        {cardSettings.socialMedia.map((social, index) => (
                          <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" style={{ color: cardSettings.primaryColor }}>
                            {/* Ícones reais seriam usados aqui, ex: <Instagram /> */}
                            {social.platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {cardSettings.qrCodeUrl && (
                    <div className="mt-6">
                      <img src={cardSettings.qrCodeUrl} alt="QR Code" className="w-32 h-32 mx-auto border p-1 rounded-md" />
                      <p className="text-xs mt-2" style={{ color: cardSettings.primaryColor }}>Escaneie para acessar</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="nail-card">
              <CardHeader><CardTitle>Compartilhar Cartão</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleCopyLink} className="w-full nail-secondary-button" disabled={!cardSettings.cardUrl}>
                  <Copy className="h-4 w-4 mr-2" /> Copiar Link do Cartão
                </Button>
                <Button onClick={handleShareWhatsApp} className="w-full nail-secondary-button" disabled={!cardSettings.cardUrl || !cardSettings.contact.phone}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Compartilhar no WhatsApp
                </Button>
                {cardSettings.qrCodeUrl && (
                  <a href={cardSettings.qrCodeUrl} download="qrcode-cartao-digital.png" className="w-full">
                    <Button className="w-full nail-secondary-button">
                      <QrCode className="h-4 w-4 mr-2" /> Baixar QR Code
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DigitalBusinessCardSettings;
