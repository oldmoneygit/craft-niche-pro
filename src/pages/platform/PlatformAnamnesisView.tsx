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

  const printStyles = `
    @media print {
      body { background: white !important; }
      .print\\:hidden { display: none !important; }
      
      .print-header {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        color: white !important;
        padding: 24px !important;
        border-radius: 12px !important;
        margin-bottom: 24px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print-card {
        background: white !important;
        border: 2px solid #e5e7eb !important;
        border-left: 6px solid #10b981 !important;
        border-radius: 8px !important;
        padding: 20px !important;
        margin-bottom: 20px !important;
        page-break-inside: avoid !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print-section-title {
        color: #059669 !important;
        font-size: 18px !important;
        font-weight: 700 !important;
        margin-bottom: 16px !important;
        padding-bottom: 8px !important;
        border-bottom: 3px solid #10b981 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print-label {
        color: #6b7280 !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }
      
      .print-value {
        color: #111827 !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        margin-top: 4px !important;
      }
      
      .print-imc-box {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        color: white !important;
        padding: 16px !important;
        border-radius: 8px !important;
        text-align: center !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print-imc-value {
        font-size: 32px !important;
        font-weight: 700 !important;
        color: white !important;
      }
      
      .print-imc-label {
        font-size: 12px !important;
        color: rgba(255, 255, 255, 0.9) !important;
      }
      
      .print-data-grid {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 16px !important;
      }
      
      .print-main-goal {
        background: #fef3c7 !important;
        border-left: 6px solid #f59e0b !important;
        padding: 16px !important;
        border-radius: 8px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print-main-goal-value {
        color: #92400e !important;
        font-size: 16px !important;
        font-weight: 700 !important;
      }
      
      .print-anthro-item {
        background: #f0fdf4 !important;
        border: 1px solid #86efac !important;
        padding: 12px !important;
        border-radius: 6px !important;
        text-align: center !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print-anthro-value {
        color: #065f46 !important;
        font-size: 20px !important;
        font-weight: 700 !important;
      }
      
      .print-divider {
        height: 3px !important;
        background: linear-gradient(90deg, #10b981 0%, transparent 100%) !important;
        margin: 20px 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print-footer {
        margin-top: 32px !important;
        padding-top: 16px !important;
        border-top: 2px solid #e5e7eb !important;
        text-align: center !important;
        color: #6b7280 !important;
        font-size: 11px !important;
      }
    }
  `;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <style>{printStyles}</style>
      
      {/* Header de impressão */}
      <div className="hidden print:block print-header">
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          Anamnese Nutricional
        </h1>
        <p style={{ fontSize: '14px', opacity: 0.9 }}>
          Paciente: {clientName}
        </p>
        <p style={{ fontSize: '12px', opacity: 0.8 }}>
          Data: {format(new Date(anamnesis.anamnesis_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

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
          <Card className="print-card">
            <CardHeader>
              <CardTitle className="print-section-title">Dados Pessoais e Antropometria</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm print-data-grid">
              <DataField label="Profissão" value={anamnesis.occupation} />
              <DataField label="Estado Civil" value={translateMaritalStatus(anamnesis.marital_status)} />
              <DataField label="Pessoas na Residência" value={anamnesis.household_size} />
              
              <div className="col-span-2 border-t border-border pt-4 mt-4">
                <div className="print-divider"></div>
                <h4 className="font-semibold text-foreground mb-3 print-label" style={{ fontSize: '14px', marginTop: '20px' }}>Antropometria</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="print-anthro-item">
                    <span className="text-muted-foreground print-label">Peso Atual</span>
                    <p className="text-foreground font-semibold print-anthro-value">{anamnesis.current_weight || '--'} kg</p>
                  </div>
                  <div className="print-anthro-item">
                    <span className="text-muted-foreground print-label">Altura</span>
                    <p className="text-foreground font-semibold print-anthro-value">{anamnesis.height || '--'} cm</p>
                  </div>
                  <div className="print-anthro-item">
                    <span className="text-muted-foreground print-label">Peso Meta</span>
                    <p className="text-foreground font-semibold print-anthro-value">{anamnesis.target_weight || '--'} kg</p>
                  </div>
                  <div className="print-imc-box">
                    <span className="text-muted-foreground print-imc-label">IMC</span>
                    <p className={`font-bold text-xl print-imc-value ${imcInfo?.color || 'text-foreground'}`}>
                      {calculateIMC()}
                    </p>
                    {imcInfo && <span className="text-xs block print-imc-label">{imcInfo.text}</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico Clínico */}
          <Card className="print-card">
            <CardHeader>
              <CardTitle className="print-section-title">Histórico Clínico</CardTitle>
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
          <Card className="print-card">
            <CardHeader>
              <CardTitle className="print-section-title">Hábitos Alimentares e Estilo de Vida</CardTitle>
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
          <Card className="print-card">
            <CardHeader>
              <CardTitle className="print-section-title">Objetivos e Motivação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="print-main-goal">
                <div className="print-label">Objetivo Principal</div>
                <div className="print-main-goal-value">{anamnesis.main_goal || '---'}</div>
              </div>
              <div className="print-divider"></div>
              <DataField label="Motivação" value={anamnesis.motivation} />
              <DataField label="Dietas Anteriores" value={anamnesis.previous_diets} />
            </CardContent>
          </Card>

          {/* Observações */}
          <Card className="print-card">
            <CardHeader>
              <CardTitle className="print-section-title">Observações Clínicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DataField label="Observações Clínicas" value={anamnesis.clinical_observations} />
              <DataField label="Anotações Profissionais (Privadas)" value={anamnesis.professional_notes} />
            </CardContent>
          </Card>

          {/* Footer de impressão */}
          <div className="hidden print:block print-footer">
            <p>Documento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            <p style={{ marginTop: '4px', fontSize: '10px' }}>
              Este documento contém informações confidenciais de caráter médico-nutricional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar
function DataField({ label, value, highlight = false }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div>
      <span className="text-muted-foreground text-xs print-label">{label}:</span>
      <p className={`print-value ${highlight ? 'text-green-600 font-semibold text-base' : 'text-foreground'}`}>
        {value || '---'}
      </p>
    </div>
  );
}
