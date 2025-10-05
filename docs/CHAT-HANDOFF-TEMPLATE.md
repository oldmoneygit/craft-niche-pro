# 🔄 TEMPLATE DE CONTINUAÇÃO DE CHAT - KORLAB PAI

**Use este template quando iniciar um novo chat para dar contexto completo ao Claude**

---

## 📍 COPY & PASTE ESTE BLOCO NO NOVO CHAT:

```markdown
# CONTINUAÇÃO DO PROJETO - KORLAB PAI

## 📋 CONTEXTO DO PROJETO

**Projeto:** KorLab PAI - Plataforma Multi-vertical de Gestão  
**Vertical Atual:** Nutrição (NutriPro)  
**Repositório:** https://github.com/oldmoneygit/craft-niche-pro.git  
**Status:** [EM DESENVOLVIMENTO / IMPLEMENTAÇÃO / TESTES / PRODUÇÃO]

---

## 🔗 CHAT ANTERIOR

**Link:** [Cole aqui o link do chat anterior]  
**Data:** [Data do último chat]  
**Última tarefa concluída:** [Descreva brevemente o que foi feito]

---

## 📚 DOCUMENTOS OBRIGATÓRIOS

**IMPORTANTE:** Antes de fazer QUALQUER implementação, você DEVE ler e seguir rigorosamente:

1. **SCHEMA.md** (`/docs/SCHEMA.md`)
   - Estrutura completa do banco de dados
   - Nomes EXATOS de tabelas e colunas
   - Foreign keys e relacionamentos
   - Valores de ENUM permitidos

2. **PROMPT-TEMPLATE.md** (`/docs/PROMPT-TEMPLATE.md`)
   - Estrutura padronizada para prompts
   - Checklist de validação
   - Exemplos práticos

3. **WORKFLOW-GUIDE.md** (`/docs/WORKFLOW-GUIDE.md`)
   - Metodologia "Schema-First Development"
   - Fluxo completo de implementação
   - Checklist pré-commit

4. **database.types.ts** (`/src/types/database.types.ts`)
   - Types TypeScript do banco
   - Interfaces Row/Insert/Update
   - ENUMs tipados

**📍 Localização dos documentos:** Todos estão no repositório GitHub acima.

---

## 🎯 METODOLOGIA OBRIGATÓRIA

**TODA implementação DEVE seguir este processo:**

### **1. CONSULTAR SCHEMA.md** 📖
- Identificar tabelas necessárias
- Anotar nomes EXATOS de colunas
- Verificar FKs e ENUMs
- Validar campos obrigatórios

### **2. VALIDAR DADOS** ✅
- Conferir tipos de dados
- Checar relacionamentos
- Verificar RLS (Row Level Security)

### **3. GERAR CÓDIGO** 💻
- Seguir nomenclatura exata do schema
- Implementar validações
- Adicionar logs detalhados
- TypeScript type-safe

### **4. CRIAR PROMPT FORMATADO** 📝
- Usar template PROMPT-TEMPLATE.md
- Incluir seção SCHEMA VERIFICADO
- Adicionar checklist de validação
- Código completo pronto para Lovable/Bolt

### **5. ENTREGAR PROMPT** 🚀
- Prompt pronto para colar
- Explicação do que foi feito
- Pontos de atenção destacados

---

## 🎨 DESIGN SYSTEM - PLATAFORMA NUTRIÇÃO

### **Identidade Visual:**
- **Tema:** Glassmorphic + Flat/Minimalista
- **Cor primária:** #10b981 (verde nutrição)
- **Cor secundária:** #059669 (verde escuro)
- **Efeito:** backdrop-filter: blur(20px)
- **Border-radius:** 12-16px
- **Sombras:** 0 2px 12px rgba(0,0,0,0.1)
- **Ícones:** SEMPRE SVG (Heroicons), NUNCA emoji

### **Light Mode:**
```css
--bg-body: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)
--bg-card: rgba(255, 255, 255, 0.9)
--text-primary: #1f2937
--text-secondary: #6b7280
--text-tertiary: #9ca3af
--border: #e5e7eb
```

### **Dark Mode:**
```css
--bg-body: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)
--bg-card: rgba(38, 38, 38, 0.6)
--text-primary: #f9fafb
--text-secondary: #d1d5db
--text-tertiary: #9ca3af
--border: #374151
```

### **Regras de Design:**
- ✅ SEMPRE toggle dark/light em todas páginas
- ✅ SEMPRE glassmorphic cards
- ✅ SEMPRE bordas laterais coloridas (aparecem no hover)
- ✅ SEMPRE ícones SVG (Heroicons)
- ✅ SEMPRE animações suaves (transition: all 0.3s)
- ✅ SEMPRE responsive (mobile-first)

---

## 📦 PÁGINAS DA PLATAFORMA (16 TOTAL)

### **✅ CONCLUÍDAS:**
[Liste aqui as páginas já implementadas]
- [ ] Sidebar
- [ ] Dashboard
- [ ] Clientes
- [ ] Leads
- [ ] Agendamentos
- [ ] Planos Alimentares
- [ ] Questionários
- [ ] Recordatório
- [ ] Feedbacks Semanais
- [ ] Serviços
- [ ] Mensagens
- [ ] Lembretes
- [ ] Agente IA
- [ ] Base de Conhecimento
- [ ] Relatórios
- [ ] Financeiro
- [ ] Configurações

### **🚧 EM ANDAMENTO:**
[Página atual sendo implementada]

### **⏳ PENDENTES:**
[Liste páginas ainda não iniciadas]

---

## 🔧 STACK TÉCNICA

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router v6
- Heroicons
- React Hook Form + Zod

**Backend:**
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Real-time subscriptions
- Storage para arquivos

**Integrações:**
- WhatsApp Business API
- Mercado Pago / Stripe
- OpenAI GPT-4 (Agente IA)
- Google Calendar

---

## 📊 ESTRUTURA DO BANCO (PRINCIPAIS TABELAS)

### **Multi-Tenancy:**
- `tenants` - Organizações/Profissionais
- `profiles` - Usuários (tenant_id aqui!)

### **Core:**
- `clients` - Pacientes
- `appointments` - Consultas
- `services` - Serviços oferecidos

### **Nutrição:**
- `food_records` - Recordatórios
- `record_meals` - Refeições do recordatório
- `record_items` - Alimentos nas refeições
- `meal_plans` - Planos alimentares
- `meals` - Refeições dos planos
- `meal_items` - Alimentos nos planos
- `foods` - Catálogo (8.596 alimentos)
- `food_measures` - Medidas dos alimentos

### **Comunicação:**
- `messages` - Histórico de mensagens
- `reminders` - Lembretes automáticos

### **IA:**
- `agent_conversations` - Conversas com IA
- `knowledge_base` - Base de conhecimento

⚠️ **ATENÇÃO CRÍTICA:**
- FK é `food_record_id` (NÃO `record_id`)
- Campo é `name` (NÃO `meal_name`)
- Status: `'ativo'` (NÃO `'active'` ou `'draft'`)
- **tenant_id** SEMPRE vem de `profiles.tenant_id` do usuário logado

---

## 🎯 PRÓXIMA TAREFA

**[PREENCHA AQUI O QUE DEVE SER FEITO AGORA]**

**Objetivo:** [Descreva o objetivo]  
**Páginas envolvidas:** [Liste as páginas]  
**Tabelas do banco:** [Liste as tabelas]  
**Prioridade:** [Alta / Média / Baixa]

**Detalhes:**
[Explique em detalhes o que precisa ser implementado]

---

## ⚠️ PROBLEMAS CONHECIDOS / BUGS

[Liste bugs ou problemas que precisam ser resolvidos]

**Exemplo:**
- [ ] Bug no recordatório: FK errada ao criar refeições
- [ ] Performance lenta no dashboard com muitos clientes
- [ ] Dark mode não persiste ao recarregar página

---

## 💡 MELHORIAS FUTURAS / BACKLOG

[Liste ideias e melhorias para implementar depois]

**Exemplo:**
- [ ] Adicionar gráficos de evolução no dashboard
- [ ] Implementar chat em tempo real
- [ ] Sistema de notificações push
- [ ] Export de relatórios em PDF

---

## 🔐 INFORMAÇÕES SENSÍVEIS

**Supabase:**
- Project ID: qmjzalbrehakxhvwrdkt
- URL: [Cole aqui se necessário]
- Anon Key: [NÃO cole aqui, use variáveis de ambiente]

**Outros serviços:**
[Liste outros serviços usados, sem expor credenciais]

---

## 📞 QUEM PROCURAR

**Desenvolvedor Principal:** [Nome/contato se aplicável]  
**PM/Cliente:** [Nome/contato se aplicável]  
**Suporte Técnico:** [Informações de suporte]

---

## ✅ CHECKLIST PARA NOVO CHAT

Antes de começar a implementar, confirme:

- [ ] Li o chat anterior via link fornecido
- [ ] Li SCHEMA.md completo
- [ ] Li PROMPT-TEMPLATE.md
- [ ] Li WORKFLOW-GUIDE.md
- [ ] Li database.types.ts
- [ ] Entendi qual é a próxima tarefa
- [ ] Identifiquei as tabelas do banco necessárias
- [ ] Validei nomenclatura de colunas e FKs
- [ ] Estou pronto para gerar o prompt formatado

---

## 🎯 COMANDOS ÚTEIS

**Consultar schema real do Supabase:**
```sql
-- Ver todas as tabelas
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Ver colunas de uma tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'meal_plans';

