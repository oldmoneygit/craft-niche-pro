import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Printer, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTenantId } from '@/hooks/useTenantId';

export default function PlatformAnamnesisView() {
  const navigate = useNavigate();
  const { anamnesisId } = useParams();
  const { tenantId, loading: loadingTenant } = useTenantId();
  const [anamnesis, setAnamnesis] = useState<any>(null);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(true);

  // Funções de tradução
  const translateMaritalStatus = (status: string) => {
    const translations: Record<string, string> = {
      'single': 'Solteiro(a)',
      'married': 'Casado(a)',
      'divorced': 'Divorciado(a)',
      'widowed': 'Viúvo(a)',
      'other': 'Outro'
    };
    return translations[status] || status;
  };

  const translateAlcohol = (level: string) => {
    const translations: Record<string, string> = {
      'none': 'Não consome',
      'occasional': 'Ocasional (eventos)',
      'moderate': 'Moderado (1-2x/semana)',
      'frequent': 'Frequente (3+x/semana)'
    };
    return translations[level] || level;
  };

  const translateSmoking = (status: string) => {
    const translations: Record<string, string> = {
      'never': 'Nunca fumou',
      'former': 'Ex-fumante',
      'current': 'Fumante'
    };
    return translations[status] || status;
  };

  const translateActivity = (level: string) => {
    const translations: Record<string, string> = {
      'sedentary': 'Sedentário (sem exercício)',
      'light': 'Leve (1-2x/semana)',
      'moderate': 'Moderado (3-4x/semana)',
      'intense': 'Intenso (5-6x/semana)',
      'very_intense': 'Muito Intenso (diário, atleta)'
    };
    return translations[level] || level;
  };

  const translateStress = (level: string) => {
    const translations: Record<string, string> = {
      'low': 'Baixo',
      'moderate': 'Moderado',
      'high': 'Alto',
      'very_high': 'Muito Alto'
    };
    return translations[level] || level;
  };

  const translateEatingOut = (frequency: string) => {
    const translations: Record<string, string> = {
      'never': 'Nunca',
      'rarely': 'Raramente (1x/mês)',
      'sometimes': 'Às vezes (1x/semana)',
      'often': 'Frequentemente (3+x/semana)',
      'daily': 'Diariamente'
    };
    return translations[frequency] || frequency;
  };

  useEffect(() => {
    if (anamnesisId && tenantId) {
      loadAnamnesis();
    }
  }, [anamnesisId, tenantId]);

  const loadAnamnesis = async () => {
    try {
      const { data, error } = await supabase
        .from('anamneses' as any)
        .select(`
          *,
          clients (name)
        `)
        .eq('id', anamnesisId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw error;
      setAnamnesis(data);
      setClientName((data as any).clients?.name || '');
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateIMC = () => {
    if (!anamnesis?.current_weight || !anamnesis?.height) return '--';
    const heightInMeters = anamnesis.height / 100;
    return (anamnesis.current_weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getIMCClassification = (imc: number) => {
    if (imc < 18.5) return { text: 'Abaixo do peso', color: 'text-yellow-400' };
    if (imc < 25) return { text: 'Peso normal', color: 'text-green-400' };
    if (imc < 30) return { text: 'Sobrepeso', color: 'text-orange-400' };
    return { text: 'Obesidade', color: 'text-red-400' };
  };

  const handlePrint = () => {
    window.print();
  };

  if (loadingTenant || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!anamnesis) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <p className="text-muted-foreground">Anamnese não encontrada</p>
      </div>
    );
  }

  const imc = parseFloat(calculateIMC());
  const imcInfo = !isNaN(imc) ? getIMCClassification(imc) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Anamnese - {clientName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {format(new Date(anamnesis.anamnesis_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button
              onClick={() => navigate(`/platform/${tenantId}/anamnese/${anamnesisId}`)}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais e Antropometria</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <DataField label="Profissão" value={anamnesis.occupation} />
              <DataField label="Estado Civil" value={translateMaritalStatus(anamnesis.marital_status)} />
              <DataField label="Pessoas na Residência" value={anamnesis.household_size} />
              
              <div className="col-span-2 border-t border-border pt-4 mt-4">
                <h4 className="font-semibold text-foreground mb-3">Antropometria</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <span className="text-muted-foreground">Peso Atual:</span>
                    <p className="text-foreground font-semibold">{anamnesis.current_weight || '--'} kg</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Altura:</span>
                    <p className="text-foreground font-semibold">{anamnesis.height || '--'} cm</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peso Meta:</span>
                    <p className="text-foreground font-semibold">{anamnesis.target_weight || '--'} kg</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IMC:</span>
                    <p className={`font-bold text-xl ${imcInfo?.color || 'text-foreground'}`}>
                      {calculateIMC()}
                      {imcInfo && <span className="text-xs block">{imcInfo.text}</span>}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico Clínico */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico Clínico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DataField label="Medicamentos" value={anamnesis.current_medications} />
              <DataField label="Condições Médicas" value={anamnesis.medical_conditions} />
              <DataField label="Alergias" value={anamnesis.allergies} />
              <DataField label="Intolerâncias" value={anamnesis.food_intolerances} />
              <DataField label="Histórico Familiar" value={anamnesis.family_history} />
            </CardContent>
          </Card>

          {/* Hábitos Alimentares */}
          <Card>
            <CardHeader>
              <CardTitle>Hábitos Alimentares e Estilo de Vida</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <DataField label="Refeições/Dia" value={anamnesis.meals_per_day} />
              <DataField label="Água (L/dia)" value={anamnesis.water_intake_liters} />
              <DataField label="Álcool" value={translateAlcohol(anamnesis.alcohol_consumption)} />
              <DataField label="Tabagismo" value={translateSmoking(anamnesis.smoking)} />
              <DataField label="Atividade Física" value={translateActivity(anamnesis.physical_activity)} />
              <DataField label="Horas de Sono" value={anamnesis.sleep_hours} />
              <DataField label="Estresse" value={translateStress(anamnesis.stress_level)} />
              <DataField label="Come Fora" value={translateEatingOut(anamnesis.eating_out_frequency)} />
              <div className="col-span-2">
                <DataField label="Preferências Alimentares" value={anamnesis.food_preferences} />
              </div>
              <div className="col-span-2">
                <DataField label="Alimentos que Evita" value={anamnesis.food_dislikes} />
              </div>
              <div className="col-span-2">
                <DataField label="Restrições Alimentares" value={anamnesis.dietary_restrictions} />
              </div>
            </CardContent>
          </Card>

          {/* Objetivos */}
          <Card>
            <CardHeader>
              <CardTitle>Objetivos e Motivação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DataField label="Objetivo Principal" value={anamnesis.main_goal} highlight />
              <DataField label="Motivação" value={anamnesis.motivation} />
              <DataField label="Dietas Anteriores" value={anamnesis.previous_diets} />
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações Clínicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DataField label="Observações Clínicas" value={anamnesis.clinical_observations} />
              <DataField label="Anotações Profissionais (Privadas)" value={anamnesis.professional_notes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar
function DataField({ label, value, highlight = false }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div>
      <span className="text-muted-foreground text-xs">{label}:</span>
      <p className={`${highlight ? 'text-green-600 font-semibold text-base' : 'text-foreground'}`}>
        {value || '---'}
      </p>
    </div>
  );
}
