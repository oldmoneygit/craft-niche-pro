# 🔧 Troubleshooting - Claude API

## ✅ Correções Implementadas

### **1. Validação da Chave API**
```typescript
const getApiKey = (): string => {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!key) {
    console.error('❌ VITE_ANTHROPIC_API_KEY não encontrada');
    console.log('📋 Variáveis disponíveis:', Object.keys(import.meta.env));
    throw new Error('Configure VITE_ANTHROPIC_API_KEY no arquivo .env');
  }

  console.log('✅ Chave API carregada:', key.substring(0, 20) + '...');
  return key;
};
```

### **2. Validações de Dados do Cliente**
```typescript
// Idade obrigatória e válida
if (!profile.age || profile.age < 10 || profile.age > 120) {
  throw new Error('Idade inválida ou não informada');
}

// Peso obrigatório e válido
if (!profile.weight_kg || profile.weight_kg < 30 || profile.weight_kg > 300) {
  throw new Error('Peso inválido ou não informado');
}

// Altura obrigatória e válida
if (!profile.height_cm || profile.height_cm < 100 || profile.height_cm > 250) {
  throw new Error('Altura inválida ou não informada');
}

// Objetivo obrigatório
if (!profile.goal) {
  throw new Error('Objetivo nutricional não definido. Edite o cliente e selecione um objetivo.');
}

// Atividade obrigatória
if (!profile.activity_level) {
  throw new Error('Nível de atividade física não definido. Edite o cliente e selecione o nível de atividade.');
}
```

### **3. Logs Detalhados**
```typescript
console.log('🚀 Iniciando geração de plano com IA');
console.log('👤 Perfil:', profile);
console.log('📊 Cálculos científicos:', calculatedData);
console.log('🤖 Chamando Claude API...');
console.log('✅ Resposta recebida da Claude API');
console.log('📝 Resposta (primeiros 300 chars):', responseText.substring(0, 300));
console.log('✅ JSON parseado com sucesso');
console.log('📋 Refeições sugeridas:', aiResponse.meals?.length || 0);
```

### **4. Tratamento de Erros Específicos**
```typescript
if (error.message?.includes('API key')) {
  throw new Error('Chave da API Anthropic inválida ou não configurada. Verifique VITE_ANTHROPIC_API_KEY no .env');
}

if (error.message?.includes('fetch')) {
  throw new Error('Erro de rede ao conectar com Claude API. Verifique sua conexão.');
}

if (error.message?.includes('timeout')) {
  throw new Error('Timeout ao conectar com Claude API. Tente novamente.');
}

if (error.message?.includes('rate limit')) {
  throw new Error('Limite de requisições atingido. Aguarde alguns minutos e tente novamente.');
}
```

---

## 🧪 Como Testar

### **Passo 1: Abrir Console do Navegador**
```
Pressionar F12 (ou Ctrl+Shift+I)
→ Ir para aba "Console"
```

### **Passo 2: Tentar Gerar Sugestão**
```
1. Ir em Planos Alimentares → Novo Plano
2. Selecionar Cliente
3. Clicar "Gerar Sugestão de Plano"
4. Observar logs no console
```

---

## 📋 Logs Esperados (SUCESSO)

```
🚀 Iniciando geração de plano com IA
👤 Perfil: {
  id: "...",
  name: "Jeferson de lima",
  age: 35,
  gender: "male",
  height_cm: 175,
  weight_kg: 85,
  activity_level: "sedentary",
  goal: "weight_loss"
}
✅ Chave API carregada: sk-ant-api03-xxxxxx...
📊 Cálculos científicos: {
  bmr: 1868,
  tdee: 2241,
  targetCalories: 1741,
  macros: {
    protein_g: 153,
    carb_g: 195,
    fat_g: 58
  }
}
🤖 Chamando Claude API...
✅ Resposta recebida da Claude API
📝 Resposta (primeiros 300 chars): {"meals": [{"name": "Café da Manhã", "time": "08:00", "targetCalories": 348, "items": [{"food_name": "Pão integral", "quantity": 2, "measure": "fatias", "estimated_kcal": 130, "estimated_protein": 8, "estimated_carb": 24, "estimated_fat": 2}, ...
✅ JSON parseado com sucesso
📋 Refeições sugeridas: 5
🎯 Iniciando geração para: Jeferson de lima
✅ Plano gerado com sucesso
```

