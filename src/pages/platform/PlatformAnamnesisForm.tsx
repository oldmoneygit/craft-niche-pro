import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Loader2, User, Heart, Apple, Activity, Target, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useTenantId } from '@/hooks/useTenantId';

interface AnamnesisData {
  // Dados Pessoais
  occupation: string;
  marital_status: string;
  household_size: number;
  
  // Histórico Clínico
  current_medications: string;
  medical_conditions: string;
  allergies: string;
  food_intolerances: string;
  family_history: string;
  
  // Antropometria
  current_weight: number;
  height: number;
  target_weight: number;
  waist_circumference: number;
  hip_circumference: number;
  
  // Hábitos Alimentares
  meals_per_day: number;
  water_intake_liters: number;
  alcohol_consumption: string;
  smoking: string;
  
  // Preferências
  food_preferences: string;
  food_dislikes: string;
  dietary_restrictions: string;
  eating_out_frequency: string;
  
  // Estilo de Vida
  physical_activity: string;
  sleep_hours: number;
  stress_level: string;
  
  // Objetivos
  main_goal: string;
  motivation: string;
  previous_diets: string;
  
  // Observações
  clinical_observations: string;
  professional_notes: string;
}

export default function PlatformAnamnesisForm() {
  const navigate = useNavigate();
  const { anamnesisId } = useParams();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');
  const { tenantId, loading: loadingTenant } = useTenantId();

  const [clientName, setClientName] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  const [formData, setFormData] = useState<AnamnesisData>({
    occupation: '',
    marital_status: 'single',
    household_size: 1,
    current_medications: '',
    medical_conditions: '',
    allergies: '',
    food_intolerances: '',
    family_history: '',
    current_weight: 0,
    height: 0,
    target_weight: 0,
    waist_circumference: 0,
    hip_circumference: 0,
    meals_per_day: 3,
    water_intake_liters: 2,
    alcohol_consumption: 'none',
    smoking: 'never',
    food_preferences: '',
    food_dislikes: '',
    dietary_restrictions: '',
    eating_out_frequency: 'sometimes',
    physical_activity: 'moderate',
    sleep_hours: 8,
    stress_level: 'moderate',
    main_goal: '',
    motivation: '',
    previous_diets: '',
    clinical_observations: '',
    professional_notes: ''
  });

  useEffect(() => {
    if (clientId && tenantId) {
      loadClient();
    }
  }, [clientId, tenantId]);

  useEffect(() => {
    if (anamnesisId && tenantId) {
      loadAnamnesis();
    }
  }, [anamnesisId, tenantId]);

  const loadClient = async () => {
    if (!clientId || !tenantId) return;

    const { data, error } = await supabase
      .from('clients')
      .select('name, height, weight_current, height_cm, weight_kg')
      .eq('id', clientId)
      .eq('tenant_id', tenantId)
      .single();

    if (!error && data) {
      setClientName(data.name);
      
      // Preencher altura e peso do cadastro do cliente
      const height = data.height_cm || data.height || 0;
      const weight = data.weight_kg || data.weight_current || 0;
      
      if (height) {
        setFormData(prev => ({ ...prev, height }));
      }
      if (weight) {
        setFormData(prev => ({ ...prev, current_weight: weight }));
      }
    }
  };

  const loadAnamnesis = async () => {
    if (!anamnesisId || !tenantId) return;

    const { data, error } = await supabase
      .from('anamneses' as any)
      .select('*')
      .eq('id', anamnesisId)
      .eq('tenant_id', tenantId)
      .single();

    if (!error && data) {
      setFormData(data as any);
    }
  };

  const handleInputChange = (field: keyof AnamnesisData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!clientId || !tenantId) {
      toast.error('Cliente não identificado');
      return;
    }

    if (!formData.main_goal.trim()) {
      toast.error('Objetivo principal é obrigatório');
      setActiveTab('goals');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        tenant_id: tenantId,
        client_id: clientId,
        ...formData,
        anamnesis_date: new Date().toISOString().split('T')[0]
      };

      if (anamnesisId) {
        // Atualizar
        const { error } = await supabase
          .from('anamneses' as any)
          .update(dataToSave)
          .eq('id', anamnesisId);

        if (error) throw error;
        toast.success('Anamnese atualizada com sucesso!');
      } else {
        // Criar
        const { error } = await supabase
          .from('anamneses' as any)
          .insert(dataToSave);

        if (error) throw error;
        toast.success('Anamnese criada com sucesso!');
      }

      navigate(`/platform/${tenantId}/clientes`);
    } catch (error: any) {
      console.error('Erro ao salvar anamnese:', error);
      toast.error('Erro ao salvar: ' + (error.message || 'Desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  const calculateIMC = () => {
    if (formData.current_weight && formData.height) {
      const heightInMeters = formData.height / 100;
      return (formData.current_weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return '--';
  };

  if (loadingTenant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#18181b] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#18181b]">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/platform/${tenantId}/clientes`)}
              className="text-gray-100 hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">
                {anamnesisId ? 'Editar' : 'Nova'} Anamnese - {clientName}
              </h1>
              <p className="text-sm text-gray-400">
                Avaliação nutricional completa
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Anamnese
              </>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full mb-6 bg-gray-800">
            <TabsTrigger value="personal" className="text-xs">
              <User className="h-4 w-4 mr-1" />
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger value="clinical" className="text-xs">
              <Heart className="h-4 w-4 mr-1" />
              Clínico
            </TabsTrigger>
            <TabsTrigger value="habits" className="text-xs">
              <Apple className="h-4 w-4 mr-1" />
              Hábitos
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="text-xs">
              <Activity className="h-4 w-4 mr-1" />
              Estilo de Vida
            </TabsTrigger>
            <TabsTrigger value="goals" className="text-xs">
              <Target className="h-4 w-4 mr-1" />
              Objetivos
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">
              <FileText className="h-4 w-4 mr-1" />
              Observações
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DADOS PESSOAIS */}
          <TabsContent value="personal">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Dados Pessoais e Antropometria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Profissão/Ocupação</Label>
                    <Input
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-gray-100"
                      placeholder="Ex: Professor, Estudante, etc"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Estado Civil</Label>
                    <Select
                      value={formData.marital_status}
                      onValueChange={(value) => handleInputChange('marital_status', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="single">Solteiro(a)</SelectItem>
                        <SelectItem value="married">Casado(a)</SelectItem>
                        <SelectItem value="divorced">Divorciado(a)</SelectItem>
                        <SelectItem value="widowed">Viúvo(a)</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Número de pessoas na residência</Label>
                  <Input
                    type="number"
                    value={formData.household_size}
                    onChange={(e) => handleInputChange('household_size', parseInt(e.target.value) || 1)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    min="1"
                  />
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">Antropometria</h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-gray-300">Peso Atual (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.current_weight || ''}
                        onChange={(e) => handleInputChange('current_weight', parseFloat(e.target.value) || 0)}
                        className="bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Altura (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.height || ''}
                        onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                        className="bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Peso Meta (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.target_weight || ''}
                        onChange={(e) => handleInputChange('target_weight', parseFloat(e.target.value) || 0)}
                        className="bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-300">Circunferência da Cintura (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.waist_circumference || ''}
                        onChange={(e) => handleInputChange('waist_circumference', parseFloat(e.target.value) || 0)}
                        className="bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Circunferência do Quadril (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.hip_circumference || ''}
                        onChange={(e) => handleInputChange('hip_circumference', parseFloat(e.target.value) || 0)}
                        className="bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <Label className="text-gray-300 mb-2">IMC Calculado</Label>
                      <div className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-center">
                        <span className="text-2xl font-bold text-green-400">{calculateIMC()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: HISTÓRICO CLÍNICO */}
          <TabsContent value="clinical">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Histórico Clínico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Medicamentos em Uso</Label>
                  <Textarea
                    value={formData.current_medications}
                    onChange={(e) => handleInputChange('current_medications', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={3}
                    placeholder="Liste os medicamentos que o cliente está tomando atualmente"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Condições Médicas / Patologias</Label>
                  <Textarea
                    value={formData.medical_conditions}
                    onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={3}
                    placeholder="Diabetes, hipertensão, doenças tireoidianas, etc"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Alergias</Label>
                  <Textarea
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={2}
                    placeholder="Alergias alimentares ou a medicamentos"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Intolerâncias Alimentares</Label>
                  <Textarea
                    value={formData.food_intolerances}
                    onChange={(e) => handleInputChange('food_intolerances', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={2}
                    placeholder="Lactose, glúten, etc"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Histórico Familiar</Label>
                  <Textarea
                    value={formData.family_history}
                    onChange={(e) => handleInputChange('family_history', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={3}
                    placeholder="Doenças presentes na família (diabetes, obesidade, doenças cardíacas, etc)"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: HÁBITOS ALIMENTARES */}
          <TabsContent value="habits">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Hábitos Alimentares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Número de Refeições/Dia</Label>
                    <Input
                      type="number"
                      value={formData.meals_per_day}
                      onChange={(e) => handleInputChange('meals_per_day', parseInt(e.target.value) || 3)}
                      className="bg-gray-700 border-gray-600 text-gray-100"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Consumo de Água (Litros/Dia)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.water_intake_liters}
                      onChange={(e) => handleInputChange('water_intake_liters', parseFloat(e.target.value) || 2)}
                      className="bg-gray-700 border-gray-600 text-gray-100"
                      min="0"
                      max="10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Consumo de Álcool</Label>
                    <Select
                      value={formData.alcohol_consumption}
                      onValueChange={(value) => handleInputChange('alcohol_consumption', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="none">Não consome</SelectItem>
                        <SelectItem value="occasional">Ocasional (eventos)</SelectItem>
                        <SelectItem value="moderate">Moderado (1-2x/semana)</SelectItem>
                        <SelectItem value="frequent">Frequente (3+x/semana)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Tabagismo</Label>
                    <Select
                      value={formData.smoking}
                      onValueChange={(value) => handleInputChange('smoking', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="never">Nunca fumou</SelectItem>
                        <SelectItem value="former">Ex-fumante</SelectItem>
                        <SelectItem value="current">Fumante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Frequência de Refeições Fora de Casa</Label>
                  <Select
                    value={formData.eating_out_frequency}
                    onValueChange={(value) => handleInputChange('eating_out_frequency', value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="never">Nunca</SelectItem>
                      <SelectItem value="rarely">Raramente (1x/mês)</SelectItem>
                      <SelectItem value="sometimes">Às vezes (1x/semana)</SelectItem>
                      <SelectItem value="often">Frequentemente (3+x/semana)</SelectItem>
                      <SelectItem value="daily">Diariamente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Alimentos Preferidos</Label>
                  <Textarea
                    value={formData.food_preferences}
                    onChange={(e) => handleInputChange('food_preferences', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={3}
                    placeholder="Quais alimentos o cliente mais gosta?"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Alimentos que Não Gosta / Evita</Label>
                  <Textarea
                    value={formData.food_dislikes}
                    onChange={(e) => handleInputChange('food_dislikes', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={3}
                    placeholder="Quais alimentos o cliente não gosta ou evita?"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Restrições Alimentares</Label>
                  <Textarea
                    value={formData.dietary_restrictions}
                    onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={2}
                    placeholder="Vegetariano, vegano, sem glúten, etc"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: ESTILO DE VIDA */}
          <TabsContent value="lifestyle">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Estilo de Vida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Nível de Atividade Física</Label>
                  <Select
                    value={formData.physical_activity}
                    onValueChange={(value) => handleInputChange('physical_activity', value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="sedentary">Sedentário (sem exercício)</SelectItem>
                      <SelectItem value="light">Leve (1-2x/semana)</SelectItem>
                      <SelectItem value="moderate">Moderado (3-4x/semana)</SelectItem>
                      <SelectItem value="intense">Intenso (5-6x/semana)</SelectItem>
                      <SelectItem value="very_intense">Muito Intenso (diário, atleta)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Horas de Sono/Noite</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.sleep_hours}
                      onChange={(e) => handleInputChange('sleep_hours', parseFloat(e.target.value) || 8)}
                      className="bg-gray-700 border-gray-600 text-gray-100"
                      min="0"
                      max="24"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Nível de Estresse</Label>
                    <Select
                      value={formData.stress_level}
                      onValueChange={(value) => handleInputChange('stress_level', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="moderate">Moderado</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="very_high">Muito Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: OBJETIVOS */}
          <TabsContent value="goals">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Objetivos e Motivação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Objetivo Principal *</Label>
                  <Textarea
                    value={formData.main_goal}
                    onChange={(e) => handleInputChange('main_goal', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={3}
                    placeholder="Ex: Emagrecimento, ganho de massa muscular, controle de diabetes, etc"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">* Campo obrigatório</p>
                </div>

                <div>
                  <Label className="text-gray-300">Motivação / Por que busca atendimento?</Label>
                  <Textarea
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={4}
                    placeholder="O que motivou o cliente a procurar acompanhamento nutricional?"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Dietas Anteriores</Label>
                  <Textarea
                    value={formData.previous_diets}
                    onChange={(e) => handleInputChange('previous_diets', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={3}
                    placeholder="Já fez outras dietas? Quais? Resultados obtidos?"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: OBSERVAÇÕES */}
          <TabsContent value="notes">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Observações Clínicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Observações Clínicas Gerais</Label>
                  <Textarea
                    value={formData.clinical_observations}
                    onChange={(e) => handleInputChange('clinical_observations', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={5}
                    placeholder="Observações visíveis ao cliente (aparência física, sintomas relatados, etc)"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Anotações Profissionais (Privadas)</Label>
                  <Textarea
                    value={formData.professional_notes}
                    onChange={(e) => handleInputChange('professional_notes', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={5}
                    placeholder="Observações privadas do nutricionista (não visíveis ao cliente)"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    ℹ️ Estas anotações são privadas e não aparecem em relatórios compartilhados
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
