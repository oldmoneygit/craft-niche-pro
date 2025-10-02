import Anthropic from '@anthropic-ai/sdk';
import { ClientProfile } from '@/types/clientProfile';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacroDistribution } from './nutritionEngine';

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

const anthropic = new Anthropic({
  apiKey: getApiKey(),
  dangerouslyAllowBrowser: true
});

interface AIGeneratedMealPlan {
  targetCalories: number;
  macros: { protein_g: number; carb_g: number; fat_g: number };
  meals: {
    name: string;
    time: string;
    targetCalories: number;
    items: {
      food_name: string;
      quantity: number;
      measure: string;
      estimated_kcal: number;
      estimated_protein: number;
      estimated_carb: number;
      estimated_fat: number;
    }[];
  }[];
  reasoning: string;
  educationalNotes: string;
}

const buildSystemPrompt = (): string => {
  return `Você é um assistente especializado em nutrição que auxilia nutricionistas profissionais licenciados.

IMPORTANTE - LIMITAÇÕES E RESPONSABILIDADES:
1. Você SUGERE planos alimentares como ponto de partida
2. O nutricionista SEMPRE valida, ajusta e aprova antes de aplicar
3. Você NÃO prescreve - apenas gera rascunhos para economizar tempo do profissional
4. Suas sugestões são baseadas em diretrizes gerais brasileiras de nutrição
5. Condições médicas específicas requerem ajuste profissional

DIRETRIZES:
- Use alimentos brasileiros comuns e acessíveis
- Considere a viabilidade prática das refeições
- Distribua macros de forma equilibrada
- Evite restrições extremas
- Sugira porções realistas
- Inclua variedade nutricional

FORMATO DE RESPOSTA:
Retorne APENAS um JSON válido no seguinte formato:
{
  "meals": [
    {
      "name": "string",
      "time": "HH:MM",
      "targetCalories": number,
      "items": [
        {
          "food_name": "string",
          "quantity": number,
          "measure": "string",
          "estimated_kcal": number,
          "estimated_protein": number,
          "estimated_carb": number,
          "estimated_fat": number
        }
      ]
    }
  ],
  "reasoning": "string explicando as escolhas",
  "educationalNotes": "string com orientações educativas para o cliente"
}`;
};

const buildUserPrompt = (profile: ClientProfile, calculatedData: any): string => {
  const activityLabels = {
    sedentary: 'Sedentário',
    light: 'Leve',
    moderate: 'Moderado',
    intense: 'Intenso',
    very_intense: 'Muito Intenso'
  };

  const goalLabels = {
    maintenance: 'Manutenção de peso',
    weight_loss: 'Perda de peso',
    muscle_gain: 'Ganho de massa muscular',
    health: 'Saúde geral'
  };

  return `Gere uma sugestão de plano alimentar para o seguinte perfil:

DADOS DO CLIENTE:
- Nome: ${profile.name}
- Idade: ${profile.age} anos
- Sexo: ${profile.gender === 'male' ? 'Masculino' : profile.gender === 'female' ? 'Feminino' : 'Outro'}
- Peso: ${profile.weight_kg}kg
- Altura: ${profile.height_cm}cm
- Nível de atividade: ${activityLabels[profile.activity_level]}
- Objetivo: ${goalLabels[profile.goal]}

RESTRIÇÕES E PREFERÊNCIAS:
- Restrições alimentares: ${profile.dietary_restrictions.length > 0 ? profile.dietary_restrictions.join(', ') : 'Nenhuma'}
- Alergias: ${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'Nenhuma'}
- Não gosta: ${profile.dislikes.length > 0 ? profile.dislikes.join(', ') : 'Nada específico'}
- Preferências: ${profile.meal_preferences.length > 0 ? profile.meal_preferences.join(', ') : 'Padrão brasileiro'}

CONDIÇÕES MÉDICAS:
- ${profile.medical_conditions.length > 0 ? profile.medical_conditions.join(', ') : 'Nenhuma informada'}

OBSERVAÇÕES DO NUTRICIONISTA:
${profile.notes || 'Nenhuma'}

METAS CALCULADAS (já validadas cientificamente):
- Meta calórica diária: ${calculatedData.targetCalories} kcal
- Proteínas: ${calculatedData.macros.protein_g}g
- Carboidratos: ${calculatedData.macros.carb_g}g
- Gorduras: ${calculatedData.macros.fat_g}g

DISTRIBUIÇÃO POR REFEIÇÃO:
- Café da Manhã (08:00): ${Math.round(calculatedData.targetCalories * 0.20)} kcal
- Lanche da Manhã (10:00): ${Math.round(calculatedData.targetCalories * 0.10)} kcal
- Almoço (12:00): ${Math.round(calculatedData.targetCalories * 0.35)} kcal
- Lanche da Tarde (15:00): ${Math.round(calculatedData.targetCalories * 0.10)} kcal
- Jantar (19:00): ${Math.round(calculatedData.targetCalories * 0.25)} kcal

INSTRUÇÕES:
1. Sugira alimentos específicos e porções para CADA refeição
2. Use alimentos brasileiros comuns da Tabela TACO quando possível
3. Respeite RIGOROSAMENTE as restrições alimentares
4. Bata as metas de macros o mais próximo possível
5. Seja prático e realista
6. Inclua variedade
7. No "reasoning", explique POR QUÊ essas escolhas fazem sentido para este perfil
8. No "educationalNotes", dê 3-4 dicas práticas que o nutricionista pode repassar ao cliente

LEMBRE-SE: Esta é uma SUGESTÃO inicial. O nutricionista revisará e ajustará conforme necessário.`;
};