-- Ver foreign keys
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY';
```

**Acessar repositório:**
```bash
git clone https://github.com/oldmoneygit/craft-niche-pro.git
cd craft-niche-pro
```

---

## 📚 RECURSOS ÚTEIS

- **Supabase Docs:** https://supabase.com/docs
- **TailwindCSS:** https://tailwindcss.com
- **Heroicons:** https://heroicons.com
- **React Router:** https://reactrouter.com
- **Zod Validation:** https://zod.dev

---

**🚀 AGORA VOCÊ ESTÁ PRONTO PARA CONTINUAR O PROJETO!**

Releia a seção "PRÓXIMA TAREFA" e comece seguindo a metodologia obrigatória.

```

---

## 📝 EXEMPLO DE USO (PREENCHA OS CAMPOS):

**Link do chat anterior:** https://claude.ai/chat/[cole-aqui]  
**Última tarefa concluída:** Implementação da Sidebar  
**Próxima tarefa:** Criar Dashboard com cards de métricas

**Páginas concluídas:**
- [x] Sidebar

**Em andamento:**
- [ ] Dashboard

**Pendentes:**
- [ ] Todas as outras 15 páginas

---

**FIM DO TEMPLATE - SALVE ESTE ARQUIVO COMO `CHAT-HANDOFF-TEMPLATE.md`**
