# ⚡ QUICK START - Deploy Local

## 🚀 Comandos Rápidos

```bash
# 1. Setup inicial
npm run setup

# 2. Instalar dependências
npm install

# 3. Configurar .env (edite com suas credenciais)
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-chave-aqui

# 4. Iniciar servidor
npm run dev
```

## 📋 Checklist Rápido

### **Supabase Setup:**
- [ ] Criar projeto no Supabase.com
- [ ] Copiar URL e chave anônima
- [ ] Configurar .env
- [ ] Executar migrações SQL (9 arquivos)
- [ ] Deploy Edge Function

### **Migrações SQL (executar na ordem):**
1. `schema.sql`
2. `20250703_create_services_table.sql`
3. `20250805_add_business_slug_to_profiles.sql`
4. `20250805_create_customers_table.sql`
5. `20250805_create_professionals_table.sql`
6. `20250805_alter_services_and_appointments.sql`
7. `20250805_update_supabase_types.sql`
8. `20250805_customer_auth_setup.sql`
9. `20250805_customer_portal_settings.sql`

### **Edge Function:**
- Deploy: `supabase/functions/get-available-slots/index.ts`

## 🎯 URLs de Teste

Após configurar:
- **Admin**: `http://localhost:5173/login`
- **Agendamento**: `http://localhost:5173/agendar/seu-slug`
- **Cliente**: `http://localhost:5173/cliente/login`

## 🔧 Configuração Inicial

1. **Login admin** → Criar conta ou usar existente
2. **Configurar portal** → `/settings/customer-portal`
3. **Criar serviços** → `/settings`
4. **Testar URLs** → Usar botões "Ver Portal"

## 🆘 Problemas Comuns

**Erro "Supabase URL not found":**
```bash
# Verificar .env
cat .env
# Reiniciar servidor
npm run dev
```

**Erro "Table does not exist":**
- Executar todas as migrações SQL no Supabase Dashboard

**Erro "Edge Function not found":**
- Deploy a função no Supabase Dashboard > Edge Functions

## 📖 Documentação Completa

Ver: `DEPLOY_LOCAL_SETUP.md` para instruções detalhadas.

---

**🎉 Pronto em 5 minutos!** 🚀