export const generateAIBasedMealPlan = async (
  profile: ClientProfile
): Promise<AIGeneratedMealPlan> => {
  console.log('🚀 Iniciando geração de plano com IA');
  console.log('👤 Perfil:', profile);

  if (!profile.age || profile.age < 10 || profile.age > 120) {
    throw new Error('Idade inválida ou não informada');
  }

  if (!profile.weight_kg || profile.weight_kg < 30 || profile.weight_kg > 300) {
    throw new Error('Peso inválido ou não informado');
  }

  if (!profile.height_cm || profile.height_cm < 100 || profile.height_cm > 250) {
    throw new Error('Altura inválida ou não informada');
  }

  if (!profile.goal) {
    throw new Error('Objetivo nutricional não definido. Edite o cliente e selecione um objetivo.');
  }

  if (!profile.activity_level) {
    throw new Error('Nível de atividade física não definido. Edite o cliente e selecione o nível de atividade.');
  }

  try {
    const bmr = calculateBMR(profile);
    const tdee = calculateTDEE(profile);
    const targetCalories = calculateTargetCalories(profile);
    const macros = calculateMacroDistribution(targetCalories, profile);

    const calculatedData = { bmr, tdee, targetCalories, macros };

    console.log('📊 Cálculos científicos:', calculatedData);

    console.log('🤖 Chamando Claude API...');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.7,
      system: buildSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(profile, calculatedData)
        }
      ]
    });

    console.log('✅ Resposta recebida da Claude API');

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log('📝 Resposta (primeiros 300 chars):', responseText.substring(0, 300));

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('❌ Resposta não contém JSON válido');
      console.log('Resposta completa:', responseText);
      throw new Error('Claude retornou resposta em formato inválido. Tente novamente.');
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    console.log('✅ JSON parseado com sucesso');
    console.log('📋 Refeições sugeridas:', aiResponse.meals?.length || 0);

    return {
      targetCalories: calculatedData.targetCalories,
      macros: calculatedData.macros,
      meals: aiResponse.meals || [],
      reasoning: aiResponse.reasoning || 'Não fornecido',
      educationalNotes: aiResponse.educationalNotes || 'Não fornecido'
    };

  } catch (error: any) {
    console.error('❌ Erro completo:', error);
    console.error('Stack:', error.stack);

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

    if (error.message?.includes('invalid_request_error')) {
      throw new Error('Erro na requisição à API. Verifique os dados do cliente.');
    }

    throw new Error(error.message || 'Erro desconhecido ao gerar sugestão');
  }
};

export const validateAIPlan = (plan: AIGeneratedMealPlan): {
  valid: boolean;
  warnings: string[]
} => {
  const warnings: string[] = [];

  const totalCalories = plan.meals.reduce((sum, meal) =>
    sum + meal.items.reduce((mealSum, item) => mealSum + item.estimated_kcal, 0),
    0
  );

  if (totalCalories < 1200) {
    warnings.push('⚠️ Calorias totais abaixo do mínimo recomendado (1200 kcal)');
  }

  if (totalCalories > plan.targetCalories * 1.2) {
    warnings.push('⚠️ Calorias totais muito acima da meta');
  }

  const totalProtein = plan.meals.reduce((sum, meal) =>
    sum + meal.items.reduce((mealSum, item) => mealSum + item.estimated_protein, 0),
    0
  );

  if (totalProtein < plan.macros.protein_g * 0.8) {
    warnings.push('⚠️ Proteínas abaixo da meta');
  }

  if (plan.meals.length < 3) {
    warnings.push('⚠️ Menos de 3 refeições por dia');
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
};
