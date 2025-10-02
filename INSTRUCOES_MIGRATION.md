# Instruções para Ativar o Assistente Nutricional IA

## ⚠️ IMPORTANTE: Execute a Migration no Supabase

O sistema está pronto, mas você precisa executar a migration SQL no banco de dados Supabase para adicionar as colunas nutricionais na tabela `clients`.

---

## 📝 PASSO 1: Executar SQL no Supabase

1. Acesse o **Supabase Dashboard**: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Copie e cole o SQL abaixo:

```sql
-- Migration: Adicionar colunas de perfil nutricional
-- Execute este SQL COMPLETO de uma vez só

-- Adicionar colunas biométricas
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'intense', 'very_intense'));

-- Adicionar colunas de objetivo
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS goal TEXT CHECK (goal IN ('maintenance', 'weight_loss', 'muscle_gain', 'health')),
ADD COLUMN IF NOT EXISTS target_weight_kg DECIMAL(5,2);

-- Adicionar colunas de restrições (usando arrays)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS dislikes TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Adicionar colunas de preferências
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS meal_preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS budget TEXT CHECK (budget IN ('low', 'medium', 'high'));

-- Adicionar colunas de histórico médico
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS medical_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS medications TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Adicionar observações
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_age ON clients(age);
CREATE INDEX IF NOT EXISTS idx_clients_goal ON clients(goal);
CREATE INDEX IF NOT EXISTS idx_clients_activity_level ON clients(activity_level);

-- Comentários das colunas (documentação)
COMMENT ON COLUMN clients.age IS 'Idade do cliente em anos';
COMMENT ON COLUMN clients.gender IS 'Sexo do cliente: male, female, other';
COMMENT ON COLUMN clients.height_cm IS 'Altura em centímetros';
COMMENT ON COLUMN clients.weight_kg IS 'Peso em quilogramas';
COMMENT ON COLUMN clients.activity_level IS 'Nível de atividade física: sedentary, light, moderate, intense, very_intense';
COMMENT ON COLUMN clients.goal IS 'Objetivo nutricional: maintenance, weight_loss, muscle_gain, health';
COMMENT ON COLUMN clients.target_weight_kg IS 'Peso alvo em quilogramas (opcional)';
COMMENT ON COLUMN clients.dietary_restrictions IS 'Restrições alimentares';
COMMENT ON COLUMN clients.allergies IS 'Alergias alimentares';
COMMENT ON COLUMN clients.dislikes IS 'Alimentos que não gosta';
COMMENT ON COLUMN clients.meal_preferences IS 'Preferências alimentares';
COMMENT ON COLUMN clients.budget IS 'Orçamento: low, medium, high';
COMMENT ON COLUMN clients.medical_conditions IS 'Condições médicas';
COMMENT ON COLUMN clients.medications IS 'Medicamentos em uso';
COMMENT ON COLUMN clients.notes IS 'Observações do nutricionista';
```

5. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
6. Aguarde a mensagem de sucesso

---

## ✅ PASSO 2: Verificar se Funcionou

Execute este SQL para verificar:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clients'
  AND column_name IN ('age', 'gender', 'height_cm', 'weight_kg', 'activity_level', 'goal', 'notes')
ORDER BY column_name;
```

Você deve ver as 7 colunas listadas.

---

## 🧪 PASSO 3: Criar Cliente de Teste

Crie um cliente com dados completos para testar o assistente IA:

```sql
INSERT INTO clients (
  id,
  tenant_id,
  name,
  email,
  phone,
  age,
  gender,
  height_cm,
  weight_kg,
  activity_level,
  goal,
  dietary_restrictions,
  notes,
  created_at
) VALUES (
  gen_random_uuid(),
  'SEU_TENANT_ID_AQUI', -- ⚠️ SUBSTITUA pelo seu tenant_id real
  'João Silva',
  'joao.silva@email.com',
  '11999999999',
  35,
  'male',
  175,
  85,
  'moderate',
  'weight_loss',
  ARRAY[]::TEXT[],
  'Cliente teste para IA',
  NOW()
);
```

**Como encontrar seu `tenant_id`:**

```sql
SELECT id, name FROM tenants LIMIT 5;
```

---

## 🚀 PASSO 4: Testar o Sistema

1. Acesse a aplicação
2. Vá em **Clientes** → **Novo Cliente**
3. Você verá a nova seção **"Perfil Nutricional para IA"**
4. Preencha os campos:
   - Idade
   - Sexo
   - Altura (cm)
   - Peso (kg)
   - Nível de Atividade Física
   - Observações do Nutricionista
5. Salve o cliente

6. Vá em **Planos Alimentares** → **Novo Plano**
7. Selecione o cliente criado
8. Você verá o card **"Assistente Nutricional IA"**
9. Clique em **"Gerar Sugestão de Plano"**
10. Aguarde 5-10 segundos
11. O sistema exibirá:
    - Metas calculadas (BMR, TDEE, calorias, macros)
    - Refeições sugeridas com alimentos específicos
    - Raciocínio da IA explicando as escolhas
    - Orientações educativas para o cliente

---

## 📊 O Que Esperar do Assistente IA

### Entrada (Perfil do Cliente):
- João Silva, 35 anos
- Peso: 85kg, Altura: 175cm
- Objetivo: Perda de peso
- Atividade: Moderada (3-5x/semana)

### Saída (Sugestão Gerada):
```
Meta Calórica: 2395 kcal/dia
Proteínas: 153g
Carboidratos: 284g
Gorduras: 72g

