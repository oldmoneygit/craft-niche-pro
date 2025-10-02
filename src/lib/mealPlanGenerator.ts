import { ClientProfile } from '@/types/clientProfile';
import { calculateTargetCalories, calculateMacroDistribution, distributeMealCalories } from './nutritionEngine';
import { MEAL_TEMPLATES, MealTemplate } from './mealTemplates';

interface GeneratedMealPlan {
  profile: ClientProfile;
  targetCalories: number;
  macros: { protein_g: number; carb_g: number; fat_g: number };
  meals: {
    name: string;
    targetCalories: number;
    template: MealTemplate | null;
    items: any[];
  }[];
  reasoning: string;
}

export const generateMealPlan = async (
  profile: ClientProfile
): Promise<GeneratedMealPlan> => {
  const targetCalories = calculateTargetCalories(profile);
  const macros = calculateMacroDistribution(targetCalories, profile);
  const mealCalories = distributeMealCalories(targetCalories);

  const availableTemplates = MEAL_TEMPLATES.filter(template => {
    if (profile.dietary_restrictions.includes('vegetarian')) {
      if (!template.tags.includes('vegetarian')) return false;
    }

    if (profile.dietary_restrictions.includes('low_carb')) {
      if (!template.tags.includes('low-carb')) return false;
    }

    return true;
  });

  const meals = Object.entries(mealCalories).map(([mealName, targetKcal]) => {
    const mealType = getMealTypeFromName(mealName);

    const suitableTemplates = availableTemplates.filter(t =>
      t.meal_type === mealType &&
      Math.abs(t.target_kcal - targetKcal) < 150
    );

    suitableTemplates.sort((a, b) =>
      Math.abs(a.target_kcal - targetKcal) - Math.abs(b.target_kcal - targetKcal)
    );

    return {
      name: mealName,
      targetCalories: targetKcal,
      template: suitableTemplates[0] || null,
      items: []
    };
  });

  const reasoning = `
Plano gerado com base em:
- Idade: ${profile.age} anos
- Peso: ${profile.weight_kg}kg, Altura: ${profile.height_cm}cm
- Nível de atividade: ${profile.activity_level}
- Objetivo: ${profile.goal}
- TDEE estimado: ${targetCalories + (profile.goal === 'weight_loss' ? 500 : 0)} kcal
- Meta calórica: ${targetCalories} kcal/dia
- Distribuição de macros: ${macros.protein_g}g proteína, ${macros.carb_g}g carboidratos, ${macros.fat_g}g gorduras
  `.trim();

  return {
    profile,
    targetCalories,
    macros,
    meals,
    reasoning
  };
};

const getMealTypeFromName = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('café') || lower.includes('manhã')) return 'breakfast';
  if (lower.includes('almoço')) return 'lunch';
  if (lower.includes('jantar')) return 'dinner';
  if (lower.includes('lanche')) return 'afternoon_snack';
  return 'morning_snack';
};