---

## ❌ Erros Comuns e Soluções

### **Erro 1: "VITE_ANTHROPIC_API_KEY não encontrada"**

**Causa:** Arquivo `.env` não existe ou chave não está configurada

**Solução:**
```bash
# 1. Criar arquivo .env na raiz do projeto
touch .env

# 2. Adicionar chave (substituir XXXX pela chave real)
echo "VITE_ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" >> .env

# 3. REINICIAR servidor (OBRIGATÓRIO)
# Ctrl+C para parar
npm run dev
```

**Verificar:**
```javascript
// No console do navegador
console.log(import.meta.env.VITE_ANTHROPIC_API_KEY);
// Deve mostrar: sk-ant-api03-...
```

---

### **Erro 2: "Idade inválida ou não informada"**

**Causa:** Cliente não tem campo `age` preenchido

**Solução:**
```
1. Ir em Clientes
2. Editar cliente
3. Preencher campo "Idade" (ex: 35)
4. Salvar
5. Tentar gerar novamente
```

**Ou via SQL:**
```sql
UPDATE clients
SET age = 35
WHERE name = 'Jeferson de lima';
```

---

### **Erro 3: "Objetivo nutricional não definido"**

**Causa:** Cliente não tem campo `goal` preenchido ou está com texto livre

**Solução:**
```
1. Ir em Clientes
2. Editar cliente
3. Selecionar dropdown "Objetivo Nutricional"
4. Escolher: Perda de Peso (ou outro)
5. Salvar
```

**Ou via SQL:**
```sql
UPDATE clients
SET goal = 'weight_loss'
WHERE name = 'Jeferson de lima';
```

**Valores válidos para `goal`:**
- `maintenance`
- `weight_loss`
- `muscle_gain`
- `health`

---

### **Erro 4: "Nível de atividade física não definido"**

**Causa:** Cliente não tem campo `activity_level` preenchido

**Solução:**
```
1. Ir em Clientes
2. Editar cliente
3. Selecionar dropdown "Nível de Atividade Física"
4. Escolher: Sedentário (ou outro)
5. Salvar
```

**Ou via SQL:**
```sql
UPDATE clients
SET activity_level = 'sedentary'
WHERE name = 'Jeferson de lima';
```

**Valores válidos para `activity_level`:**
- `sedentary`
- `light`
- `moderate`
- `intense`
- `very_intense`

---

### **Erro 5: "Erro de rede ao conectar com Claude API"**

**Causa:** Sem conexão com internet ou firewall bloqueando

**Solução:**
```
1. Verificar conexão com internet
2. Tentar acessar: https://api.anthropic.com
3. Desabilitar VPN/Proxy temporariamente
4. Verificar firewall não está bloqueando
```

---

### **Erro 6: "Chave da API Anthropic inválida"**

**Causa:** Chave no `.env` está incorreta ou expirada

**Solução:**
```
1. Verificar chave começa com: sk-ant-api03-
2. Verificar não tem espaços antes/depois
3. Verificar chave está ativa no dashboard Anthropic
4. Gerar nova chave se necessário
5. REINICIAR servidor após modificar .env
```

**Formato correto do `.env`:**
```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**NÃO usar:**
```env
# ❌ Errado - com aspas
VITE_ANTHROPIC_API_KEY="sk-ant-api03-..."

# ❌ Errado - com espaços
VITE_ANTHROPIC_API_KEY = sk-ant-api03-...

# ❌ Errado - múltiplas linhas
VITE_ANTHROPIC_API_KEY=sk-ant-api03-
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

### **Erro 7: "Limite de requisições atingido"**

**Causa:** Muitas requisições em pouco tempo

