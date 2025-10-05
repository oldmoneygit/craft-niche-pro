# 🗄️ SCHEMA COMPLETO - KorLab PAI Platform

**Última atualização:** 05/10/2025  
**Database:** Supabase PostgreSQL  
**Project ID:** qmjzalbrehakxhvwrdkt

---

## 📋 ÍNDICE DE TABELAS

1. [food_records](#food_records) - Recordatórios alimentares
2. [record_meals](#record_meals) - Refeições do recordatório
3. [record_items](#record_items) - Alimentos nas refeições
4. [meal_plans](#meal_plans) - Planos alimentares
5. [meal_plan_meals](#meal_plan_meals) - Refeições dos planos
6. [meal_items](#meal_items) - Alimentos nos planos
7. [foods](#foods) - Catálogo de alimentos
8. [food_measures](#food_measures) - Medidas dos alimentos
9. [clients](#clients) - Pacientes/clientes
10. [appointments](#appointments) - Agendamentos
11. [tenants](#tenants) - Multi-tenant

---

## 🍽️ MÓDULO: RECORDATÓRIO ALIMENTAR

### `food_records`
**Descrição:** Recordatórios alimentares dos clientes (registro do que comeu)

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `client_id` | uuid | ✅ | FK → clients |
| `record_date` | date | ✅ | Data do recordatório |
| `status` | text | ✅ | Status atual |
| `notes` | text | ❌ | Observações |
| `created_by` | uuid | ❌ | Quem criou |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**Relacionamentos:**
- `tenant_id` → `tenants.id`
- `client_id` → `clients.id`
- `created_by` → `auth.users.id`

---

### `record_meals`
**Descrição:** Refeições dentro de um recordatório

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `food_record_id` | uuid | ✅ | FK → food_records.id |
| `name` | text | ✅ | Nome da refeição |
| `time` | time | ❌ | Horário |
| `order_index` | integer | ✅ | Ordem de exibição |
| `notes` | text | ❌ | Observações |
| `created_at` | timestamptz | ✅ | Auto |

**⚠️ ATENÇÃO:**
- Foreign key é `food_record_id` (NÃO `record_id`)
- Campo `name` é obrigatório (NÃO `meal_name`)

**Relacionamentos:**
- `food_record_id` → `food_records.id`

---

### `record_items`
**Descrição:** Alimentos adicionados em cada refeição do recordatório

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `record_meal_id` | uuid | ✅ | FK → record_meals.id |
| `food_id` | uuid | ✅ | FK → foods.id |
| `measure_id` | uuid | ✅ | FK → food_measures.id |
| `quantity` | numeric | ✅ | Quantidade |
| `grams_total` | numeric | ✅ | Total em gramas |
| `kcal_total` | numeric | ✅ | Calorias totais |
| `protein_total` | numeric | ✅ | Proteínas totais |
| `carb_total` | numeric | ✅ | Carboidratos totais |
| `fat_total` | numeric | ✅ | Gorduras totais |
| `order_index` | integer | ✅ | Ordem |
| `notes` | text | ❌ | Observações |

**Relacionamentos:**
- `record_meal_id` → `record_meals.id`
- `food_id` → `foods.id`
- `measure_id` → `food_measures.id`

---

## 📊 MÓDULO: PLANOS ALIMENTARES

### `meal_plans`
**Descrição:** Planos alimentares criados para clientes

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `client_id` | uuid | ✅ | FK → clients |
| `name` | text | ✅ | Nome do plano |
| `start_date` | date | ✅ | Data início |
| `end_date` | date | ✅ | Data fim |
| `plan_data` | jsonb | ✅ | Dados do plano |
| `status` | text | ✅ | **ENUM:** ativo, concluido, pausado |
| `target_kcal` | numeric | ❌ | Meta de calorias |
| `target_protein` | numeric | ❌ | Meta proteínas |
| `target_carbs` | numeric | ❌ | Meta carboidratos |
| `target_fats` | numeric | ❌ | Meta gorduras |
| `created_by` | uuid | ❌ | Quem criou |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**⚠️ ENUM CONSTRAINT:**
```sql
status IN ('ativo', 'concluido', 'pausado')
```
**NÃO ACEITA:** 'active', 'draft', 'published', etc.

**Relacionamentos:**
- `tenant_id` → `tenants.id`
- `client_id` → `clients.id`
- `created_by` → `auth.users.id`

---

### `meal_plan_meals`
**Descrição:** Refeições dentro de um plano alimentar

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `meal_plan_id` | uuid | ✅ | FK → meal_plans.id |
| `name` | text | ✅ | Nome da refeição |
| `time` | text | ❌ | Horário |
| `order_index` | integer | ❌ | Ordem |
| `created_at` | timestamptz | ✅ | Auto |

**Relacionamentos:**
- `meal_plan_id` → `meal_plans.id`

---

### `meal_items`
**Descrição:** Alimentos em cada refeição do plano

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `meal_id` | uuid | ❌ | FK → meal_plan_meals.id |
| `food_id` | uuid | ❌ | FK → foods.id |
| `measure_id` | uuid | ❌ | FK → food_measures.id |
| `quantity` | numeric | ✅ | Quantidade |
| `grams_total` | numeric | ❌ | Total gramas |
| `kcal_total` | numeric | ❌ | Total calorias |
| `protein_total` | numeric | ❌ | Total proteínas |
| `carb_total` | numeric | ❌ | Total carboidratos |
| `fat_total` | numeric | ❌ | Total gorduras |

**Relacionamentos:**
- `meal_id` → `meal_plan_meals.id`
- `food_id` → `foods.id`
- `measure_id` → `food_measures.id`

---

## 🥗 MÓDULO: ALIMENTOS

### `foods`
**Descrição:** Catálogo completo de alimentos

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `fdc_id` | integer | ❌ | ID USDA |
| `taco_id` | text | ❌ | ID TACO |
| `name` | text | ✅ | Nome do alimento |
| `category` | text | ❌ | Categoria |
| `preparation` | text | ❌ | Preparo |
| `source` | text | ❌ | Fonte (TACO/USDA/OpenFoodFacts) |
| `calories` | numeric | ❌ | kcal/100g |
| `protein` | numeric | ❌ | g/100g |
| `carbs` | numeric | ❌ | g/100g |
| `fats` | numeric | ❌ | g/100g |
| `fiber` | numeric | ❌ | g/100g |
| `sodium` | numeric | ❌ | mg/100g |
| `confidence_score` | integer | ❌ | Score 0-100 |
| `is_active` | boolean | ❌ | Ativo? |

---

### `food_measures`
**Descrição:** Medidas caseiras dos alimentos

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `food_id` | uuid | ❌ | FK → foods.id |
| `measure_name` | text | ✅ | Ex: "colher de sopa" |
| `grams` | numeric | ✅ | Equivalente em gramas |
| `reference_measure_id` | uuid | ❌ | FK → reference_measures |

**Relacionamentos:**
- `food_id` → `foods.id`
- `reference_measure_id` → `reference_measures.id`

---

## 👥 MÓDULO: CLIENTES

### `clients`
**Descrição:** Pacientes/clientes da plataforma

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `name` | text | ✅ | Nome completo |
| `email` | text | ❌ | E-mail |
| `phone` | text | ❌ | Telefone |
| `birth_date` | date | ❌ | Data nascimento |
| `gender` | text | ❌ | **ENUM:** male, female, other |
| `height` | numeric | ❌ | Altura (cm) |
| `weight` | numeric | ❌ | Peso (kg) |
| `activity_level` | text | ❌ | **ENUM:** sedentary, light, moderate, intense, very_intense |
| `budget` | text | ❌ | **ENUM:** low, medium, high |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**ENUM CONSTRAINTS:**
```sql
gender IN ('male', 'female', 'other')
activity_level IN ('sedentary', 'light', 'moderate', 'intense', 'very_intense')
budget IN ('low', 'medium', 'high')
```

**Relacionamentos:**
- `tenant_id` → `tenants.id`

---

## 📅 MÓDULO: AGENDAMENTOS

### `appointments`
**Descrição:** Consultas agendadas

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `tenant_id` | uuid | ✅ | FK → tenants |
| `client_id` | uuid | ✅ | FK → clients |
| `datetime` | timestamptz | ✅ | Data/hora |
| `type` | text | ✅ | **ENUM:** primeira_consulta, retorno |
| `status` | text | ✅ | **ENUM:** agendado, confirmado, realizado, cancelado |
| `payment_status` | text | ❌ | **ENUM:** pending, paid, cancelled, refunded |
| `notes` | text | ❌ | Observações |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

**ENUM CONSTRAINTS:**
```sql
type IN ('primeira_consulta', 'retorno')
status IN ('agendado', 'confirmado', 'realizado', 'cancelado')
payment_status IN ('pending', 'paid', 'cancelled', 'refunded')
```

**Relacionamentos:**
- `tenant_id` → `tenants.id`
- `client_id` → `clients.id`

---

## 🏢 MÓDULO: MULTI-TENANT

### `tenants`
**Descrição:** Organizações/consultórios na plataforma

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | ✅ | PK |
| `subdomain` | text | ✅ | Subdomínio único |
| `business_name` | text | ✅ | Nome do negócio |
| `owner_email` | text | ✅ | E-mail dono |
| `created_at` | timestamptz | ✅ | Auto |
| `updated_at` | timestamptz | ✅ | Auto |

---

## 🔗 MAPA DE RELACIONAMENTOS

```
tenants
  └─→ clients
       ├─→ food_records
       │    └─→ record_meals
       │         └─→ record_items → foods
       │                            └─→ food_measures
       └─→ meal_plans
            └─→ meal_plan_meals
                 └─→ meal_items → foods
                                  └─→ food_measures
```

---

## ⚠️ ERROS COMUNS A EVITAR

### ❌ ERRO #1: Nome de coluna errado
```javascript
// ❌ ERRADO
await supabase.from('record_meals').insert({
  record_id: '...',  // ERRADO!
  meal_name: '...'   // ERRADO!
})

// ✅ CORRETO
await supabase.from('record_meals').insert({
  food_record_id: '...',  // ✅
  name: '...'             // ✅
})
```

### ❌ ERRO #2: Enum inválido
```javascript
// ❌ ERRADO
await supabase.from('meal_plans').insert({
  status: 'active'  // ERRADO! Não existe
})

// ✅ CORRETO
await supabase.from('meal_plans').insert({
  status: 'ativo'  // ✅ Valores aceitos: ativo, concluido, pausado
})
```

### ❌ ERRO #3: Foreign key errada em queries
```javascript
// ❌ ERRADO
.select(`
  *,
  record_meals (*)  // Vai falhar!
`)

// ✅ CORRETO
.select(`
  *,
  record_meals!food_record_id (*)  // Especifica FK
`)
```

---

## 📝 CHECKLIST PRÉ-CÓDIGO

Antes de gerar qualquer código que interage com banco:

- [ ] Consultei este SCHEMA.md?
- [ ] Verifiquei nomes exatos das colunas?
- [ ] Confirmei valores de ENUM permitidos?
- [ ] Mapeei foreign keys corretamente?
- [ ] Validei campos obrigatórios (NOT NULL)?
- [ ] Testei query no SQL Editor primeiro?

---

**📌 REGRA DE OURO:**  
**SEMPRE consulte este arquivo ANTES de gerar código que acessa o banco de dados.**