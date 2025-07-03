import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Users, LayoutDashboard, Share, LogOut, DollarSign, Settings } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import MobileNavigation from './MobileNavigation';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const { signOut, user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Agendamentos', href: '/appointments', icon: Calendar },
    { name: 'Financeiro', href: '/financial', icon: DollarSign },
    
    { name: 'Marketing', href: '/marketing', icon: Share },
  ];

  const getCurrentPath = () => {
    return location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`;
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-nail-light">
      {/* Header otimizado para mobile */}
      <header className={cn(
        "bg-white border-b-2 border-nail-secondary sticky top-0 z-40 shadow-sm",
        isMobile ? "h-12" : "h-16"
      )}>
        <div className="container mx-auto px-3 sm:px-4 h-full flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <img 
              alt="Studio Anisy Candine Logo" 
              className={cn(
                "w-auto object-contain",
                isMobile ? "h-8" : "h-12"
              )} 
              src="/lovable-uploads/a50724cd-7f7b-44c3-be46-77a700b2405f.png" 
            />
            <div className="flex flex-col min-w-0">
              <span className={cn(
                "font-bold gold-text truncate",
                isMobile ? "text-sm" : "text-xl"
              )}>
                {isMobile ? "Studio A.C." : "Studio Anisy Candine"}
              </span>
              {!isMobile && (
                <span className="text-xs text-nail-accent">Especialista em Molde F1</span>
              )}
            </div>
          </Link>
          
          {user && (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {!isMobile && (
                <span className="text-sm text-gray-600 truncate max-w-[120px]">
                  {user.email}
                </span>
              )}
              <Link to="/settings" className={cn("flex-shrink-0", isMobile ? "p-2 h-8 w-8" : "px-3 py-2")}>
                <Button variant="ghost" size={isMobile ? "sm" : "sm"} className="text-gray-600 hover:text-nail-primary">
                  <Settings className={cn(isMobile ? "h-4 w-4" : "h-4 w-4")} />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size={isMobile ? "sm" : "sm"}
                onClick={handleLogout} 
                className={cn(
                  "text-gray-600 hover:text-red-600 flex-shrink-0",
                  isMobile ? "p-2 h-8 w-8" : "px-3 py-2"
                )}
              >
                <LogOut className={cn(isMobile ? "h-4 w-4" : "h-4 w-4 mr-1")} />
                {!isMobile && <span>Sair</span>}
              </Button>
            </div>
          )}
        </div>
      </header>
      
      {/* Navegação Desktop */}
      {!isMobile && (
        <div className="bg-white border-b border-nail-secondary sticky top-16 z-30">
          <nav className="container mx-auto px-4 py-2">
            <Tabs value={getCurrentPath()} className="w-full">
              <TabsList className="w-full grid grid-cols-6 bg-nail-light h-auto p-1">
                {navigation.map(item => (
                  <TabsTrigger 
                    key={item.name} 
                    value={item.href} 
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:text-nail-primary data-[state=active]:border-b-2 data-[state=active]:border-nail-primary py-3 px-2 transition-all duration-300" 
                    asChild
                  >
                    <Link to={item.href} className="flex flex-col items-center justify-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{item.name}</span>
                    </Link>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </nav>
        </div>
      )}
      
      {/* Main content com padding otimizado para mobile */}
      <main className={cn(
        "container mx-auto mobile-spacing",
        isMobile ? "px-3 py-4 pb-24" : "px-4 py-6"
      )}>
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
      
      {/* Navegação Mobile */}
      <MobileNavigation />
      
      {/* Footer otimizado */}
      {!isMobile && (
        <footer className="bg-white border-t border-nail-secondary py-4 sm:py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <div className="flex justify-center items-center mb-2 sm:mb-3">
              <img 
                alt="Studio Anisy Candine Logo" 
                className="h-6 sm:h-8 w-auto mr-2 sm:mr-3" 
                src="/lovable-uploads/e0fd7b6c-c6ff-4fbf-9255-ec8ae8967ec7.png" 
              />
              <div className="text-left">
                <div className="font-semibold text-nail-dark text-sm">Studio Anisy Candine</div>
                <div className="text-xs text-nail-accent">Agendamentos simples, atendimentos incríveis</div>
              </div>
            </div>
            &copy; {new Date().getFullYear()} Gendar. Todos os direitos reservados.
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
