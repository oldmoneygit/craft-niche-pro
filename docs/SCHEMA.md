# 🗄️ SCHEMA COMPLETO - KorLab Nutri

**Última atualização:** 05/10/2025  
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
8. [Questionários](#questionários) - Avaliações de clientes
9. [Comunicação](#comunicação) - Mensagens e notificações
10. [Conhecimento IA](#conhecimento-ia) - Base de conhecimento
11. [Leads](#leads) - Captação de leads

---

## 🏢 MULTI-TENANCY {#multi-tenancy}

### `tenants`
**Descrição:** Organizações/consultórios na plataforma

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `subdomain` | text | ✅ | Subdomínio único |
| `business_name` | text | ✅ | Nome do negócio |
| `owner_email` | text | ✅ | Email do dono |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Constraints:**
- UNIQUE: `subdomain`

---

### `profiles`
**Descrição:** Perfis de usuários (nutricionistas)

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `user_id` | uuid | ✅ | FK → auth.users |
| `full_name` | text | ❌ | Nome completo |
| `tenant_id` | uuid | ❌ | FK → tenants |
| `role` | text | ✅ | admin, user |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Constraints:**
- UNIQUE: `user_id`
- CHECK: `role IN ('admin', 'user')`

**Relacionamentos:**
- `user_id` → `auth.users.id` (CASCADE DELETE)
- `tenant_id` → `tenants.id`

---

### `tenant_config`
**Descrição:** Configurações customizadas por tenant

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `business_type` | text | ✅ | nutrition, fitness, wellness |
| `enabled_features` | jsonb | ✅ | Features habilitadas |
| `custom_fields` | jsonb | ✅ | Campos personalizados |
| `branding` | jsonb | ✅ | Cores, logo |
| `ai_config` | jsonb | ✅ | Configurações IA |
| `terminology` | jsonb | ✅ | Nomenclatura customizada |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Constraints:**
- UNIQUE: `tenant_id`

---

## 👥 CLIENTES {#clientes}

### `clients`
**Descrição:** Pacientes/clientes (cadastro básico)

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `name` | text | ✅ | Nome completo |
| `email` | text | ❌ | Email |
| `phone` | text | ❌ | Telefone |
| `birth_date` | date | ❌ | Data nascimento |
| `weight` | decimal | ❌ | Peso atual (kg) |
| `height` | decimal | ❌ | Altura (cm) |
| `goal` | text | ❌ | Objetivo |
| `allergies` | text | ❌ | Alergias |
| **Campos novos (perfil nutricional):** | | | |
| `age` | integer | ❌ | Idade (anos) |
| `gender` | text | ❌ | male, female, other |
| `height_cm` | decimal(5,2) | ❌ | Altura cm |
| `weight_kg` | decimal(5,2) | ❌ | Peso kg |
| `activity_level` | text | ❌ | Nível atividade |
| `target_weight_kg` | decimal(5,2) | ❌ | Peso alvo |
| `dietary_restrictions` | text[] | ❌ | Array restrições |
| `dislikes` | text[] | ❌ | Array não gosta |
| `meal_preferences` | text[] | ❌ | Array preferências |
| `budget` | text | ❌ | low, medium, high |
| `medical_conditions` | text[] | ❌ | Array condições |
| `medications` | text[] | ❌ | Array medicamentos |
| `notes` | text | ❌ | Observações |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Constraints:**
- CHECK: `gender IN ('male', 'female', 'other')`
- CHECK: `activity_level IN ('sedentary', 'light', 'moderate', 'intense', 'very_intense')`
- CHECK: `goal IN ('maintenance', 'weight_loss', 'muscle_gain', 'health')`
- CHECK: `budget IN ('low', 'medium', 'high')`

**Índices:**
- `idx_clients_tenant` ON (tenant_id)
- `idx_clients_age` ON (age)
- `idx_clients_goal` ON (goal)
- `idx_clients_activity_level` ON (activity_level)

---

### `anamneses`
**Descrição:** Avaliação inicial completa do paciente (anamnese nutricional detalhada)

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `client_id` | uuid | ✅ | FK → clients |
| `anamnesis_date` | date | ✅ | Data da anamnese |
| `created_by` | uuid | ❌ | FK → profiles.user_id |
| **Dados antropométricos:** | | | |
| `current_weight` | decimal | ❌ | Peso atual (kg) |
| `target_weight` | decimal | ❌ | Peso alvo (kg) |
| `height` | decimal | ❌ | Altura (cm) |
| `waist_circumference` | decimal | ❌ | Cintura (cm) |
| `hip_circumference` | decimal | ❌ | Quadril (cm) |
| **Objetivo e motivação:** | | | |
| `main_goal` | text | ✅ | Objetivo principal |
| `motivation` | text | ❌ | Motivação |
| **Histórico de saúde:** | | | |
| `medical_conditions` | text | ❌ | Condições médicas |
| `current_medications` | text | ❌ | Medicamentos atuais |
| `family_history` | text | ❌ | Histórico familiar |
| `recent_exams` | jsonb | ❌ | Exames recentes |
| **Restrições alimentares:** | | | |
| `allergies` | text | ❌ | Alergias |
| `food_intolerances` | text | ❌ | Intolerâncias |
| `dietary_restrictions` | text | ❌ | Restrições |
| `food_preferences` | text | ❌ | Preferências |
| `food_dislikes` | text | ❌ | Aversões |
| **Hábitos alimentares:** | | | |
| `meals_per_day` | integer | ❌ | Refeições/dia |
| `water_intake_liters` | decimal | ❌ | Água (litros/dia) |
| `eating_out_frequency` | text | ❌ | Frequência come fora |
| `previous_diets` | text | ❌ | Dietas anteriores |
| **Estilo de vida:** | | | |
| `physical_activity` | text | ❌ | Atividade física |
| `occupation` | text | ❌ | Ocupação |
| `marital_status` | text | ❌ | Estado civil |
| `household_size` | integer | ❌ | Pessoas na casa |
| `sleep_hours` | decimal | ❌ | Horas de sono |
| `stress_level` | text | ❌ | Nível de estresse |
| `smoking` | text | ❌ | Fumante? |
| `alcohol_consumption` | text | ❌ | Consumo álcool |
| **Observações profissionais:** | | | |
| `clinical_observations` | text | ❌ | Observações clínicas |
| `professional_notes` | text | ❌ | Notas do profissional |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Relacionamentos:**
- `tenant_id` → `tenants.id`
- `client_id` → `clients.id`
- `created_by` → `auth.users.id`

**Índices:**
- `idx_anamneses_client` ON (client_id)
- `idx_anamneses_date` ON (anamnesis_date)

---

## 📅 AGENDAMENTOS {#agendamentos}

### `appointments`
**Descrição:** Consultas agendadas

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `client_id` | uuid | ✅ | FK → clients |
| `datetime` | timestamptz | ✅ | Data/hora consulta |
| `type` | text | ✅ | primeira_consulta, retorno |
| `status` | text | ✅ | agendado, confirmado, realizado, cancelado |
| `notes` | text | ❌ | Observações |
| **Campos financeiros:** | | | |
| `value` | decimal(10,2) | ❌ | Valor consulta |
| `payment_status` | text | ✅ | pending, paid, cancelled, refunded |
| `payment_method` | text | ❌ | Forma pagamento |
| `payment_date` | date | ❌ | Data pagamento |
| `payment_notes` | text | ❌ | Observações pagamento |
| **Campos de controle:** | | | |
| `confirmation_requested_at` | timestamptz | ❌ | Quando pediu confirmação |
| `reminder_sent` | timestamptz | ❌ | Quando enviou lembrete |
| `reminder_type` | text | ❌ | whatsapp, email, sms |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Constraints:**
- CHECK: `type IN ('primeira_consulta', 'retorno')`
- CHECK: `status IN ('agendado', 'confirmado', 'realizado', 'cancelado')`
- CHECK: `payment_status IN ('pending', 'paid', 'cancelled', 'refunded')`

**Índices:**
- `idx_appointments_tenant` ON (tenant_id)
- `idx_appointments_datetime` ON (datetime)
- `idx_appointments_payment_status` ON (tenant_id, payment_status)

---

### `services`
**Descrição:** Serviços/pacotes oferecidos

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `name` | text | ✅ | Nome serviço |
| `duration_type` | text | ❌ | mensal, trimestral, semestral, anual |
| `duration_days` | integer | ❌ | Duração dias |
| `modality` | text | ❌ | presencial, online, hibrido |
| `price` | decimal(10,2) | ✅ | Preço |
| `description` | text | ❌ | Descrição |
| `active` | boolean | ✅ | Ativo? (default true) |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Constraints:**
- CHECK: `duration_type IN ('mensal', 'trimestral', 'semestral', 'anual', 'personalizado')`
- CHECK: `modality IN ('presencial', 'online', 'hibrido')`

---

### `service_subscriptions`
**Descrição:** Contratações de serviços por clientes

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `client_id` | uuid | ✅ | FK → clients |
| `service_id` | uuid | ✅ | FK → services |
| `start_date` | date | ✅ | Data início |
| `end_date` | date | ✅ | Data fim |
| `status` | text | ✅ | active, expiring_soon, expired, cancelled |
| `price` | decimal(10,2) | ❌ | Preço contratado |
| `payment_status` | text | ❌ | pending, paid, overdue |
| `notes` | text | ❌ | Observações |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Constraints:**
- CHECK: `status IN ('active', 'expiring_soon', 'expired', 'cancelled', 'renewed')`
- CHECK: `payment_status IN ('pending', 'paid', 'overdue')`

**Índices:**
- `idx_subscriptions_status` ON (status, end_date)
- `idx_subscriptions_client` ON (client_id)

---

### `service_notifications`
**Descrição:** Log de notificações enviadas

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `subscription_id` | uuid | ✅ | FK → service_subscriptions |
| `notification_type` | text | ✅ | 7_days, 3_days, expiry_day |
| `sent_at` | timestamptz | ✅ | Quando enviou |
| `whatsapp_sent` | boolean | ✅ | Enviou WhatsApp? |
| `message_content` | text | ❌ | Conteúdo mensagem |

**Constraints:**
- CHECK: `notification_type IN ('7_days', '3_days', 'expiry_day', 'custom')`

---

## 🥗 ALIMENTOS {#alimentos}

### `nutrition_sources`
**Descrição:** Fontes de dados nutricionais

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `code` | text | ✅ | UNIQUE - tbca, taco, usda |
| `name` | text | ✅ | Nome fonte |
| `country` | text | ❌ | País |
| `description` | text | ❌ | Descrição |
| `active` | boolean | ✅ | Ativo? |
| `created_at` | timestamptz | ✅ | Auto |

---

### `food_categories`
**Descrição:** Categorias de alimentos

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `name` | text | ✅ | Nome categoria |
| `icon` | text | ❌ | Ícone Lucide |
| `color` | text | ❌ | Cor hex |
| `created_at` | timestamptz | ✅ | Auto |

---

### `foods`
**Descrição:** Catálogo de alimentos (8.596 itens)

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `source_id` | uuid | ❌ | FK → nutrition_sources |
| `category_id` | uuid | ❌ | FK → food_categories |
| `name` | text | ✅ | Nome alimento |
| `brand` | text | ❌ | Marca |
| `description` | text | ❌ | Descrição |
| **Composição nutricional (por 100g):** | | | |
| `energy_kcal` | decimal(10,2) | ❌ | Calorias |
| `protein_g` | decimal(10,2) | ❌ | Proteínas |
| `carbohydrate_g` | decimal(10,2) | ❌ | Carboidratos |
| `fiber_g` | decimal(10,2) | ❌ | Fibras |
| `lipid_g` | decimal(10,2) | ❌ | Gorduras |
| `saturated_fat_g` | decimal(10,2) | ❌ | Gordura saturada |
| `sodium_mg` | decimal(10,2) | ❌ | Sódio |
| **Campos customização:** | | | |
| `is_custom` | boolean | ✅ | Customizado? (default false) |
| `created_by` | uuid | ❌ | FK → profiles.user_id |
| `source_info` | text | ❌ | Info da fonte |
| `nutritionist_notes` | text | ❌ | Observações nutricionista |
| `active` | boolean | ✅ | Ativo? (default true) |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Índices:**
- `idx_foods_name` ON (name)
- `idx_foods_category` ON (category_id)
- `idx_foods_source` ON (source_id)
- `idx_foods_custom` ON (is_custom, created_by)

---

### `food_measures`
**Descrição:** Medidas/porções de alimentos

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `food_id` | uuid | ❌ | FK → foods |
| `measure_name` | text | ✅ | Ex: "1 colher sopa" |
| `grams` | decimal(10,2) | ✅ | Equivalente gramas |
| `is_default` | boolean | ✅ | Medida padrão? |
| `reference_measure_id` | uuid | ❌ | FK → reference_measures |
| `created_at` | timestamptz | ✅ | Auto |

**Constraints:**
- UNIQUE: (food_id, measure_name)

**Índices:**
- `idx_measures_food` ON (food_id)

---

### `reference_measures`
**Descrição:** Medidas de referência globais

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `name` | text | ✅ | Nome medida |
| `measure_type` | text | ✅ | weight, volume, spoon, cup, unit, slice |
| `typical_grams` | decimal(10,2) | ❌ | Gramas típicas |
| `description` | text | ❌ | Descrição |
| `display_order` | integer | ✅ | Ordem exibição |
| `created_at` | timestamptz | ✅ | Auto |

**Constraints:**
- CHECK: `measure_type IN ('weight', 'volume', 'spoon', 'cup', 'unit', 'slice', 'piece', 'portion', 'other')`

---

## 📝 RECORDATÓRIO {#recordatório}

### `food_records`
**Descrição:** Recordatórios alimentares (registro do que comeu)

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `client_id` | uuid | ✅ | FK → clients |
| `record_date` | date | ✅ | Data recordatório |
| `status` | text | ✅ | Status |
| `notes` | text | ❌ | Observações gerais |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Índices:**
- `idx_food_records_client` ON (client_id)
- `idx_food_records_date` ON (record_date)

---

### `record_meals`
**Descrição:** Refeições do recordatório

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `food_record_id` | uuid | ✅ | FK → food_records |
| `name` | text | ✅ | Nome refeição |
| `time` | time | ❌ | Horário |
| `order_index` | integer | ✅ | Ordem (default 0) |
| `notes` | text | ❌ | Observações |
| `created_at` | timestamptz | ✅ | Auto |

**⚠️ ATENÇÃO:**
- Campo FK: `food_record_id` (NÃO `record_id`)
- Campo nome: `name` (NÃO `meal_name`)

**Índices:**
- `idx_record_meals_record` ON (food_record_id)

---

### `record_items`
**Descrição:** Alimentos nas refeições do recordatório

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `record_meal_id` | uuid | ✅ | FK → record_meals |
| `food_id` | uuid | ✅ | FK → foods |
| `measure_id` | uuid | ❌ | FK → food_measures |
| `quantity` | numeric | ✅ | Quantidade |
| `grams_total` | numeric | ✅ | Total gramas |
| `kcal_total` | numeric | ✅ | Total kcal |
| `protein_total` | numeric | ✅ | Total proteínas |
| `carb_total` | numeric | ✅ | Total carboidratos |
| `fat_total` | numeric | ✅ | Total gorduras |
| `created_at` | timestamptz | ✅ | Auto |

**Índices:**
- `idx_record_items_meal` ON (record_meal_id)

---

## 🍽️ PLANOS ALIMENTARES {#planos-alimentares}

### `meal_plans`
**Descrição:** Planos alimentares criados

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `client_id` | uuid | ✅ | FK → clients |
| `name` | text | ✅ | Nome plano |
| `start_date` | date | ✅ | Data início |
| `end_date` | date | ✅ | Data fim |
| `status` | text | ✅ | ativo, concluido, pausado |
| **Metas nutricionais:** | | | |
| `target_kcal` | decimal(10,2) | ❌ | Meta calorias |
| `target_protein_g` | decimal(10,2) | ❌ | Meta proteínas |
| `target_carb_g` | decimal(10,2) | ❌ | Meta carboidratos |
| `target_fat_g` | decimal(10,2) | ❌ | Meta gorduras |
| `goal` | text | ❌ | Objetivo |
| **Versionamento:** | | | |
| `version` | integer | ✅ | Versão (default 1) |
| `is_active` | boolean | ✅ | Ativo? (default true) |
| `replaced_by` | uuid | ❌ | FK → meal_plans (auto-ref) |
| `notes` | text | ❌ | Observações versão |
| **Compartilhamento:** | | | |
| `public_token` | text | ❌ | UNIQUE - Token público |
| `active` | boolean | ❌ | Status ativo (legacy) |
| **Template usado:** | | | |
| `template_id` | uuid | ❌ | FK → meal_plan_templates |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Constraints:**
- CHECK: `status IN ('ativo', 'concluido', 'pausado')`
- UNIQUE: `public_token`

**Índices:**
- `idx_meal_plans_client` ON (client_id)
- `idx_meal_plans_active` ON (client_id, is_active)
- `idx_meal_plans_token` ON (public_token)
- `idx_meal_plans_template_id` ON (template_id)

---

### `meal_plan_meals`
**Descrição:** Refeições dos planos alimentares

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `meal_plan_id` | uuid | ✅ | FK → meal_plans |
| `name` | text | ✅ | Nome refeição |
| `time` | text | ❌ | Horário |
| `order_index` | integer | ❌ | Ordem |
| `created_at` | timestamptz | ✅ | Auto |

**Índices:**
- `idx_meal_plan_meals_plan` ON (meal_plan_id)

---

### `meal_items`
**Descrição:** Alimentos nas refeições dos planos

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `meal_id` | uuid | ❌ | FK → meal_plan_meals |
| `food_id` | uuid | ❌ | FK → foods |
| `measure_id` | uuid | ❌ | FK → food_measures |
| `quantity` | numeric | ✅ | Quantidade |
| `grams_total` | numeric | ❌ | Total gramas |
| `kcal_total` | numeric | ❌ | Total kcal |
| `protein_total` | numeric | ❌ | Total proteínas |
| `carb_total` | numeric | ❌ | Total carboidratos |
| `fat_total` | numeric | ❌ | Total gorduras |

---

## 📋 TEMPLATES {#templates}

### `meal_plan_templates`
**Descrição:** Templates reutilizáveis de planos

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `created_by` | uuid | ✅ | FK → profiles.user_id |
| `name` | varchar(200) | ✅ | Nome template |
| `description` | text | ❌ | Descrição |
| **Parâmetros referência:** | | | |
| `reference_calories` | integer | ✅ | Kcal referência |
| `reference_protein` | decimal(6,2) | ✅ | Proteína ref |
| `reference_carbs` | decimal(6,2) | ✅ | Carbo ref |
| `reference_fat` | decimal(6,2) | ✅ | Gordura ref |
| `objective` | varchar(50) | ❌ | Objetivo |
| `tags` | text[] | ❌ | Array tags |
| **Uso:** | | | |
| `times_used` | integer | ✅ | Contador (default 0) |
| `usage_count` | integer | ✅ | Contador uso |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

---

### `meal_plan_template_meals`
**Descrição:** Refeições dos templates

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `template_id` | uuid | ✅ | FK → meal_plan_templates |
| `name` | varchar(100) | ✅ | Nome refeição |
| `time` | time | ❌ | Horário |
| `order_index` | integer | ✅ | Ordem |
| `created_at` | timestamptz | ✅ | Auto |

---

### `meal_plan_template_foods`
**Descrição:** Alimentos dos templates

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `meal_id` | uuid | ✅ | FK → meal_plan_template_meals |
| `food_id` | uuid | ✅ | FK → foods |
| `measure_id` | uuid | ✅ | FK → food_measures |
| `quantity` | decimal(10,2) | ✅ | Quantidade |
| `created_at` | timestamptz | ✅ | Auto |

---

## 📊 QUESTIONÁRIOS {#questionários}

### `questionnaires`
**Descrição:** Templates de questionários

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `title` | text | ✅ | Título |
| `description` | text | ❌ | Descrição |
| `questions` | jsonb | ✅ | Perguntas (JSON) |
| `active` | boolean | ✅ | Ativo? |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

---

### `questionnaire_responses`
**Descrição:** Respostas de questionários

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `questionnaire_id` | uuid | ✅ | FK → questionnaires |
| `client_id` | uuid | ❌ | FK → clients |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `answers` | jsonb | ✅ | Respostas (JSON) |
| `completed_at` | timestamptz | ❌ | Quando completou |
| `status` | text | ✅ | pending, completed |
| `public_token` | text | ❌ | UNIQUE - Token público |
| `score` | integer | ❌ | Score 0-100 |
| **Respondente:** | | | |
| `respondent_name` | text | ❌ | Nome |
| `respondent_phone` | text | ❌ | Telefone |
| `respondent_email` | text | ❌ | Email |
| `created_at` | timestamptz | ✅ | Auto |

**Constraints:**
- CHECK: `status IN ('pending', 'completed')`
- CHECK: `score >= 0 AND score <= 100`
- UNIQUE: `public_token`

---

## 💬 COMUNICAÇÃO {#comunicação}

### `communications`
**Descrição:** Histórico de comunicações

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `client_id` | uuid | ✅ | FK → clients |
| `type` | text | ✅ | email, whatsapp, sms |
| `direction` | text | ✅ | sent, received |
| `content` | text | ✅ | Conteúdo |
| `status` | text | ✅ | sent, delivered, read, failed |
| `template_used` | text | ❌ | Template usado |
| `metadata` | jsonb | ✅ | Metadados |
| `created_at` | timestamptz | ✅ | Auto |

**Constraints:**
- CHECK: `type IN ('email', 'whatsapp', 'sms')`
- CHECK: `direction IN ('sent', 'received')`
- CHECK: `status IN ('sent', 'delivered', 'read', 'failed')`

---

### `message_templates`
**Descrição:** Templates de mensagens

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `name` | text | ✅ | Nome template |
| `type` | text | ✅ | welcome, reminder, follow_up, custom |
| `subject` | text | ❌ | Assunto (email) |
| `content` | text | ✅ | Conteúdo |
| `variables` | jsonb | ✅ | Variáveis disponíveis |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Constraints:**
- CHECK: `type IN ('welcome', 'reminder', 'follow_up', 'custom')`

---

## 🤖 CONHECIMENTO IA {#conhecimento-ia}

### `knowledge_base`
**Descrição:** Base de conhecimento para IA

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `category` | text | ✅ | faq, policy, content, service, tone |
| `title` | text | ✅ | Título |
| `content` | text | ✅ | Conteúdo |
| `keywords` | text[] | ✅ | Array keywords |
| `active` | boolean | ✅ | Ativo? |
| `usage_count` | integer | ✅ | Contador uso |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Constraints:**
- CHECK: `category IN ('faq', 'policy', 'content', 'service', 'tone')`

**Índices:**
- `idx_knowledge_tenant` ON (tenant_id, active)
- `idx_knowledge_keywords` ON (keywords) USING GIN

---

## 🎯 LEADS {#leads}

### `leads`
**Descrição:** Leads capturados

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `name` | text | ✅ | Nome |
| `phone` | text | ✅ | Telefone |
| `email` | text | ❌ | Email |
| `preferred_datetime` | timestamptz | ❌ | Data/hora preferida |
| `preferred_time_description` | text | ❌ | Descrição horário |
| `source` | text | ✅ | ai_chat, form, etc |
| `conversation_summary` | text | ❌ | Resumo conversa |
| `status` | text | ✅ | pending, contacted, scheduled, rejected |
| `notes` | text | ❌ | Observações |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Constraints:**
- CHECK: `status IN ('pending', 'contacted', 'scheduled', 'rejected')`

**Índices:**
- `idx_leads_tenant_status` ON (tenant_id, status)
- `idx_leads_created` ON (created_at DESC)

---

## 🔒 ROW LEVEL SECURITY (RLS)

**Todas as tabelas têm RLS habilitado.**

### Padrão Multi-Tenant

```sql
-- Exemplo padrão aplicado na maioria das tabelas
CREATE POLICY "Users can view from their tenant"
  ON {table_name} FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

### Exceções

**Tabelas públicas (sem RLS restritivo):**
- `nutrition_sources` - Fontes são públicas
- `food_categories` - Categorias são públicas
- `reference_measures` - Medidas globais

**Tabelas com acesso público controlado:**
- `questionnaire_responses` - Via `public_token`
- `meal_plans` - Via `public_token`

---

## 📈 VIEWS MATERIALIZADAS

### `dashboard_metrics`
**Descrição:** Métricas do dashboard (planejado)

Será criada na Fase 3 com:
- Total clientes
- Clientes ativos (últimos 30 dias)
- Receita total/mensal
- Taxa de comparecimento
- Planos ativos

---

## 🔍 ÍNDICES IMPORTANTES

### Performance Critical

```sql
-- Multi-tenancy
idx_clients_tenant (tenant_id)
idx_appointments_tenant (tenant_id)
idx_meal_plans_client (client_id)

-- Datas
idx_appointments_datetime (datetime)
idx_food_records_date (record_date)

-- Buscas
idx_foods_name (name)
idx_knowledge_keywords (keywords) USING GIN

-- Status
idx_meal_plans_active (client_id, is_active)
idx_leads_tenant_status (tenant_id, status)
```

---

## 📝 NOTAS IMPORTANTES

### Nomenclatura Padrão

**Foreign Keys:** Nome explícito da tabela
- ✅ `food_record_id` (não `record_id`)
- ✅ `meal_plan_id` (não `plan_id`)

**Campos Nome:** Sempre `name`
- ✅ `name` (não `meal_name`, `food_name`, `title`)

**Status/Enums:** Português
- ✅ `'ativo'` (não `'active'`)
- ✅ `'agendado'` (não `'scheduled'`)

### Campos JSONB

**Estrutura flexível em:**
- `tenant_config.branding` - Cores, logos
- `questionnaires.questions` - Perguntas dinâmicas
- `questionnaire_responses.answers` - Respostas
- `message_templates.variables` - Variáveis template
- `communications.metadata` - Metadados diversos

---

## 🔄 PRÓXIMAS ATUALIZAÇÕES

**A serem criadas na Fase 3:**
- `scheduled_reminders` - Sistema de lembretes
- `notifications` - Notificações real-time
- `meal_plan_history` - Backup automático de planos
- `dashboard_metrics` (materialized view)

---

**FIM DO SCHEMA**

*Documento gerado automaticamente após limpeza do banco - 05/10/2025*
