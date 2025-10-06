import { useState, useEffect } from 'react';
import { useAnamnese, useSaveAnamnese } from '@/hooks/useAnamnese';
import { useTenantId } from '@/hooks/useTenantId';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';

interface AnamneseFormProps {
  clientId: string;
}

export const AnamneseForm = ({ clientId }: AnamneseFormProps) => {
  const { tenantId } = useTenantId();
  const { data: anamnese, isLoading } = useAnamnese(clientId);
  const saveMutation = useSaveAnamnese();

  // Estado dos campos
  const [mainGoal, setMainGoal] = useState('');
  const [clinicalObservations, setClinicalObservations] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [alcoholConsumption, setAlcoholConsumption] = useState('');
  const [smoking, setSmoking] = useState('');
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [physicalActivity, setPhysicalActivity] = useState('');
  const [eatingOutFrequency, setEatingOutFrequency] = useState('');
  const [householdSize, setHouseholdSize] = useState<number | null>(null);
  const [medicalConditions, setMedicalConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [waistCircumference, setWaistCircumference] = useState<number | null>(null);
  const [hipCircumference, setHipCircumference] = useState<number | null>(null);
  const [waterIntake, setWaterIntake] = useState<number | null>(null);
  const [mealsPerDay, setMealsPerDay] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState('');
  const [allergies, setAllergies] = useState('');
  const [foodIntolerances, setFoodIntolerances] = useState('');
  const [foodPreferences, setFoodPreferences] = useState('');
  const [foodDislikes, setFoodDislikes] = useState('');
  const [professionalNotes, setProfessionalNotes] = useState('');

  useEffect(() => {
    if (anamnese) {
      setMainGoal(anamnese.main_goal || '');
      setClinicalObservations(anamnese.clinical_observations || '');
      setDietaryRestrictions(anamnese.dietary_restrictions || '');
      setAlcoholConsumption(anamnese.alcohol_consumption || '');
      setSmoking(anamnese.smoking || '');
      setSleepHours(anamnese.sleep_hours || null);
      setPhysicalActivity(anamnese.physical_activity || '');
      setEatingOutFrequency(anamnese.eating_out_frequency || '');
      setHouseholdSize(anamnese.household_size || null);
      setMedicalConditions(anamnese.medical_conditions || '');
      setCurrentMedications(anamnese.current_medications || '');
      setFamilyHistory(anamnese.family_history || '');
      setCurrentWeight(anamnese.current_weight || null);
      setHeight(anamnese.height || null);
      setTargetWeight(anamnese.target_weight || null);
      setWaistCircumference(anamnese.waist_circumference || null);
      setHipCircumference(anamnese.hip_circumference || null);
      setWaterIntake(anamnese.water_intake_liters || null);
      setMealsPerDay(anamnese.meals_per_day || null);
      setStressLevel(anamnese.stress_level || '');
      setAllergies(anamnese.allergies || '');
      setFoodIntolerances(anamnese.food_intolerances || '');
      setFoodPreferences(anamnese.food_preferences || '');
      setFoodDislikes(anamnese.food_dislikes || '');
      setProfessionalNotes(anamnese.professional_notes || '');
    }
  }, [anamnese]);

  const handleSave = () => {
    if (!tenantId) return;
    
    saveMutation.mutate({
      clientId,
      tenantId,
      data: {
        main_goal: mainGoal,
        clinical_observations: clinicalObservations,
        dietary_restrictions: dietaryRestrictions,
        alcohol_consumption: alcoholConsumption,
        smoking,
        sleep_hours: sleepHours,
        physical_activity: physicalActivity,
        eating_out_frequency: eatingOutFrequency,
        household_size: householdSize,
        medical_conditions: medicalConditions,
        current_medications: currentMedications,
        family_history: familyHistory,
        current_weight: currentWeight,
        height,
        target_weight: targetWeight,
        waist_circumference: waistCircumference,
        hip_circumference: hipCircumference,
        water_intake_liters: waterIntake,
        meals_per_day: mealsPerDay,
        stress_level: stressLevel,
        allergies,
        food_intolerances: foodIntolerances,
        food_preferences: foodPreferences,
        food_dislikes: foodDislikes,
        professional_notes: professionalNotes
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">Anamnese Nutricional</h3>
          {anamnese && (
            <p className="text-sm text-muted-foreground">
              Última atualização: {format(new Date(anamnese.updated_at), 'dd/MM/yyyy HH:mm')}
            </p>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-green-500 hover:bg-green-600 text-white"
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

      {/* Caso Clínico - Sempre visível */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <Label className="block text-sm font-bold mb-2">
          Objetivos / Motivo da Consulta *
        </Label>
        <textarea
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-foreground"
          rows={3}
          placeholder="Objetivos do cliente, motivo da consulta..."
          value={mainGoal}
          onChange={(e) => setMainGoal(e.target.value)}
        />
      </div>

      {/* Seções Colapsáveis */}
      <Accordion type="multiple" defaultValue={['lifestyle']} className="space-y-2">
        {/* Seção 1: Hábitos de Vida */}
        <AccordionItem value="lifestyle" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-bold hover:no-underline">
            Hábitos de Vida
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {/* Restrições Alimentares */}
            <div>
              <Label className="block text-sm font-semibold mb-2">Restrições Alimentares</Label>
              <textarea
                rows={2}
                placeholder="Vegetariano, vegano, sem glúten, etc..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
              />
            </div>

            {/* Bebida Alcoólica */}
            <div>
              <Label className="block text-sm font-semibold mb-2">Consumo de Álcool</Label>
              <textarea
                rows={2}
                placeholder="Frequência e tipo de bebida..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={alcoholConsumption}
                onChange={(e) => setAlcoholConsumption(e.target.value)}
              />
            </div>

            {/* Fumante */}
            <div>
              <Label className="block text-sm font-semibold mb-2">Tabagismo</Label>
              <textarea
                rows={2}
                placeholder="Fumante, ex-fumante, quantidade..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={smoking}
                onChange={(e) => setSmoking(e.target.value)}
              />
            </div>

            {/* Sono */}
            <div>
              <Label className="block text-sm font-semibold mb-2">Horas de Sono</Label>
              <input
                type="number"
                step="0.5"
                placeholder="Ex: 7.5"
                className="w-32 px-3 py-2 border rounded-lg bg-background text-foreground"
                value={sleepHours || ''}
                onChange={(e) => setSleepHours(e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>

            {/* Exercícios */}
            <div>
              <Label className="block text-sm font-semibold mb-2">Atividade Física</Label>
              <textarea
                rows={2}
                placeholder="Frequência e tipo de exercício..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={physicalActivity}
                onChange={(e) => setPhysicalActivity(e.target.value)}
              />
            </div>

            {/* Frequência Come Fora */}
            <div>
              <Label className="block text-sm font-semibold mb-2">Frequência de Refeições Fora de Casa</Label>
              <textarea
                rows={2}
                placeholder="Ex: Almoço 3x/semana no trabalho..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={eatingOutFrequency}
                onChange={(e) => setEatingOutFrequency(e.target.value)}
              />
            </div>

            {/* Mora com quantas pessoas */}
            <div>
              <Label className="block text-sm font-semibold mb-2">Composição Familiar</Label>
              <input
                type="number"
                placeholder="Nº de pessoas na residência"
                className="w-48 px-3 py-2 border rounded-lg bg-background text-foreground"
                value={householdSize || ''}
                onChange={(e) => setHouseholdSize(e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>

            {/* Nível de Estresse */}
            <div>
              <Label className="block text-sm font-semibold mb-2">Nível de Estresse</Label>
              <input
                type="text"
                placeholder="Ex: Alto, Moderado, Baixo..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={stressLevel}
                onChange={(e) => setStressLevel(e.target.value)}
              />
            </div>

            {/* Refeições por Dia */}
            <div>
              <Label className="block text-sm font-semibold mb-2">Número de Refeições por Dia</Label>
              <input
                type="number"
                placeholder="Ex: 4"
                className="w-32 px-3 py-2 border rounded-lg bg-background text-foreground"
                value={mealsPerDay || ''}
                onChange={(e) => setMealsPerDay(e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Seção 2: Patologias e Medicamentos */}
        <AccordionItem value="pathologies" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-bold hover:no-underline">
            Condições de Saúde
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {/* Condições Médicas */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Condições Médicas / Patologias</Label>
              <textarea
                rows={3}
                placeholder="Diabetes, hipertensão, problemas de tireoide, etc..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
              />
            </div>

            {/* Medicamentos */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Medicamentos em Uso</Label>
              <textarea
                rows={3}
                placeholder="Liste os medicamentos e dosagens..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
              />
            </div>

            {/* Histórico Familiar */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Histórico Familiar</Label>
              <textarea
                rows={3}
                placeholder="Doenças na família (pais, avós, irmãos)..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={familyHistory}
                onChange={(e) => setFamilyHistory(e.target.value)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Seção 3: Dados Antropométricos */}
        <AccordionItem value="anthropometric" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-bold hover:no-underline">
            Dados Antropométricos
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Peso Atual */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Peso Atual (kg)</Label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 75.5"
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                  value={currentWeight || ''}
                  onChange={(e) => setCurrentWeight(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              {/* Altura */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Altura (cm)</Label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 175"
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                  value={height || ''}
                  onChange={(e) => setHeight(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              {/* Peso Meta */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Peso Meta (kg)</Label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 70"
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                  value={targetWeight || ''}
                  onChange={(e) => setTargetWeight(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              {/* Circunferência da Cintura */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Circunferência da Cintura (cm)</Label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 90"
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                  value={waistCircumference || ''}
                  onChange={(e) => setWaistCircumference(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              {/* Circunferência do Quadril */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Circunferência do Quadril (cm)</Label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 100"
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                  value={hipCircumference || ''}
                  onChange={(e) => setHipCircumference(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              {/* Ingestão Hídrica */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Ingestão Hídrica (litros/dia)</Label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Ex: 2"
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                  value={waterIntake || ''}
                  onChange={(e) => setWaterIntake(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Seção 4: Hábitos Alimentares */}
        <AccordionItem value="dietary" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-bold hover:no-underline">
            Hábitos Alimentares
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-4">
            {/* Alergias */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Alergias Alimentares</Label>
              <textarea
                rows={2}
                placeholder="Alergias a alimentos específicos..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>

            {/* Intolerâncias */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Intolerâncias Alimentares</Label>
              <textarea
                rows={2}
                placeholder="Lactose, glúten, etc..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={foodIntolerances}
                onChange={(e) => setFoodIntolerances(e.target.value)}
              />
            </div>

            {/* Preferências */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Preferências Alimentares</Label>
              <textarea
                rows={2}
                placeholder="Alimentos que gosta e consome com frequência..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={foodPreferences}
                onChange={(e) => setFoodPreferences(e.target.value)}
              />
            </div>

            {/* Aversões */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Aversões Alimentares</Label>
              <textarea
                rows={2}
                placeholder="Alimentos que não gosta..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={foodDislikes}
                onChange={(e) => setFoodDislikes(e.target.value)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Seção 5: Observações do Profissional */}
        <AccordionItem value="observations" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-bold hover:no-underline">
            Observações Profissionais
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-4">
            {/* Observações Clínicas */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Observações Clínicas</Label>
              <textarea
                rows={3}
                placeholder="Impressões sobre o quadro clínico do paciente..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={clinicalObservations}
                onChange={(e) => setClinicalObservations(e.target.value)}
              />
            </div>

            {/* Notas Profissionais */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Notas do Profissional</Label>
              <textarea
                rows={3}
                placeholder="Anotações sobre a conduta, estratégias, etc..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                value={professionalNotes}
                onChange={(e) => setProfessionalNotes(e.target.value)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
