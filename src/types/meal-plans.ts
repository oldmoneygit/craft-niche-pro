export interface MealPlan {
  id: string;
  tenant_id: string;
  client_id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  status: 'ativo' | 'concluido' | 'pausado';
  target_kcal: number | null;
  target_protein: number | null;
  target_carbs: number | null;
  target_fats: number | null;
  goal: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  public_token: string | null;
  is_active: boolean | null;
  version: number | null;
  replaced_by: string | null;
}

export interface MealPlanMeal {
  id: string;
  meal_plan_id: string;
  name: string;
  time: string | null;
  order_index: number | null;
  created_at: string;
}

export interface MealItem {
  id: string;
  meal_id: string;
  food_id: string;
  measure_id: string | null;
  quantity: number;
  grams_total: number | null;
  kcal_total: number | null;
  protein_total: number | null;
  carb_total: number | null;
  fat_total: number | null;
  notes: string | null;
  created_at: string;
}

export interface Food {
  id: string;
  name: string;
  category: string | null;
  energy_kcal: number | null;
  protein_g: number | null;
  carbohydrate_g: number | null;
  lipid_g: number | null;
  fiber_g: number | null;
  is_custom: boolean | null;
  active: boolean | null;
}

export interface FoodMeasure {
  id: string;
  food_id: string;
  measure_name: string;
  grams: number;
  is_default: boolean | null;
}

export interface MealPlanWithDetails extends MealPlan {
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  meals: (MealPlanMeal & {
    items: (MealItem & {
      food: Food;
      measure: FoodMeasure | null;
    })[];
  })[];
}

export interface CreateMealPlanInput {
  clientId: string;
  name: string;
  startDate: string;
  endDate?: string;
  goal?: string;
  targetKcal?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
  notes?: string;
  meals: {
    name: string;
    time?: string;
    orderIndex: number;
  }[];
}

export interface AddMealItemInput {
  mealId: string;
  foodId: string;
  measureId?: string;
  quantity: number;
  macros: {
    gramsTotal: number;
    kcalTotal: number;
    proteinTotal: number;
    carbTotal: number;
    fatTotal: number;
  };
}

export const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Café da Manhã',
  morning_snack: 'Lanche da Manhã',
  lunch: 'Almoço',
  afternoon_snack: 'Lanche da Tarde',
  dinner: 'Jantar',
  supper: 'Ceia'
};

export const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: '☕',
  morning_snack: '🍎',
  lunch: '🍽️',
  afternoon_snack: '🥤',
  dinner: '🍲',
  supper: '🥛'
};
