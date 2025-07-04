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
        isMobile ? "h-8" : "h-24"
      )}>
        <div className="container mx-auto px-3 sm:px-4 h-full flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 h-full">
            <img 
              alt="Gendar Logo" 
              className={cn(
                "w-auto h-20 sm:h-36 object-contain",
                isMobile ? "h-20" : "h-24"
              )} 
              src="/logo-new-gendar.png" 
            />
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
            &copy; {new Date().getFullYear()} Gendar. Todos os direitos reservados.
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
