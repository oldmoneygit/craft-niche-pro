/**
 * Biblioteca de cálculos nutricionais
 */

// Calcular totais de um item específico
export const calculateItemNutrition = (
  food: any,
  measure: any,
  quantity: number
) => {
  const totalGrams = measure.grams * quantity;
  const multiplier = totalGrams / 100;

  return {
    grams_total: totalGrams,
    kcal_total: food.energy_kcal * multiplier,
    protein_total: food.protein_g * multiplier,
    carb_total: food.carbohydrate_g * multiplier,
    fat_total: food.lipid_g * multiplier,
    fiber_total: (food.fiber_g || 0) * multiplier,
    sodium_total: (food.sodium_mg || 0) * multiplier
  };
};

// Calcular totais de uma refeição
export const calculateMealTotals = (items: any[]) => {
  return items.reduce(
    (totals, item) => ({
      kcal: totals.kcal + (item.kcal_total || 0),
      protein: totals.protein + (item.protein_total || 0),
      carb: totals.carb + (item.carb_total || 0),
      fat: totals.fat + (item.fat_total || 0),
      fiber: totals.fiber + (item.fiber_total || 0),
      sodium: totals.sodium + (item.sodium_total || 0)
    }),
    { kcal: 0, protein: 0, carb: 0, fat: 0, fiber: 0, sodium: 0 }
  );
};

// Calcular totais do dia inteiro
export const calculateDayTotals = (meals: any[]) => {
  return meals.reduce(
    (totals, meal) => {
      const mealTotals = calculateMealTotals(meal.items || []);
      return {
        kcal: totals.kcal + mealTotals.kcal,
        protein: totals.protein + mealTotals.protein,
        carb: totals.carb + mealTotals.carb,
        fat: totals.fat + mealTotals.fat,
        fiber: totals.fiber + mealTotals.fiber,
        sodium: totals.sodium + mealTotals.sodium
      };
    },
    { kcal: 0, protein: 0, carb: 0, fat: 0, fiber: 0, sodium: 0 }
  );
};

// Calcular % da meta atingida
export const calculateProgress = (current: number, target: number): number => {
  if (!target || target === 0) return 0;
  return Math.round((current / target) * 100);
};

// Validar valores nutricionais (para alimentos personalizados)
export const validateNutritionValues = (data: {
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
}) => {
  // Regra: Calorias ≈ (proteína*4) + (carbo*4) + (gordura*9)
  const calculatedKcal = 
    (data.protein * 4) + 
    (data.carb * 4) + 
    (data.fat * 9);
  
  const difference = Math.abs(calculatedKcal - data.kcal);
  
  if (difference > 50) {
    return {
      valid: false,
      message: `As calorias informadas (${data.kcal}) não batem com os macronutrientes (calculado: ${Math.round(calculatedKcal)}). Verifique os valores.`,
      calculatedKcal: Math.round(calculatedKcal)
    };
  }
  
  return { valid: true };
};

// Formatar nutrientes para exibição
export const formatNutrient = (value: number | null | undefined, unit: string = 'g'): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return `0${unit}`;
  }
  return `${value.toFixed(1)}${unit}`;
};
