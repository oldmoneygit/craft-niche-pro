# 🎯 TEMPLATE DE PROMPT PADRONIZADO

**Use este template SEMPRE que for implementar ou modificar código que interage com o banco de dados.**

---

## 📋 PROMPT TEMPLATE

```markdown
# IMPLEMENTAÇÃO: [Nome da Feature]

## 🔍 SCHEMA VERIFICADO

**Tabelas envolvidas:**
- `[nome_tabela_1]`
  - Colunas: `coluna1`, `coluna2`, `coluna3`
  - FK: `foreign_key` → `tabela_destino.id`
  - Constraints: [lista de constraints importantes]
  
- `[nome_tabela_2]`
  - Colunas: `coluna1`, `coluna2`
  - ENUM values: ['valor1', 'valor2', 'valor3']

**Consultei SCHEMA.md:** ✅ SIM / ❌ NÃO

---

## 📊 RELACIONAMENTOS

```
tabela_pai
  └─→ tabela_filha (via foreign_key)
       └─→ tabela_neta (via outra_foreign_key)
```

---

## 🎯 OBJETIVO DA IMPLEMENTAÇÃO

[Descreva claramente o que precisa ser feito]

Exemplo:
> Criar função para preencher template de recordatório com 5 refeições padrão (Café, Lanche Manhã, Almoço, Lanche Tarde, Jantar)

---

## ✅ REQUISITOS FUNCIONAIS

1. [Requisito 1]
2. [Requisito 2]
3. [Requisito 3]

---

## 🔧 PSEUDOCÓDIGO (com nomes corretos)

```typescript
async function handleAction() {
  // 1. Validar entrada
  if (!recordId) throw new Error('...')
  
  // 2. Inserir no banco
  const { data, error } = await supabase
    .from('record_meals')  // ✅ Nome correto da tabela
    .insert({
      food_record_id: recordId,  // ✅ Nome correto da FK
      name: 'Café da Manhã',     // ✅ Nome correto da coluna
      order_index: 0
    })
  
  // 3. Tratar erro
  if (error) {
    console.error(error)
    return
  }
  
  // 4. Retornar sucesso
  return data
}
```

---

## ⚠️ VALIDAÇÕES OBRIGATÓRIAS

- [ ] Nomes de colunas corretos (consultei SCHEMA.md)
- [ ] Foreign keys corretas
- [ ] Valores de ENUM válidos
- [ ] Campos NOT NULL preenchidos
- [ ] Tipos de dados compatíveis (uuid, text, integer, etc)

---

## 🧪 TESTES ESPERADOS

1. **Cenário feliz:** [Descrever]
2. **Erro esperado:** [Descrever]
3. **Edge case:** [Descrever]

---

## 📝 OBSERVAÇÕES ADICIONAIS

[Qualquer informação relevante que a IA deve saber]

Exemplo:
> A tabela record_meals usa `food_record_id` como FK, NÃO `record_id`
> O enum de status em meal_plans aceita apenas: 'ativo', 'concluido', 'pausado'
```

---

## 🚀 EXEMPLOS DE USO

### ✅ EXEMPLO 1: Criar Refeição em Recordatório

```markdown
# IMPLEMENTAÇÃO: Criar Template de Refeições no Recordatório

## 🔍 SCHEMA VERIFICADO

**Tabelas envolvidas:**
- `record_meals`
  - Colunas: `id`, `food_record_id`, `name`, `time`, `order_index`, `notes`, `created_at`
  - FK: `food_record_id` → `food_records.id`
  - Constraints: 
    - `food_record_id` NOT NULL
    - `name` NOT NULL
    - `order_index` NOT NULL

**Consultei SCHEMA.md:** ✅ SIM

---

## 📊 RELACIONAMENTOS

```
food_records (recordatório)
  └─→ record_meals (refeições)
