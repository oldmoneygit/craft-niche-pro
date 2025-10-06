# 🗄️ SCHEMA COMPLETO - KorLab Nutri

**Última atualização:** 06/10/2025  
**Database:** Supabase PostgreSQL  
**Project ID:** qmjzalbrehakxhvwrdkt  
**Status:** ✅ Limpo e Validado

---

## 📋 ÍNDICE DE MÓDULOS

1. [Multi-Tenancy](#multi-tenancy) - Sistema de tenants e usuários
2. [Clientes](#clientes) - Gestão de pacientes e anamneses
3. [Agendamentos](#agendamentos) - Consultas e serviços
4. [Alimentos](#alimentos) - Banco nutricional completo
5. [Recordatório](#recordatório) - Registro alimentar
6. [Planos Alimentares](#planos-alimentares) - Criação e gestão de planos
7. [Templates](#templates) - Templates reutilizáveis
8. [Questionários](#questionários) - **✅ COMPLETO** Avaliações com pontuação
9. [Comunicação](#comunicação) - Mensagens e notificações
10. [Conhecimento IA](#conhecimento-ia) - Base de conhecimento
11. [Leads](#leads) - Captação de leads

---

## 🏢 MULTI-TENANCY {#multi-tenancy}

**Última atualização desta seção:** 01/01/2024  
**Status:** ✅ Sistema base implementado

### 🎯 VISÃO GERAL DO MÓDULO

O sistema de multi-tenancy permite isolar dados entre diferentes clientes (nutricionistas) na mesma base de dados.

### 🔑 TABELAS PRINCIPAIS

#### `tenants`
Informações sobre cada tenant (nutricionista).

**Relacionamentos:** 1:N com `users`, `clients`, etc.

#### `users`
Usuários do sistema.

**Campos críticos:**
- `tenant_id`: FK para `tenants`
- `email`: Email do usuário
- `password`: Senha (criptografada)
- `role`: Nível de acesso (admin, user, etc.)

### ⚙️ AUTENTICAÇÃO

- Implementada com Supabase Auth
- Roles controladas via RLS (Row Level Security)

---

## 👨‍👩‍👧‍👦 CLIENTES {#clientes}

**Última atualização desta seção:** 01/01/2024  
**Status:** ✅ CRUD básico implementado

### 🎯 VISÃO GERAL DO MÓDULO

Gerenciamento de informações dos pacientes de cada nutricionista.

### 🔑 TABELAS PRINCIPAIS

#### `clients`
Dados pessoais e informações de contato dos clientes.

**Relacionamentos:** tenant_id → tenants

#### `anamneses`
Histórico de saúde e informações relevantes para a nutrição.

**Relacionamentos:** client_id → clients

---

## 📅 AGENDAMENTOS {#agendamentos}

**Última atualização desta seção:** 01/01/2024  
**Status:** 🚧 Em desenvolvimento

### 🎯 VISÃO GERAL DO MÓDULO

Agendamento de consultas e outros serviços oferecidos pelos nutricionistas.

### 🔑 TABELAS PRINCIPAIS

#### `appointments`
Agendamentos marcados.

**Relacionamentos:** tenant_id → tenants, client_id → clients

#### `services`
Tipos de serviços oferecidos (consulta, avaliação, etc.).

---

## 🍎 ALIMENTOS {#alimentos}

**Última atualização desta seção:** 01/01/2024  
**Status:** ✅ Banco de dados inicial importado

### 🎯 VISÃO GERAL DO MÓDULO

Banco de dados completo com informações nutricionais de diversos alimentos.

### 🔑 TABELAS PRINCIPAIS

#### `food_items`
Informações nutricionais detalhadas de cada alimento.

**Fonte:** Tabelas TACO e IBGE

#### `food_categories`
Categorias dos alimentos (frutas, legumes, etc.).

---

## 📝 RECORDATÓRIO {#recordatório}

**Última atualização desta seção:** 01/01/2024  
**Status:** 🚧 Em desenvolvimento

### 🎯 VISÃO GERAL DO MÓDULO

Registro detalhado da alimentação dos clientes.

### 🔑 TABELAS PRINCIPAIS

#### `food_diaries`
Diários alimentares preenchidos pelos clientes.

**Relacionamentos:** client_id → clients

#### `diary_entries`
Registros individuais de cada refeição.

**Relacionamentos:** food_diary_id → food_diaries, food_item_id → food_items

---

## 🥗 PLANOS ALIMENTARES {#planos-alimentares}

**Última atualização desta seção:** 01/01/2024  
**Status:** 🚧 Em desenvolvimento

### 🎯 VISÃO GERAL DO MÓDULO

Criação e gerenciamento de planos alimentares personalizados.

### 🔑 TABELAS PRINCIPAIS

#### `meal_plans`
Planos alimentares criados pelos nutricionistas.

**Relacionamentos:** tenant_id → tenants, client_id → clients

#### `meal_plan_items`
Itens individuais de cada plano alimentar.

**Relacionamentos:** meal_plan_id → meal_plans, food_item_id → food_items

---

## 📄 TEMPLATES {#templates}

**Última atualização desta seção:** 01/01/2024  
**Status:** 🚧 Em desenvolvimento

### 🎯 VISÃO GERAL DO MÓDULO

Templates reutilizáveis para agilizar a criação de planos alimentares, questionários, etc.

### 🔑 TABELAS PRINCIPAIS

#### `templates`
Templates genéricos.

**Relacionamentos:** tenant_id → tenants

#### `template_items`
Itens individuais de cada template.

---

## 📊 QUESTIONÁRIOS {#questionários}

**Última atualização desta seção:** 06/10/2025  
**Status:** ✅ Sistema completo e funcional com pontuação

### 🎯 VISÃO GERAL DO MÓDULO

O sistema de questionários permite criar avaliações personalizadas para clientes com:
- ✅ Múltiplos tipos de perguntas (single_choice, multiple_choice, text, scale, number)
- ✅ Sistema de pontuação configurável por pergunta (0-100 pontos)
- ✅ Pesos diferentes para cada pergunta (1-10)
- ✅ Acesso público via token (sem autenticação)
- ✅ Templates reutilizáveis
- ✅ Rastreamento de respostas individuais
- ✅ Migração de dados executada com sucesso

### 📊 FLUXO COMPLETO

```
1. CRIAÇÃO DO QUESTIONÁRIO (Nutricionista)
   ↓
2. CRIAÇÃO DAS PERGUNTAS (com pontuações opcionais)
   ↓
3. ENVIO PARA CLIENTE (cria response + public_token)
   ↓
4. CLIENTE ACESSA VIA LINK PÚBLICO (sem login)
   ↓
5. CLIENTE RESPONDE (answers salvos com question_id como chave)
   ↓
6. CÁLCULO AUTOMÁTICO DE PONTUAÇÃO (0-100)
   ↓
7. NUTRICIONISTA VISUALIZA RESPOSTAS E SCORE
```

### `questionnaires`
Template de questionário criado pelo nutricionista

**Relacionamentos:** tenant_id → tenants, ← questionnaire_questions (1:N), ← questionnaire_responses (1:N)

### `questionnaire_questions`
Perguntas individuais com sistema de pontuação

**Campos críticos:**
- `scorable`: boolean - Se conta pontos
- `weight`: integer (1-10) - Peso da pergunta
- `option_scores`: jsonb - Pontuação de cada opção
- `options`: jsonb - Array de opções

### `questionnaire_responses`
Respostas enviadas aos clientes

**⚠️ ESTRUTURA CRÍTICA `answers` (jsonb):**
```json
{
  "question-uuid-1": "option-uuid-a",
  "question-uuid-2": ["option-uuid-x", "option-uuid-y"]
}
```
**CHAVE:** question.id (não option.id!)

### 🔧 MIGRAÇÃO 06/10/2025
Migração `20251006222703` corrigiu respostas antigas convertendo chaves de `option_id` para `question_id`.

### 📐 CÁLCULO DE PONTUAÇÃO
```
pontos_pergunta = (score_opção / 100) * weight
pontuação_final = (soma_pontos / soma_weights) * 100
```

### 🎨 COMPONENTES
- `src/pages/QuestionariosBuilder.tsx` - Builder
- `src/pages/public/PublicQuestionnaireResponse.tsx` - Resposta pública
- `src/components/questionnaires/QuestionnaireResponsesModal.tsx` - Visualização
- `src/hooks/useQuestionnaires.ts` - Gerenciamento

---

## 💬 COMUNICAÇÃO {#comunicação}

**Última atualização desta seção:** 01/01/2024
**Status:** 🚧 Em desenvolvimento

### 🎯 VISÃO GERAL DO MÓDULO

Sistema de mensagens e notificações para comunicação entre nutricionistas e clientes.

### 🔑 TABELAS PRINCIPAIS

#### `messages`
Mensagens trocadas entre usuários.

**Relacionamentos:** tenant_id → tenants, sender_id → users, receiver_id → users

#### `notifications`
Notificações enviadas aos usuários.

**Relacionamentos:** tenant_id → tenants, user_id → users

---

## 🧠 CONHECIMENTO IA {#conhecimento-ia}

**Última atualização desta seção:** 01/01/2024
**Status:** 🚧 Em desenvolvimento

### 🎯 VISÃO GERAL DO MÓDULO

Base de conhecimento para auxiliar nutricionistas com informações relevantes e insights gerados por IA.

### 🔑 TABELAS PRINCIPAIS

#### `knowledge_articles`
Artigos e informações relevantes.

**Relacionamentos:** tenant_id → tenants

#### `ai_insights`
Insights gerados por IA.

---

## 🧲 LEADS {#leads}

**Última atualização desta seção:** 01/01/2024
**Status:** 🚧 Em desenvolvimento

### 🎯 VISÃO GERAL DO MÓDULO

Sistema de captação e gerenciamento de leads (potenciais clientes).

### 🔑 TABELAS PRINCIPAIS

#### `leads`
Informações de contato dos leads.

**Relacionamentos:** tenant_id → tenants
