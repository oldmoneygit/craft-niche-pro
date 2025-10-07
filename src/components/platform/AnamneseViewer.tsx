import { X, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface AnamneseViewerProps {
  anamnese: any;
  clientName: string;
  onClose: () => void;
}

export const AnamneseViewer = ({ anamnese, clientName, onClose }: AnamneseViewerProps) => {
  const handlePrint = () => {
    window.print();
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'Não informado';
    return String(value);
  };

  const alcoholLabels: Record<string, string> = {
    'none': 'Não consome',
    'occasional': 'Ocasional',
    'moderate': 'Moderado',
    'frequent': 'Frequente'
  };

  const smokingLabels: Record<string, string> = {
    'never': 'Nunca fumou',
    'former': 'Ex-fumante',
    'current': 'Fumante'
  };

  const activityLabels: Record<string, string> = {
    'sedentary': 'Sedentário',
    'light': 'Leve',
    'moderate': 'Moderado',
    'intense': 'Intenso',
    'very_intense': 'Muito Intenso'
  };

  const eatingOutLabels: Record<string, string> = {
    'never': 'Nunca',
    'rarely': 'Raramente',
    'sometimes': 'Às vezes',
    'often': 'Frequentemente',
    'daily': 'Diariamente'
  };

  const stressLabels: Record<string, string> = {
    'low': 'Baixo',
    'moderate': 'Moderado',
    'high': 'Alto',
    'very_high': 'Muito Alto'
  };

  const calculateIMC = () => {
    if (anamnese.current_weight && anamnese.height) {
      const heightInMeters = anamnese.height / 100;
      const imc = anamnese.current_weight / (heightInMeters * heightInMeters);
      return imc.toFixed(1);
    }
    return null;
  };

  const getIMCClassification = (imc: number) => {
    if (imc < 18.5) return { label: 'Abaixo do peso', color: 'var(--secondary)' };
    if (imc < 25) return { label: 'Peso normal', color: 'var(--primary)' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'var(--warning)' };
    if (imc < 35) return { label: 'Obesidade Grau I', color: '#f97316' };
    if (imc < 40) return { label: 'Obesidade Grau II', color: 'var(--destructive)' };
    return { label: 'Obesidade Grau III', color: '#dc2626' };
  };

  const imc = calculateIMC();
  const imcClassification = imc ? getIMCClassification(parseFloat(imc)) : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-6 print:p-0"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl print:max-h-none print:rounded-none print:shadow-none"
        style={{
          background: 'white',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - não imprime */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Relatório de Anamnese</h2>
              <p className="text-sm text-gray-600">{clientName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir / PDF
            </Button>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Conteúdo que será impresso */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-88px)] print:max-h-none print:overflow-visible">
          {/* Cabeçalho de impressão - só aparece na impressão */}
          <div className="hidden print:block mb-8 text-center border-b-2 border-green-600 pb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatório de Anamnese Nutricional</h1>
            <p className="text-lg text-gray-700">{clientName}</p>
            <p className="text-sm text-gray-600 mt-1">
              Data: {format(new Date(anamnese.created_at), 'dd/MM/yyyy')}
            </p>
          </div>

          {/* Objetivo Principal */}
          <section className="mb-8 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
              Objetivos / Motivo da Consulta
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
              {formatValue(anamnese.main_goal)}
            </p>
          </section>

          {/* Dados Antropométricos */}
          <section className="mb-8 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
              Dados Antropométricos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DataCard label="Peso Atual" value={anamnese.current_weight ? `${anamnese.current_weight} kg` : 'Não informado'} />
              <DataCard label="Altura" value={anamnese.height ? `${anamnese.height} cm` : 'Não informado'} />
              <DataCard label="Peso Meta" value={anamnese.target_weight ? `${anamnese.target_weight} kg` : 'Não informado'} />
              <DataCard label="Cintura" value={anamnese.waist_circumference ? `${anamnese.waist_circumference} cm` : 'Não informado'} />
              <DataCard label="Quadril" value={anamnese.hip_circumference ? `${anamnese.hip_circumference} cm` : 'Não informado'} />
              {imc && (
                <DataCard 
                  label="IMC" 
                  value={`${imc} kg/m²`} 
                  badge={imcClassification?.label}
                  badgeColor={imcClassification?.color}
                />
              )}
            </div>
          </section>

          {/* Hábitos de Vida */}
          <section className="mb-8 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
              Hábitos de Vida
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <DataCard label="Restrições Alimentares" value={formatValue(anamnese.dietary_restrictions)} />
              <DataCard label="Consumo de Álcool" value={alcoholLabels[anamnese.alcohol_consumption] || formatValue(anamnese.alcohol_consumption)} />
              <DataCard label="Tabagismo" value={smokingLabels[anamnese.smoking] || formatValue(anamnese.smoking)} />
              <DataCard label="Horas de Sono" value={anamnese.sleep_hours ? `${anamnese.sleep_hours}h` : 'Não informado'} />
              <DataCard label="Atividade Física" value={activityLabels[anamnese.physical_activity] || formatValue(anamnese.physical_activity)} />
              <DataCard label="Refeições Fora" value={eatingOutLabels[anamnese.eating_out_frequency] || formatValue(anamnese.eating_out_frequency)} />
              <DataCard label="Pessoas na Residência" value={formatValue(anamnese.household_size)} />
              <DataCard label="Refeições por Dia" value={formatValue(anamnese.meals_per_day)} />
              <DataCard label="Nível de Estresse" value={stressLabels[anamnese.stress_level] || formatValue(anamnese.stress_level)} />
              <DataCard label="Ingestão de Água" value={anamnese.water_intake_liters ? `${anamnese.water_intake_liters}L/dia` : 'Não informado'} />
            </div>
          </section>

          {/* Condições de Saúde */}
          <section className="mb-8 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
              Condições de Saúde
            </h3>
            <div className="space-y-4">
              <InfoBlock label="Condições Médicas / Patologias" value={formatValue(anamnese.medical_conditions)} />
              <InfoBlock label="Medicamentos em Uso" value={formatValue(anamnese.current_medications)} />
              <InfoBlock label="Histórico Familiar" value={formatValue(anamnese.family_history)} />
            </div>
          </section>

          {/* Preferências Alimentares */}
          <section className="mb-8 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
              Preferências e Restrições Alimentares
            </h3>
            <div className="space-y-4">
              <InfoBlock label="Alergias Alimentares" value={formatValue(anamnese.allergies)} />
              <InfoBlock label="Intolerâncias Alimentares" value={formatValue(anamnese.food_intolerances)} />
              <InfoBlock label="Preferências Alimentares" value={formatValue(anamnese.food_preferences)} />
              <InfoBlock label="Aversões Alimentares" value={formatValue(anamnese.food_dislikes)} />
            </div>
          </section>

          {/* Observações */}
          {(anamnese.clinical_observations || anamnese.professional_notes) && (
            <section className="mb-8 print:break-inside-avoid">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
                Observações
              </h3>
              <div className="space-y-4">
                {anamnese.clinical_observations && (
                  <InfoBlock label="Observações Clínicas" value={formatValue(anamnese.clinical_observations)} />
                )}
                {anamnese.professional_notes && (
                  <InfoBlock label="Notas do Profissional" value={formatValue(anamnese.professional_notes)} />
                )}
              </div>
            </section>
          )}

          {/* Footer de impressão */}
          <div className="hidden print:block mt-12 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
            <p>Documento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 2cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

// Componentes auxiliares
const DataCard = ({ label, value, badge, badgeColor }: { label: string; value: string; badge?: string; badgeColor?: string }) => (
  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200 print:border-gray-300">
    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</p>
    <p className="text-base font-semibold text-gray-900">{value}</p>
    {badge && (
      <span 
        className="inline-block mt-2 px-2 py-1 rounded text-xs font-semibold"
        style={{ 
          backgroundColor: badgeColor ? `${badgeColor}20` : '#f3f4f6',
          color: badgeColor || 'var(--text-secondary)'
        }}
      >
        {badge}
      </span>
    )}
  </div>
);

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 print:border-gray-300">
    <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
    <p className="text-gray-900 whitespace-pre-wrap">{value}</p>
  </div>
);