Refeições Sugeridas:

Café da Manhã - 08:00
• 2 fatias de Pão integral (130 kcal)
• 2 unidades de Ovo cozido (140 kcal)
• 1 xícara de Café com leite (80 kcal)
• 1 unidade de Banana (89 kcal)

Lanche da Manhã - 10:00
• 1 pote de Iogurte natural (120 kcal)
• 3 unidades de Castanha (90 kcal)

Almoço - 12:00
• 4 colher de sopa de Arroz integral (180 kcal)
• 1 concha de Feijão preto (120 kcal)
• 1 filé de Frango grelhado (200 kcal)
• Salada verde à vontade (30 kcal)

... e assim por diante
```

### Raciocínio da IA:
```
Este plano foi estruturado considerando o objetivo de perda
de peso do cliente, mantendo um déficit calórico moderado
de 500 kcal/dia. A distribuição de macros prioriza proteínas
para preservação de massa muscular durante a perda de peso...
```

### Orientações para o Cliente:
```
1. Beba pelo menos 2L de água por dia
2. Faça as refeições em horários regulares
3. Mastigue devagar e aproveite as refeições
4. Evite pular refeições, especialmente o café da manhã
```

---

## ⚡ Funcionalidades Implementadas

### ✅ Fase 1: Cálculos Científicos
- Fórmula de Harris-Benedict (BMR)
- Cálculo de TDEE
- Ajuste calórico por objetivo
- Distribuição de macronutrientes
- Templates de refeições brasileiras

### ✅ Fase 2: Claude API
- Integração com Claude 3.5 Sonnet
- Prompts estruturados com context
- Validação automática de segurança
- Busca automática de alimentos no banco
- Aplicação completa do plano

### ✅ Interface Completa
- Formulário de cadastro expandido
- Card do assistente IA no editor
- Exibição de avisos e validações
- Raciocínio transparente
- Disclaimers de responsabilidade

---

## 🔒 Segurança e Responsabilidade

**O sistema foi desenhado com:**
- ✅ Disclaimers claros em múltiplos pontos
- ✅ Validações automáticas (calorias mínimas, proteínas, etc.)
- ✅ Aprovação obrigatória do nutricionista
- ✅ Transparência total (raciocínio exposto)
- ✅ Sistema SUGERE, não prescreve

**O nutricionista sempre:**
- Revisa as sugestões
- Valida cientificamente
- Ajusta conforme necessário
- Tem controle final sobre tudo

---

## 📝 Variáveis de Ambiente Configuradas

O arquivo `.env` já está configurado com:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

✅ Tudo pronto!

---

## 🆘 Troubleshooting

### Erro: "relation clients does not exist"
**Solução:** Execute o PASSO 1 acima (migration SQL)

### Erro: "column age does not exist"
**Solução:** Execute o PASSO 1 completo, não parcialmente

### Assistente IA não aparece
**Verificar:**
1. Cliente tem `age`, `gender`, `height_cm`, `weight_kg` preenchidos
2. Migration foi executada com sucesso
3. Console do navegador para erros

### Claude API não responde
**Verificar:**
1. Chave API está correta no `.env`
2. Arquivo `.env` está na raiz do projeto
3. Aplicação foi reiniciada após adicionar a chave
4. Console do navegador para erros de CORS ou API

---

## 📞 Suporte

Se algo não funcionar:
1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do Supabase
3. Confirme que a migration foi executada
4. Confirme que o cliente tem dados nutricionais

---

## 🎉 Resultado Final

Após executar a migration:
- ✅ Formulário de cliente tem campos nutricionais
- ✅ Editor de planos tem assistente IA
- ✅ Sistema calcula metas cientificamente
- ✅ Claude gera sugestões detalhadas
- ✅ Alimentos são buscados automaticamente
- ✅ Plano completo é criado em segundos

**Sistema pronto para uso profissional!**
