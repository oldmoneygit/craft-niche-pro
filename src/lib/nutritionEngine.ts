import { ClientProfile } from '@/types/clientProfile';

export const calculateBMR = (profile: ClientProfile): number => {
  const { age, gender, height_cm, weight_kg } = profile;

  if (gender === 'male') {
    return 88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight_kg) + (3.098 * height_cm) - (4.330 * age);
  }
};

export const calculateTDEE = (profile: ClientProfile): number => {
  const bmr = calculateBMR(profile);

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    intense: 1.725,
    very_intense: 1.9
  };

  return Math.round(bmr * activityMultipliers[profile.activity_level]);
};

export const calculateTargetCalories = (profile: ClientProfile): number => {
  const tdee = calculateTDEE(profile);

  const goalAdjustments = {
    maintenance: 0,
    weight_loss: -500,
    muscle_gain: 300,
    health: 0
  };

  return Math.round(tdee + goalAdjustments[profile.goal]);
};

export const calculateMacroDistribution = (
  targetCalories: number,
  profile: ClientProfile
): { protein_g: number; carb_g: number; fat_g: number } => {
  const proteinMultiplier = profile.goal === 'muscle_gain' ? 2.0 : 1.8;
  const protein_g = Math.round(profile.weight_kg * proteinMultiplier);
  const proteinCalories = protein_g * 4;

  const fatPercentage = 0.27;
  const fatCalories = targetCalories * fatPercentage;
  const fat_g = Math.round(fatCalories / 9);

  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const carb_g = Math.round(carbCalories / 4);

  return { protein_g, carb_g, fat_g };
};

export const distributeMealCalories = (
  totalCalories: number,
  mealCount: number = 5
): Record<string, number> => {
  if (mealCount === 5) {
    return {
      'Café da Manhã': Math.round(totalCalories * 0.20),
      'Lanche da Manhã': Math.round(totalCalories * 0.10),
      'Almoço': Math.round(totalCalories * 0.35),
      'Lanche da Tarde': Math.round(totalCalories * 0.10),
      'Jantar': Math.round(totalCalories * 0.25)
    };
  }

  const perMeal = Math.round(totalCalories / mealCount);
  return Object.fromEntries(
    Array.from({ length: mealCount }, (_, i) => [`Refeição ${i + 1}`, perMeal])
  );
};
