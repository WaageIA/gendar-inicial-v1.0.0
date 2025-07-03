
import React, { useEffect, useRef } from 'react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value, 
  size = 200 
}) => {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const loadQRCode = async () => {
      try {
        const QRCodeStyling = (await import('qr-code-styling')).default;
        
        if (qrContainerRef.current) {
          // Limpa o container antes de renderizar um novo QR code
          qrContainerRef.current.innerHTML = '';
          
          const qrCode = new QRCodeStyling({
            width: size,
            height: size,
            type: "svg",
            data: value,
            dotsOptions: {
              color: "#D84C7B", // Cor nail-dark
              type: "rounded"
            },
            cornersSquareOptions: {
              color: "#FF80AB", // Cor nail-primary
              type: "extra-rounded"
            },
            cornersDotOptions: {
              color: "#FF80AB", // Cor nail-primary
            },
            backgroundOptions: {
              color: "#FFFFFF",
            },
            imageOptions: {
              crossOrigin: "anonymous",
            }
          });
          
          qrCode.append(qrContainerRef.current);
        }
      } catch (error) {
        console.error("Erro ao carregar o QR code:", error);
      }
    };
    
    loadQRCode();
  }, [value, size]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-nail-secondary">
      <div ref={qrContainerRef} className="flex justify-center"></div>
    </div>
  );
};

export default QRCodeGenerator;