```

---

## 🎯 OBJETIVO

Criar função para preencher template automático com 5 refeições padrão ao criar um recordatório.

---

## ✅ REQUISITOS

1. Inserir 5 refeições fixas: Café, Lanche Manhã, Almoço, Lanche Tarde, Jantar
2. Cada refeição deve ter horário padrão
3. Order_index deve ser sequencial (0-4)
4. Mostrar feedback visual ao usuário

---

## 🔧 PSEUDOCÓDIGO

```typescript
async function handleFillTemplate() {
  try {
    setIsFilling(true);
    
    const meals = [
      { name: 'Café da Manhã', time: '07:00', order: 0 },
      { name: 'Lanche da Manhã', time: '10:00', order: 1 },
      { name: 'Almoço', time: '12:30', order: 2 },
      { name: 'Lanche da Tarde', time: '15:00', order: 3 },
      { name: 'Jantar', time: '19:00', order: 4 }
    ];

    for (const meal of meals) {
      const { data, error } = await supabase
        .from('record_meals')
        .insert({
          food_record_id: recordId,  // ✅ Nome correto da FK
          name: meal.name,           // ✅ Campo 'name', não 'meal_name'
          time: meal.time,
          order_index: meal.order    // ✅ Campo 'order_index'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar meal:', error);
        continue;
      }
    }

    toast.success('Template preenchido!');
    await fetchRecord();
    
  } catch (error) {
    console.error(error);
    toast.error('Erro ao preencher template');
  } finally {
    setIsFilling(false);
  }
}
```

---

## ⚠️ VALIDAÇÕES OBRIGATÓRIAS

- [x] `food_record_id` (não `record_id`) ✅
- [x] `name` (não `meal_name`) ✅
- [x] `order_index` é obrigatório ✅
- [x] Tipos corretos (uuid, text, integer) ✅

---

## 🧪 TESTES

1. **Sucesso:** Clicar no botão e ver 5 refeições criadas
2. **Erro:** Tentar criar sem recordId válido
3. **Edge case:** Criar template duas vezes (deve duplicar ou prevenir?)
```

---

### ✅ EXEMPLO 2: Converter Recordatório em Plano

```markdown
# IMPLEMENTAÇÃO: Converter Recordatório em Plano Alimentar

## 🔍 SCHEMA VERIFICADO

**Tabelas envolvidas:**
- `food_records`
- `record_meals` (FK: `food_record_id`)
- `record_items` (FK: `record_meal_id`)
- `meal_plans` (ENUM status: 'ativo', 'concluido', 'pausado')
- `meals` (FK: `meal_plan_id`)
- `meal_items` (FK: `meal_id`)

**Consultei SCHEMA.md:** ✅ SIM

---

## 📊 RELACIONAMENTOS

```
food_records
  └─→ record_meals
       └─→ record_items
            └─→ foods

meal_plans
  └─→ meals
       └─→ meal_items
            └─→ foods
```

---

## 🎯 OBJETIVO

Copiar estrutura completa do recordatório para um plano alimentar editável.

---

## ✅ REQUISITOS

1. Buscar recordatório com todas refeições e itens
2. Calcular totais nutricionais
3. Criar meal_plan com status 'ativo'
4. Copiar todas refeições
5. Copiar todos itens com valores nutricionais
6. Redirecionar para o plano criado

---

## 🔧 PSEUDOCÓDIGO

```typescript
async function handleConvertToPlan() {
  try {
    // 1. Buscar recordatório completo
    const { data: fullRecord } = await supabase
      .from('food_records')
      .select(`
        *,
        record_meals!food_record_id (  // ✅ FK correta
          id,
          name,
          time,
          order_index,
          record_items (
            food_id,
            measure_id,
            quantity,
            grams_total,
            kcal_total,
            protein_total,
            carb_total,
            fat_total
          )
        )
      `)
      .eq('id', recordId)
      .single();

    // 2. Calcular totais
    const totals = fullRecord.record_meals.reduce(...)

    // 3. Criar plano
    const { data: newPlan } = await supabase
      .from('meal_plans')
      .insert({
        client_id: fullRecord.client_id,
        name: `Plano - ${date}`,
        status: 'ativo',  // ✅ ENUM correto (não 'active')
        target_kcal: totals.kcal,
        ...
      })
      .select()
      .single();

    // 4. Copiar refeições
    for (const meal of fullRecord.record_meals) {
      const { data: newMeal } = await supabase
        .from('meals')
        .insert({
          meal_plan_id: newPlan.id,
          name: meal.name,  // ✅ Campo 'name' correto
          time: meal.time,
          order_index: meal.order_index
        })
        .select()
        .single();

      // 5. Copiar itens
      const items = meal.record_items.map(item => ({
        meal_id: newMeal.id,
        food_id: item.food_id,
        measure_id: item.measure_id,
        quantity: item.quantity,
        ...
      }));

      await supabase.from('meal_items').insert(items);
    }

    // 6. Redirecionar
    navigate(`/planos-alimentares/${newPlan.id}`);

  } catch (error) {
    console.error(error);
    toast.error('Erro na conversão');
  }
}
```

---

## ⚠️ VALIDAÇÕES OBRIGATÓRIAS

- [x] `food_record_id` na query de record_meals ✅
- [x] `status: 'ativo'` (não 'active', 'draft') ✅
- [x] FK `meal_plan_id` em meals ✅
- [x] Todos os campos NOT NULL preenchidos ✅

---

## 🧪 TESTES

1. **Sucesso:** Converter recordatório completo
2. **Erro:** Recordatório vazio (sem refeições)
3. **Edge case:** Recordatório com apenas 1 refeição
```

---

## 🎨 COMO USAR COM IA (Bolt/Lovable/Claude)

### **Opção 1: Prompt Completo**
```
Cole o prompt formatado completo diretamente na IA:

---
[Cole aqui o prompt preenchido do template]
---

Implemente exatamente conforme o schema descrito.
```

### **Opção 2: Referência ao SCHEMA.md**
```
CONTEXTO:
- Consulte o arquivo SCHEMA.md anexado
- Tabelas: record_meals, food_records
- Verifique nomes de colunas e foreign keys

TAREFA:
[Descreva a tarefa]

IMPORTANTE:
Use os nomes EXATOS das colunas conforme SCHEMA.md
```

### **Opção 3: Validação Pós-Código**
```
Você gerou este código:
[cole o código]

VALIDE contra SCHEMA.md:
1. Nomes de colunas estão corretos?
2. Foreign keys corretas?
3. ENUMs válidos?
4. Campos NOT NULL preenchidos?

Se encontrar erros, corrija.
```

---

## 📌 CHECKLIST FINAL

Antes de executar código gerado pela IA:

- [ ] Consultei SCHEMA.md?
- [ ] Validei nomes de colunas?
- [ ] Confirmei valores de ENUM?
- [ ] Verifiquei foreign keys?
- [ ] Testei query no SQL Editor?
- [ ] Adicionei logs de debug?
- [ ] Tratei possíveis erros?

---

**🎯 REGRA DE OURO:**  
**"Schema first, code second"** - Sempre consulte a documentação antes de gerar código.