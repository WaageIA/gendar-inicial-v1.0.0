
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  Settings, 
  Share 
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Agendamentos', href: '/appointments', icon: Calendar },
  { name: 'Financeiro', href: '/financial', icon: DollarSign },
  
  { name: 'Marketing', href: '/marketing', icon: Share },
];

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const getCurrentPath = () => {
    return location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-nail-secondary z-50 shadow-2xl">
      <nav className="flex justify-around items-center py-2 px-2 safe-area-inset-bottom">
        {navigation.map((item) => {
          const isActive = getCurrentPath() === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-[60px] min-h-[60px] relative overflow-hidden group',
                isActive
                  ? 'text-nail-primary bg-nail-light shadow-sm scale-105'
                  : 'text-gray-500 hover:text-nail-primary hover:bg-nail-light/70 active:scale-95'
              )}
              style={{ touchAction: 'manipulation' }}
            >
              {/* Indicador ativo */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-nail-primary rounded-full" />
              )}
              
              <Icon className={cn(
                "h-5 w-5 mb-1 transition-all duration-200",
                isActive ? "scale-110" : "group-hover:scale-105"
              )} />
              <span className={cn(
                "text-xs font-medium leading-tight text-center transition-all duration-200",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.name}
              </span>
              
              {/* Efeito de ripple */}
              <div className="absolute inset-0 rounded-xl bg-nail-primary opacity-0 group-active:opacity-10 transition-opacity duration-150" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNavigation;
