#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando projeto Gendar...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Arquivo .env criado a partir do .env.example');
    console.log('⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais do Supabase\n');
  } else {
    console.log('❌ Arquivo .env.example não encontrado');
  }
} else {
  console.log('✅ Arquivo .env já existe\n');
}

// Check package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('✅ package.json encontrado');
} else {
  console.log('❌ package.json não encontrado');
}

// Instructions
console.log('\n📋 Próximos passos:');
console.log('1. Instale as dependências: npm install');
console.log('2. Configure o .env com suas credenciais do Supabase');
console.log('3. Execute as migrações SQL no Supabase Dashboard');
console.log('4. Deploy a Edge Function get-available-slots');
console.log('5. Inicie o servidor: npm run dev');
console.log('\n📖 Veja o arquivo DEPLOY_LOCAL_SETUP.md para instruções detalhadas');

// Check if migrations exist
const migrationsPath = path.join(__dirname, 'supabase', 'migrations');
if (fs.existsSync(migrationsPath)) {
  const migrations = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql'));
  console.log(`\n📁 Encontradas ${migrations.length} migrações SQL:`);
  migrations.forEach(migration => {
    console.log(`   - ${migration}`);
  });
} else {
  console.log('\n❌ Pasta de migrações não encontrada');
}

console.log('\n🎉 Setup inicial concluído!');
console.log('💡 Execute: npm run dev (após configurar o .env)');