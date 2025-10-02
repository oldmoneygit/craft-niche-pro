export interface ClientProfile {
  id: string;
  name: string;

  age: number;
  gender: 'male' | 'female' | 'other';
  height_cm: number;
  weight_kg: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'intense' | 'very_intense';

  goal: 'maintenance' | 'weight_loss' | 'muscle_gain' | 'health';
  target_weight_kg?: number;

  dietary_restrictions: string[];
  allergies: string[];
  dislikes: string[];

  meal_preferences: string[];
  budget: 'low' | 'medium' | 'high';

  medical_conditions: string[];
  medications: string[];

  bmr?: number;
  tdee?: number;

  notes: string;
}
