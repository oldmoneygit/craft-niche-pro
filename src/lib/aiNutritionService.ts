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
  return `Você auxilia nutricionistas gerando rascunhos de planos alimentares.

LIMITAÇÕES:
- Você sugere, o nutricionista valida
- Não prescreve - apenas economiza tempo
- Baseado em diretrizes brasileiras

DIRETRIZES:
- Alimentos brasileiros acessíveis
- Distribua macros equilibradamente
- Porções realistas e variadas

FORMATO JSON:
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
  "reasoning": "string",
  "educationalNotes": "string"
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

  return `PERFIL:
${profile.name}, ${profile.age}a, ${profile.gender === 'male' ? 'M' : 'F'}, ${profile.weight_kg}kg, ${profile.height_cm}cm
Atividade: ${activityLabels[profile.activity_level]}
Objetivo: ${goalLabels[profile.goal]}

RESTRIÇÕES:
${profile.dietary_restrictions.length > 0 ? profile.dietary_restrictions.join(', ') : 'Nenhuma'}
${profile.allergies.length > 0 ? 'Alergias: ' + profile.allergies.join(', ') : ''}
${profile.dislikes.length > 0 ? 'Não gosta: ' + profile.dislikes.join(', ') : ''}
${profile.medical_conditions.length > 0 ? 'Condições: ' + profile.medical_conditions.join(', ') : ''}
${profile.notes ? 'Obs: ' + profile.notes : ''}

METAS:
Meta: ${calculatedData.targetCalories} kcal (P:${calculatedData.macros.protein_g}g C:${calculatedData.macros.carb_g}g G:${calculatedData.macros.fat_g}g)

REFEIÇÕES (5):
Café(08:00): ${Math.round(calculatedData.targetCalories * 0.20)}kcal
Lanche1(10:00): ${Math.round(calculatedData.targetCalories * 0.10)}kcal
Almoço(12:00): ${Math.round(calculatedData.targetCalories * 0.35)}kcal
Lanche2(15:00): ${Math.round(calculatedData.targetCalories * 0.10)}kcal
Jantar(19:00): ${Math.round(calculatedData.targetCalories * 0.25)}kcal

ALIMENTOS (use EXATOS):
Pão, forma, integral | Pão, francês | Ovo, cozido | Banana, prata | Maçã | Mamão | Laranja
Leite, vaca, desnatado | Leite, vaca, integral | Iogurte, natural | Arroz, integral, cozido
Arroz, branco, cozido | Feijão, carioca, cozido | Feijão, preto, cozido | Frango, peito, grelhado
Carne, bovina, sem gordura | Macarrão, cozido | Alface | Tomate | Cenoura, crua
Brócolis, cozido | Batata, cozida | Aveia, flocos | Azeite de oliva | Queijo, minas

REGRAS:
- Quantity em GRAMAS (não unidades)
- Measure: "gramas" ou "ml"
- 3-4 alimentos/refeição
- Respeite restrições
- JSON válido só

Retorne apenas JSON.`;
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
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.7,
      system: [
        {
          type: "text" as const,
          text: buildSystemPrompt(),
          cache_control: { type: "ephemeral" as const }
        }
      ],
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
