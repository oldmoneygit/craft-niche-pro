import { useState, useEffect } from 'react';
import { useAnamnese, useSaveAnamnese } from '@/hooks/useAnamnese';
import { useTenantId } from '@/hooks/useTenantId';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Componente de botão de seleção
interface SelectionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const SelectionButton = ({ label, selected, onClick }: SelectionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-4 py-2 rounded-xl border-2 transition-all duration-200 font-medium text-sm",
      selected
        ? "bg-green-500 border-green-500 text-white shadow-lg"
        : "bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-400"
    )}
  >
    {label}
  </button>
);

interface AnamneseFormProps {
  clientId: string;
}

export const AnamneseForm = ({ clientId }: AnamneseFormProps) => {
  const { tenantId } = useTenantId();
  const { data: anamnese, isLoading } = useAnamnese(clientId);
  const saveMutation = useSaveAnamnese();

  // Estado dos campos - Objetivo
  const [mainGoal, setMainGoal] = useState('');
  
  // Restrições Alimentares
  const [dietaryRestriction, setDietaryRestriction] = useState<string>('');
  const [otherRestriction, setOtherRestriction] = useState('');
  
  // Álcool: 'none', 'occasional', 'moderate', 'frequent'
  const [alcoholLevel, setAlcoholLevel] = useState<string>('none');
  
  // Fumo: 'never', 'former', 'current'
  const [smokingStatus, setSmokingStatus] = useState<string>('never');
  
  // Sono
  const [sleepQuality, setSleepQuality] = useState<string>('');
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  
  // Atividade Física: 'sedentary', 'light', 'moderate', 'intense', 'very_intense'
  const [activityLevel, setActivityLevel] = useState<string>('');
  const [activityDetails, setActivityDetails] = useState('');
  
  // Refeições: 'never', 'rarely', 'sometimes', 'often', 'daily'
  const [eatingOutFrequency, setEatingOutFrequency] = useState<string>('');
  const [eatingOutDetails, setEatingOutDetails] = useState('');
  const [householdSize, setHouseholdSize] = useState<number | null>(null);
  const [mealsPerDay, setMealsPerDay] = useState<number | null>(null);
  
  // Estresse: 'low', 'moderate', 'high', 'very_high'
  const [stressLevel, setStressLevel] = useState<string>('');
  
  // Patologias (multi-select)
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [otherConditions, setOtherConditions] = useState('');
  
  // Medicamentos e Histórico
  const [currentMedications, setCurrentMedications] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  
  // Dados Antropométricos
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [waistCircumference, setWaistCircumference] = useState<number | null>(null);
  const [hipCircumference, setHipCircumference] = useState<number | null>(null);
  const [waterIntake, setWaterIntake] = useState<number | null>(null);
  
  // Preferências Alimentares
  const [allergies, setAllergies] = useState('');
  const [foodIntolerances, setFoodIntolerances] = useState('');
  const [foodPreferences, setFoodPreferences] = useState('');
  const [foodDislikes, setFoodDislikes] = useState('');
  
  // Observações
  const [clinicalObservations, setClinicalObservations] = useState('');
  const [professionalNotes, setProfessionalNotes] = useState('');

  useEffect(() => {
    if (anamnese) {
      setMainGoal(anamnese.main_goal || '');
      
      // Parse dietary restrictions
      const restrictions = anamnese.dietary_restrictions || '';
      if (restrictions.includes('Vegetariano')) setDietaryRestriction('Vegetariano');
      else if (restrictions.includes('Vegano')) setDietaryRestriction('Vegano');
      else if (restrictions.includes('Nenhuma')) setDietaryRestriction('Nenhuma');
      else {
        setDietaryRestriction('Outro');
        setOtherRestriction(restrictions);
      }
      
      // Parse alcohol - usar valores do banco
      setAlcoholLevel(anamnese.alcohol_consumption || 'none');
      
      // Parse smoking - usar valores do banco
      setSmokingStatus(anamnese.smoking || 'never');
      
      // Sleep
      setSleepHours(anamnese.sleep_hours || null);
      
      // Physical activity - usar valores do banco
      setActivityLevel(anamnese.physical_activity || '');
      setActivityDetails(anamnese.physical_activity || '');
      
      // Eating out - usar valores do banco
      setEatingOutFrequency(anamnese.eating_out_frequency || '');
      setEatingOutDetails(anamnese.eating_out_frequency || '');
      setHouseholdSize(anamnese.household_size || null);
      setMealsPerDay(anamnese.meals_per_day || null);
      
      // Stress - usar valores do banco
      setStressLevel(anamnese.stress_level || '');
      
      // Medical conditions - parse comma-separated
      const conditions = anamnese.medical_conditions || '';
      const conditionsArray: string[] = [];
      if (conditions.includes('Diabetes')) conditionsArray.push('Diabetes');
      if (conditions.includes('Hipertensão')) conditionsArray.push('Hipertensão');
      if (conditions.includes('Dislipidemia')) conditionsArray.push('Dislipidemia');
      if (conditions.includes('Ansiedade')) conditionsArray.push('Ansiedade');
      if (conditions.includes('Depressão')) conditionsArray.push('Depressão');
      if (conditions.includes('Hipotireoidismo')) conditionsArray.push('Hipotireoidismo');
      setSelectedConditions(conditionsArray);
      setOtherConditions(conditions);
      
      setCurrentMedications(anamnese.current_medications || '');
      setFamilyHistory(anamnese.family_history || '');
      setCurrentWeight(anamnese.current_weight || null);
      setHeight(anamnese.height || null);
      setTargetWeight(anamnese.target_weight || null);
      setWaistCircumference(anamnese.waist_circumference || null);
      setHipCircumference(anamnese.hip_circumference || null);
      setWaterIntake(anamnese.water_intake_liters || null);
      setAllergies(anamnese.allergies || '');
      setFoodIntolerances(anamnese.food_intolerances || '');
      setFoodPreferences(anamnese.food_preferences || '');
      setFoodDislikes(anamnese.food_dislikes || '');
      setClinicalObservations(anamnese.clinical_observations || '');
      setProfessionalNotes(anamnese.professional_notes || '');
    }
  }, [anamnese]);

  const handleSave = () => {
    if (!tenantId) return;
    
    // Build dietary restrictions string
    let restrictionsText = dietaryRestriction;
    if (dietaryRestriction === 'Outro' && otherRestriction) {
      restrictionsText = otherRestriction;
    }
    
    // Build medical conditions text
    let conditionsText = selectedConditions.join(', ');
    if (otherConditions && !selectedConditions.every(c => otherConditions.includes(c))) {
      conditionsText = otherConditions;
    }
    
    saveMutation.mutate({
      clientId,
      tenantId,
      data: {
        main_goal: mainGoal,
        clinical_observations: clinicalObservations,
        dietary_restrictions: restrictionsText,
        alcohol_consumption: alcoholLevel, // 'none', 'occasional', 'moderate', 'frequent'
        smoking: smokingStatus, // 'never', 'former', 'current'
        sleep_hours: sleepHours,
        physical_activity: activityLevel, // 'sedentary', 'light', 'moderate', 'intense', 'very_intense'
        eating_out_frequency: eatingOutFrequency, // 'never', 'rarely', 'sometimes', 'often', 'daily'
        household_size: householdSize,
        medical_conditions: conditionsText,
        current_medications: currentMedications,
        family_history: familyHistory,
        current_weight: currentWeight,
        height,
        target_weight: targetWeight,
        waist_circumference: waistCircumference,
        hip_circumference: hipCircumference,
        water_intake_liters: waterIntake,
        meals_per_day: mealsPerDay,
        stress_level: stressLevel, // 'low', 'moderate', 'high', 'very_high'
        allergies,
        food_intolerances: foodIntolerances,
        food_preferences: foodPreferences,
        food_dislikes: foodDislikes,
        professional_notes: professionalNotes
      }
    });
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header com Glassmorphism */}
      <div className="flex justify-between items-center mb-8 p-6 rounded-3xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Anamnese Nutricional
          </h3>
          {anamnese && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Última atualização: {format(new Date(anamnese.updated_at), 'dd/MM/yyyy HH:mm')}
            </p>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {anamnese ? 'Atualizar' : 'Criar Anamnese'}
            </>
          )}
        </Button>
      </div>

      {/* Caso Clínico - Card Glassmorphic */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
        <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl p-6 shadow-xl">
          <Label className="block text-sm font-bold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Objetivos / Motivo da Consulta *
          </Label>
          <Textarea
            rows={3}
            placeholder="Descreva os objetivos e motivo da consulta..."
            value={mainGoal}
            onChange={(e) => setMainGoal(e.target.value)}
          />
        </div>
      </div>

      {/* Seções Colapsáveis com Glassmorphism */}
      <Accordion type="multiple" defaultValue={['lifestyle']} className="space-y-4">
        {/* Seção 1: Hábitos de Vida */}
        <AccordionItem value="lifestyle" className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl opacity-0 group-hover:opacity-10 blur transition duration-300"></div>
          <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
            <AccordionTrigger className="px-8 py-5 text-lg font-bold hover:no-underline hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 text-gray-800 dark:text-gray-100">
              <span className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></span>
                Hábitos de Vida
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6 space-y-6 pt-4">
              {/* Restrições Alimentares */}
              <div>
                <Label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Restrições Alimentares</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  <SelectionButton
                    label="Nenhuma"
                    selected={dietaryRestriction === 'Nenhuma'}
                    onClick={() => setDietaryRestriction('Nenhuma')}
                  />
                  <SelectionButton
                    label="Vegetariano"
                    selected={dietaryRestriction === 'Vegetariano'}
                    onClick={() => setDietaryRestriction('Vegetariano')}
                  />
                  <SelectionButton
                    label="Vegano"
                    selected={dietaryRestriction === 'Vegano'}
                    onClick={() => setDietaryRestriction('Vegano')}
                  />
                  <SelectionButton
                    label="Outro"
                    selected={dietaryRestriction === 'Outro'}
                    onClick={() => setDietaryRestriction('Outro')}
                  />
                </div>
                {dietaryRestriction === 'Outro' && (
                  <Textarea
                    rows={2}
                    placeholder="Especifique outras restrições..."
                    value={otherRestriction}
                    onChange={(e) => setOtherRestriction(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              {/* Bebida Alcoólica */}
              <div>
                <Label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Consumo de Álcool</Label>
                <div className="flex flex-wrap gap-2">
                  <SelectionButton
                    label="Nunca"
                    selected={alcoholLevel === 'none'}
                    onClick={() => setAlcoholLevel('none')}
                  />
                  <SelectionButton
                    label="Ocasional"
                    selected={alcoholLevel === 'occasional'}
                    onClick={() => setAlcoholLevel('occasional')}
                  />
                  <SelectionButton
                    label="Moderado"
                    selected={alcoholLevel === 'moderate'}
                    onClick={() => setAlcoholLevel('moderate')}
                  />
                  <SelectionButton
                    label="Frequente"
                    selected={alcoholLevel === 'frequent'}
                    onClick={() => setAlcoholLevel('frequent')}
                  />
                </div>
              </div>

              {/* Fumante */}
              <div>
                <Label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Tabagismo</Label>
                <div className="flex flex-wrap gap-2">
                  <SelectionButton
                    label="Nunca fumou"
                    selected={smokingStatus === 'never'}
                    onClick={() => setSmokingStatus('never')}
                  />
                  <SelectionButton
                    label="Ex-fumante"
                    selected={smokingStatus === 'former'}
                    onClick={() => setSmokingStatus('former')}
                  />
                  <SelectionButton
                    label="Fumante"
                    selected={smokingStatus === 'current'}
                    onClick={() => setSmokingStatus('current')}
                  />
                </div>
              </div>

              {/* Sono */}
              <div>
                <Label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Qualidade do Sono</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  <SelectionButton
                    label="Dorme bem"
                    selected={sleepQuality === 'Dorme bem'}
                    onClick={() => setSleepQuality('Dorme bem')}
                  />
                  <SelectionButton
                    label="Dorme mal"
                    selected={sleepQuality === 'Dorme mal'}
                    onClick={() => setSleepQuality('Dorme mal')}
                  />
                </div>
                <Label className="block text-sm font-semibold mb-2 mt-4">Horas de Sono por Noite</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Ex: 7.5"
                  className="w-32"
                  value={sleepHours || ''}
                  onChange={(e) => setSleepHours(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              {/* Atividade Física */}
              <div>
                <Label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Atividade Física</Label>
                <div className="flex flex-wrap gap-2">
                  <SelectionButton
                    label="Sedentário"
                    selected={activityLevel === 'sedentary'}
                    onClick={() => setActivityLevel('sedentary')}
                  />
                  <SelectionButton
                    label="Leve"
                    selected={activityLevel === 'light'}
                    onClick={() => setActivityLevel('light')}
                  />
                  <SelectionButton
                    label="Moderado"
                    selected={activityLevel === 'moderate'}
                    onClick={() => setActivityLevel('moderate')}
                  />
                  <SelectionButton
                    label="Intenso"
                    selected={activityLevel === 'intense'}
                    onClick={() => setActivityLevel('intense')}
                  />
                  <SelectionButton
                    label="Muito Intenso"
                    selected={activityLevel === 'very_intense'}
                    onClick={() => setActivityLevel('very_intense')}
                  />
                </div>
              </div>

              {/* Frequência Come Fora */}
              <div>
                <Label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Refeições Fora de Casa</Label>
                <div className="flex flex-wrap gap-2">
                  <SelectionButton
                    label="Nunca"
                    selected={eatingOutFrequency === 'never'}
                    onClick={() => setEatingOutFrequency('never')}
                  />
                  <SelectionButton
                    label="Raramente"
                    selected={eatingOutFrequency === 'rarely'}
                    onClick={() => setEatingOutFrequency('rarely')}
                  />
                  <SelectionButton
                    label="Às vezes"
                    selected={eatingOutFrequency === 'sometimes'}
                    onClick={() => setEatingOutFrequency('sometimes')}
                  />
                  <SelectionButton
                    label="Frequentemente"
                    selected={eatingOutFrequency === 'often'}
                    onClick={() => setEatingOutFrequency('often')}
                  />
                  <SelectionButton
                    label="Diariamente"
                    selected={eatingOutFrequency === 'daily'}
                    onClick={() => setEatingOutFrequency('daily')}
                  />
                </div>
              </div>

              {/* Mora com quantas pessoas */}
              <div>
                <Label className="block text-sm font-semibold mb-2">Composição Familiar</Label>
                <Input
                  type="number"
                  placeholder="Nº de pessoas na residência"
                  className="w-48"
                  value={householdSize || ''}
                  onChange={(e) => setHouseholdSize(e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>

              {/* Nível de Estresse */}
              <div>
                <Label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Nível de Estresse</Label>
                <div className="flex flex-wrap gap-2">
                  <SelectionButton
                    label="Baixo"
                    selected={stressLevel === 'low'}
                    onClick={() => setStressLevel('low')}
                  />
                  <SelectionButton
                    label="Moderado"
                    selected={stressLevel === 'moderate'}
                    onClick={() => setStressLevel('moderate')}
                  />
                  <SelectionButton
                    label="Alto"
                    selected={stressLevel === 'high'}
                    onClick={() => setStressLevel('high')}
                  />
                  <SelectionButton
                    label="Muito Alto"
                    selected={stressLevel === 'very_high'}
                    onClick={() => setStressLevel('very_high')}
                  />
                </div>
              </div>

              {/* Refeições por Dia */}
              <div>
                <Label className="block text-sm font-semibold mb-2">Número de Refeições por Dia</Label>
                <Input
                  type="number"
                  placeholder="Ex: 4"
                  className="w-32"
                  value={mealsPerDay || ''}
                  onChange={(e) => setMealsPerDay(e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>
            </AccordionContent>
          </div>
        </AccordionItem>

        {/* Seção 2: Patologias e Medicamentos */}
        <AccordionItem value="pathologies" className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-pink-400 rounded-3xl opacity-0 group-hover:opacity-10 blur transition duration-300"></div>
          <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
            <AccordionTrigger className="px-8 py-5 text-lg font-bold hover:no-underline hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 text-gray-800 dark:text-gray-100">
              <span className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500"></span>
                Condições de Saúde
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6 space-y-6 pt-4">
              {/* Condições Médicas / Patologias */}
              <div>
                <Label className="text-sm font-semibold mb-3 block text-gray-700 dark:text-gray-300">Patologias</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  <SelectionButton
                    label="Diabetes"
                    selected={selectedConditions.includes('Diabetes')}
                    onClick={() => toggleCondition('Diabetes')}
                  />
                  <SelectionButton
                    label="Hipertensão"
                    selected={selectedConditions.includes('Hipertensão')}
                    onClick={() => toggleCondition('Hipertensão')}
                  />
                  <SelectionButton
                    label="Dislipidemia"
                    selected={selectedConditions.includes('Dislipidemia')}
                    onClick={() => toggleCondition('Dislipidemia')}
                  />
                  <SelectionButton
                    label="Ansiedade"
                    selected={selectedConditions.includes('Ansiedade')}
                    onClick={() => toggleCondition('Ansiedade')}
                  />
                  <SelectionButton
                    label="Depressão"
                    selected={selectedConditions.includes('Depressão')}
                    onClick={() => toggleCondition('Depressão')}
                  />
                  <SelectionButton
                    label="Hipotireoidismo"
                    selected={selectedConditions.includes('Hipotireoidismo')}
                    onClick={() => toggleCondition('Hipotireoidismo')}
                  />
                </div>
                <Textarea
                  rows={2}
                  placeholder="Outras patologias..."
                  value={otherConditions}
                  onChange={(e) => setOtherConditions(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Medicamentos */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Medicamentos em Uso</Label>
                <Textarea
                  rows={3}
                  placeholder="Liste os medicamentos e dosagens..."
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                />
              </div>

              {/* Histórico Familiar */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Histórico Familiar</Label>
                <Textarea
                  rows={3}
                  placeholder="Doenças na família (pais, avós, irmãos)..."
                  value={familyHistory}
                  onChange={(e) => setFamilyHistory(e.target.value)}
                />
              </div>
            </AccordionContent>
          </div>
        </AccordionItem>

        {/* Seção 3: Dados Antropométricos */}
        <AccordionItem value="anthropometric" className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-3xl opacity-0 group-hover:opacity-10 blur transition duration-300"></div>
          <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
            <AccordionTrigger className="px-8 py-5 text-lg font-bold hover:no-underline hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 text-gray-800 dark:text-gray-100">
              <span className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"></span>
                Dados Antropométricos
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6 space-y-5 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Peso Atual */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Peso Atual (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 75.5"
                  value={currentWeight || ''}
                  onChange={(e) => setCurrentWeight(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              {/* Altura */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Altura (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 175"
                  value={height || ''}
                  onChange={(e) => setHeight(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              {/* Peso Meta */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Peso Meta (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 70"
                  value={targetWeight || ''}
                  onChange={(e) => setTargetWeight(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              {/* Circunferência da Cintura */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Circunferência da Cintura (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 90"
                  value={waistCircumference || ''}
                  onChange={(e) => setWaistCircumference(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              {/* Circunferência do Quadril */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Circunferência do Quadril (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 100"
                  value={hipCircumference || ''}
                  onChange={(e) => setHipCircumference(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              {/* Ingestão Hídrica */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Ingestão Hídrica (litros/dia)</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Ex: 2"
                  value={waterIntake || ''}
                  onChange={(e) => setWaterIntake(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
            </div>
          </AccordionContent>
          </div>
        </AccordionItem>

        {/* Seção 4: Hábitos Alimentares */}
        <AccordionItem value="dietary" className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-3xl opacity-0 group-hover:opacity-10 blur transition duration-300"></div>
          <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
            <AccordionTrigger className="px-8 py-5 text-lg font-bold hover:no-underline hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 text-gray-800 dark:text-gray-100">
              <span className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"></span>
                Hábitos Alimentares
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6 space-y-4 pt-4">
            {/* Alergias */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Alergias Alimentares</Label>
              <Textarea
                rows={2}
                placeholder="Alergias a alimentos específicos..."
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>

            {/* Intolerâncias */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Intolerâncias Alimentares</Label>
              <Textarea
                rows={2}
                placeholder="Lactose, glúten, etc..."
                value={foodIntolerances}
                onChange={(e) => setFoodIntolerances(e.target.value)}
              />
            </div>

            {/* Preferências */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Preferências Alimentares</Label>
              <Textarea
                rows={2}
                placeholder="Alimentos que gosta e consome com frequência..."
                value={foodPreferences}
                onChange={(e) => setFoodPreferences(e.target.value)}
              />
            </div>

            {/* Aversões */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Aversões Alimentares</Label>
              <Textarea
                rows={2}
                placeholder="Alimentos que não gosta..."
                value={foodDislikes}
                onChange={(e) => setFoodDislikes(e.target.value)}
              />
            </div>
          </AccordionContent>
          </div>
        </AccordionItem>

        {/* Seção 5: Observações do Profissional */}
        <AccordionItem value="observations" className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-3xl opacity-0 group-hover:opacity-10 blur transition duration-300"></div>
          <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
            <AccordionTrigger className="px-8 py-5 text-lg font-bold hover:no-underline hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 text-gray-800 dark:text-gray-100">
              <span className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"></span>
                Observações Profissionais
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6 space-y-4 pt-4">
            {/* Observações Clínicas */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Observações Clínicas</Label>
              <Textarea
                rows={3}
                placeholder="Impressões sobre o quadro clínico do paciente..."
                value={clinicalObservations}
                onChange={(e) => setClinicalObservations(e.target.value)}
              />
            </div>

            {/* Notas Profissionais */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Notas do Profissional</Label>
              <Textarea
                rows={3}
                placeholder="Anotações sobre a conduta, estratégias, etc..."
                value={professionalNotes}
                onChange={(e) => setProfessionalNotes(e.target.value)}
              />
            </div>
          </AccordionContent>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