**Solução:**
```
1. Aguardar 5-10 minutos
2. Tentar novamente
3. Se persistir, verificar plano da API Anthropic
```

---

### **Erro 8: "Claude retornou resposta em formato inválido"**

**Causa:** Resposta da API não está no formato JSON esperado

**Solução:**
```
1. Verificar logs completos no console
2. Copiar mensagem "Resposta completa:"
3. Pode ser problema temporário da API
4. Tentar novamente
```

---

## 🔍 Verificar Dados do Cliente

Execute este SQL para verificar se cliente tem todos os dados:

```sql
SELECT
  name,
  age,
  gender,
  height_cm,
  weight_kg,
  activity_level,
  goal
FROM clients
WHERE name ILIKE '%Jeferson%';
```

**Resultado esperado:**
```
name: Jeferson de lima
age: 35
gender: male
height_cm: 175.00
weight_kg: 85.00
activity_level: sedentary
goal: weight_loss
```

**Se algum campo estiver NULL:**
```sql
UPDATE clients
SET
  age = 35,
  gender = 'male',
  height_cm = 175,
  weight_kg = 85,
  activity_level = 'sedentary',
  goal = 'weight_loss'
WHERE name ILIKE '%Jeferson%';
```

---

## 📊 Verificar Variáveis de Ambiente

No console do navegador:

```javascript
// Verificar se chave existe
console.log('Chave existe:', !!import.meta.env.VITE_ANTHROPIC_API_KEY);

// Ver primeiros 20 caracteres
console.log('Chave:', import.meta.env.VITE_ANTHROPIC_API_KEY?.substring(0, 20));

// Listar todas variáveis disponíveis
console.log('Env vars:', Object.keys(import.meta.env));
```

**Saída esperada:**
```
Chave existe: true
Chave: sk-ant-api03-xxxxxx
Env vars: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "VITE_ANTHROPIC_API_KEY", ...]
```

---

## ⚠️ IMPORTANTE: Reiniciar Servidor

**SEMPRE que modificar arquivo `.env`, você DEVE reiniciar o servidor:**

```bash
# Parar servidor
Ctrl + C

# Iniciar novamente
npm run dev
```

Variáveis de ambiente só são carregadas na inicialização do servidor. Modificações não são detectadas automaticamente.

---

## 🆘 Se Nada Funcionar

1. **Verificar migrations foram executadas:**
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'clients'
AND column_name IN ('age', 'gender', 'height_cm', 'weight_kg', 'activity_level', 'goal');
```

2. **Verificar cliente tem dados completos:**
```sql
SELECT * FROM clients WHERE name ILIKE '%Jeferson%';
```

3. **Verificar arquivo .env existe:**
```bash
cat .env | grep ANTHROPIC
```

4. **Limpar cache do navegador:**
```
Ctrl + Shift + Delete → Limpar cache → Recarregar página
```

5. **Reinstalar dependências:**
```bash
rm -rf node_modules
npm install
npm run dev
```

---

## 📞 Informações para Suporte

Se precisar de ajuda, forneça:

1. **Logs completos do console (F12)**
2. **Mensagem de erro exata**
3. **Resultado da query de verificação do cliente**
4. **Confirmação de que .env existe e servidor foi reiniciado**

---

## ✅ Checklist de Troubleshooting

- [ ] Arquivo `.env` existe na raiz do projeto
- [ ] `VITE_ANTHROPIC_API_KEY` está no `.env` (sem aspas, sem espaços)
- [ ] Chave começa com `sk-ant-api03-`
- [ ] Servidor foi reiniciado após modificar `.env`
- [ ] Cliente tem `age`, `gender`, `height_cm`, `weight_kg` preenchidos
- [ ] Cliente tem `goal` selecionado (dropdown, não texto livre)
- [ ] Cliente tem `activity_level` selecionado
- [ ] Migrations foram executadas no Supabase
- [ ] Console do navegador aberto (F12)
- [ ] Conexão com internet funcionando

Se todos os itens estiverem marcados e ainda houver erro, copie os logs do console e a mensagem de erro exata.
