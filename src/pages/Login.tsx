
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is already logged in, redirect to home page
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        if (!name) {
          toast.error('Por favor, informe seu nome');
          setLoading(false);
          return;
        }
        
        const result = await signUp(email, password, name);
        if (!result.error) {
          toast.success('Cadastro realizado com sucesso! Por favor, verifique seu email.');
          setIsSignUp(false);
        }
      } else {
        const result = await signIn(email, password);
        if (!result.error) {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Ocorreu um erro durante a autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nail-light flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Studio Anisy Candine Logo" className="h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-nail-dark">Studio Anisy Candine</h1>
          <p className="text-nail-accent text-sm mt-1">Agendamentos simples, atendimentos incríveis</p>
        </div>
        
        <Card className="nail-card">
          <CardHeader>
            <CardTitle className="text-center gold-text">{isSignUp ? 'Criar Conta' : 'Login'}</CardTitle>
            <CardDescription className="text-center">
              {isSignUp ? 'Preencha os dados para criar sua conta' : 'Entre com seu email e senha'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="nail-input"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="seu@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="nail-input"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="nail-input"
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full nail-button"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </span>
                    Processando...
                  </span>
                ) : isSignUp ? 'Criar Conta' : 'Entrar'}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  className="text-nail-primary hover:underline text-sm"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Já possui uma conta? Entre' : 'Não possui uma conta? Cadastre-se'}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
