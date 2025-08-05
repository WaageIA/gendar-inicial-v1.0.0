import { supabase } from '@/integrations/supabase/client-enhanced';

export const runDiagnostics = async () => {
  console.log('🔍 Executando diagnósticos do sistema...');
  
  // Test connection
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Conexão com Supabase:', error ? '❌ Erro' : '✅ OK');
    if (error) console.error('Erro de conexão:', error);
  } catch (error) {
    console.error('❌ Erro de conexão:', error);
  }

  // Test tables
  const tables = [
    'profiles',
    'services', 
    'clients',
    'appointments',
    'customers',
    'professionals',
    'customer_portal_settings'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Tabela '${table}':`, error.message);
      } else {
        console.log(`✅ Tabela '${table}': OK`);
      }
    } catch (error) {
      console.error(`❌ Tabela '${table}':`, error);
    }
  }

  // Test RLS policies
  try {
    const { data: user } = await supabase.auth.getUser();
    console.log('👤 Usuário autenticado:', user.user ? '✅ Sim' : '❌ Não');
  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
  }

  console.log('🏁 Diagnósticos concluídos');
};

// Auto-run diagnostics in development
if (import.meta.env.DEV) {
  runDiagnostics();
}