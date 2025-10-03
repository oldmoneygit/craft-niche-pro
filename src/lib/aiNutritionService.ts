import { ClientProfile } from '@/types/clientProfile';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacroDistribution } from './nutritionEngine';
import { supabase } from '@/integrations/supabase/client';

// Debug mode apenas em desenvolvimento
const DEBUG_MODE = import.meta.env.DEV;

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

export const generateAIBasedMealPlan = async (
  profile: ClientProfile
): Promise<AIGeneratedMealPlan> => {
  if (DEBUG_MODE) {
    console.log('🚀 Iniciando geração de plano com IA');
    console.log('👤 Perfil:', profile);
  }

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

    if (DEBUG_MODE) {
      console.log('📊 Cálculos científicos:', calculatedData);
      console.log('🤖 Chamando Edge Function...');
    }

    const { data, error: functionError } = await supabase.functions.invoke('generate-meal-plan', {
      body: {
        profile,
        calculatedData
      }
    });

    if (functionError) {
      console.error('❌ Erro da Edge Function:', functionError);
      throw new Error(functionError.message || 'Erro ao gerar plano. Tente novamente.');
    }

    if (!data || !data.meals) {
      throw new Error('Resposta inválida da Edge Function');
    }

    const aiResponse = data;

    if (DEBUG_MODE) {
      console.log('✅ Resposta recebida da Edge Function');
      console.log('📋 Refeições sugeridas:', aiResponse.meals?.length || 0);
    }

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
