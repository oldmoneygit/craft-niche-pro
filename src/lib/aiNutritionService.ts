import Anthropic from '@anthropic-ai/sdk';
import { ClientProfile } from '@/types/clientProfile';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacroDistribution } from './nutritionEngine';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
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
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(profile);
  const targetCalories = calculateTargetCalories(profile);
  const macros = calculateMacroDistribution(targetCalories, profile);

  const calculatedData = {
    bmr,
    tdee,
    targetCalories,
    macros
  };

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
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

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta da IA não contém JSON válido');
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    return {
      targetCalories: calculatedData.targetCalories,
      macros: calculatedData.macros,
      meals: aiResponse.meals,
      reasoning: aiResponse.reasoning,
      educationalNotes: aiResponse.educationalNotes
    };

  } catch (error) {
    console.error('Erro ao chamar Claude API:', error);
    throw new Error('Falha ao gerar sugestão com IA. Tente novamente.');
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
