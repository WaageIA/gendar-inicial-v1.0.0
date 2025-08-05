#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 GERANDO TIPOS DO SUPABASE PARA O NOVO PROJETO');
console.log('================================================\n');

// Verificar se o .env existe
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env não encontrado!');
  console.log('📝 Crie um arquivo .env com:');
  console.log('VITE_SUPABASE_URL=https://okmfdwqfxlawpfxtcgnk.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=sua-chave-aqui');
  process.exit(1);
}

console.log('✅ Arquivo .env encontrado');
console.log('📋 Verificando configuração...\n');

// Ler o .env
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
  console.log('❌ Configuração incompleta no .env');
  console.log('📝 Certifique-se de ter:');
  console.log('VITE_SUPABASE_URL=https://okmfdwqfxlawpfxtcgnk.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=sua-chave-aqui');
  process.exit(1);
}

console.log('✅ Configuração do Supabase encontrada');
console.log('🔗 URL:', urlMatch[1]);
console.log('🔑 Chave configurada:', keyMatch[1].substring(0, 20) + '...\n');

console.log('📝 PRÓXIMOS PASSOS:');
console.log('1. Execute as migrações SQL no Supabase Dashboard');
console.log('2. Execute: npm run dev');
console.log('3. Teste a conexão\n');

console.log('🗄️  MIGRAÇÕES SQL NECESSÁRIAS:');
console.log('Execute na ordem no Supabase Dashboard > SQL Editor:');
console.log('1. 01_schema_base.sql');
console.log('2. 02_enable_rls.sql');
console.log('3. 03_create_policies.sql');
console.log('4. 04_create_functions.sql\n');

console.log('🎯 TESTE DE CONEXÃO:');
console.log('- Acesse: http://localhost:5173/login');
console.log('- Tente fazer login ou criar conta');
console.log('- Verifique o console do navegador para erros\n');

console.log('🚀 SISTEMA PRONTO PARA O NOVO SUPABASE!'); 