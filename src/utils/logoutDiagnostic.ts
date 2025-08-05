import { supabase } from '@/integrations/supabase/client';

export const runLogoutDiagnostic = async () => {
  console.log('🔍 DIAGNÓSTICO DE LOGOUT - INICIANDO...');
  
  // 1. Verificar estado atual da sessão
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('📊 Estado atual da sessão:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      expiresAt: session?.expires_at,
      error: error?.message
    });
  } catch (error) {
    console.error('❌ Erro ao verificar sessão:', error);
  }

  // 2. Verificar localStorage
  const localStorageKeys = [
    'gendar-user-cache',
    'gendar-appointments-cache',
    'gendar-clients-cache',
    'gendar-services-cache',
    'nail-appointments',
    'nail-clients',
    'sb-okmfdwqfxlawpfxtcgnk-auth-token' // Supabase auth token
  ];

  console.log('💾 Estado do localStorage:');
  localStorageKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  ${key}: ${value ? 'EXISTS' : 'NOT_FOUND'}`);
  });

  // 3. Verificar sessionStorage
  console.log('🗂️ Estado do sessionStorage:');
  const sessionKeys = ['csrf-token'];
  sessionKeys.forEach(key => {
    const value = sessionStorage.getItem(key);
    console.log(`  ${key}: ${value ? 'EXISTS' : 'NOT_FOUND'}`);
  });

  // 4. Testar logout manual
  console.log('🧪 Testando logout manual...');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Erro no logout manual:', error);
    } else {
      console.log('✅ Logout manual bem-sucedido');
    }
  } catch (error) {
    console.error('❌ Exceção no logout manual:', error);
  }

  // 5. Verificar estado após logout
  setTimeout(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('📊 Estado após logout:', {
        hasSession: !!session,
        userId: session?.user?.id,
        error: error?.message
      });
    } catch (error) {
      console.error('❌ Erro ao verificar sessão pós-logout:', error);
    }
  }, 1000);

  console.log('🏁 DIAGNÓSTICO DE LOGOUT - CONCLUÍDO');
};

// Função para forçar logout completo
export const forceLogout = async () => {
  console.log('🚨 FORÇANDO LOGOUT COMPLETO...');
  
  // 1. Limpar localStorage
  const keysToRemove = [
    'gendar-user-cache',
    'gendar-appointments-cache',
    'gendar-clients-cache',
    'gendar-services-cache',
    'nail-appointments',
    'nail-clients',
    'sb-okmfdwqfxlawpfxtcgnk-auth-token'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removido: ${key}`);
  });

  // 2. Limpar sessionStorage
  sessionStorage.clear();
  console.log('🗑️ SessionStorage limpo');

  // 3. Forçar logout no Supabase
  try {
    await supabase.auth.signOut();
    console.log('✅ Logout Supabase forçado');
  } catch (error) {
    console.error('❌ Erro no logout Supabase:', error);
  }

  // 4. Limpar cookies (se houver)
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  console.log('🍪 Cookies limpos');

  // 5. Redirecionamento forçado
  setTimeout(() => {
    console.log('🔄 Redirecionando...');
    window.location.href = '/login';
  }, 500);
};

// Auto-executar diagnóstico em desenvolvimento
if (import.meta.env.DEV) {
  // Adicionar função global para debug
  (window as any).logoutDiagnostic = runLogoutDiagnostic;
  (window as any).forceLogout = forceLogout;
  console.log('🔧 Funções de debug disponíveis: logoutDiagnostic(), forceLogout()');
}