
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share, Copy, Link, QrCode, Instagram } from 'lucide-react';
import QRCodeGenerator from './QRCodeGenerator';
import { toast } from '@/components/ui/use-toast';

interface ShareOptionsProps {
  shareUrl: string;
  studioName: string;
}

const ShareOptions: React.FC<ShareOptionsProps> = ({ shareUrl, studioName }) => {
  const [showQRCode, setShowQRCode] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência.",
    });
  };
  
  const shareOnWhatsApp = () => {
    const text = `Olá! Conheça os serviços de unhas em gel Molde F1 do ${studioName}. Faça seu agendamento: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  
  const shareOnInstagram = () => {
    toast({
      title: "Link copiado para o Instagram!",
      description: "Cole o link em sua bio ou stories do Instagram.",
    });
    copyToClipboard();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Share className="h-5 w-5 mr-2" />
          Compartilhe o Cartão Digital
        </h3>
        
        <div className="flex mb-4">
          <Input 
            value={shareUrl} 
            readOnly 
            className="flex-grow mr-2" 
          />
          <Button onClick={copyToClipboard} variant="outline" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-3 h-auto" 
            onClick={copyToClipboard}
          >
            <Link className="h-6 w-6 mb-1" />
            <span className="text-xs">Copiar Link</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-3 h-auto" 
            onClick={shareOnInstagram}
          >
            <Instagram className="h-6 w-6 mb-1" />
            <span className="text-xs">Instagram</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-3 h-auto" 
            onClick={() => setShowQRCode(!showQRCode)}
          >
            <QrCode className="h-6 w-6 mb-1" />
            <span className="text-xs">Código QR</span>
          </Button>
        </div>
        
        {showQRCode && (
          <div className="mt-4 flex flex-col items-center">
            <QRCodeGenerator value={shareUrl} />
            <p className="text-sm text-muted-foreground mt-2">
              Escaneie este código QR para acessar o cartão digital
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShareOptions;
