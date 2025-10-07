import { Calendar, Clock, Flame, Utensils, Eye, Trash2, BarChart3 } from 'lucide-react';
import { Recordatorio } from '@/hooks/useRecordatorios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecordatorioCardProps {
  recordatorio: Recordatorio;
  onView: (id: string) => void;
  onAnalyze: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RecordatorioCard = ({ recordatorio, onView, onAnalyze, onDelete }: RecordatorioCardProps) => {
  const categoryClass = recordatorio.type === 'r24h' ? 'habitos' : 'recordatorio';
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`questionnaire-card ${categoryClass}`}>
      {/* HEADER */}
      <div className="questionnaire-header">
        <span className="category-badge">
          {recordatorio.type === 'r24h' ? 'R24h' : 'R3D'}
        </span>
        <span className={`status-badge ${recordatorio.status === 'analyzed' ? 'active' : 'inactive'}`}>
          <span className="status-dot"></span>
          {recordatorio.status === 'analyzed' ? 'Analisado' : 'Pendente'}
        </span>
      </div>

      {/* TÍTULO E DESCRIÇÃO */}
      <h3 className="questionnaire-title">{recordatorio.patient_name}</h3>
      <p className="questionnaire-description">
        {recordatorio.type === 'r24h' 
          ? 'Recordatório de 24 horas' 
          : 'Recordatório de 3 dias'}
        {recordatorio.analyzed_at && ` • Analisado em ${formatDate(recordatorio.analyzed_at)}`}
      </p>

      {/* MÉTRICAS */}
      <div className="questionnaire-meta">
        <div className="meta-item">
          <Utensils className="meta-icon" size={16} />
          <span>
            <span className="meta-value">{recordatorio.meals_count || 0}</span> refeições
          </span>
        </div>
        <div className="meta-item">
          <Calendar className="meta-icon" size={16} />
          <span className="meta-value">{formatDate(recordatorio.record_date)}</span>
        </div>
        
        {recordatorio.status === 'analyzed' && recordatorio.total_calories && (
          <>
            <div className="meta-item">
              <Flame className="meta-icon" size={16} />
              <span>
                <span className="meta-value">{recordatorio.total_calories}</span> kcal
              </span>
            </div>
            <div className="meta-item">
              <Clock className="meta-icon" size={16} />
              <span className="meta-value">
                P: {recordatorio.total_protein?.toFixed(1)}g | 
                C: {recordatorio.total_carbs?.toFixed(1)}g | 
                G: {recordatorio.total_fat?.toFixed(1)}g
              </span>
            </div>
          </>
        )}
      </div>

      {/* AÇÕES */}
      <div className="questionnaire-actions">
        <button 
          className="action-btn"
          onClick={() => onView(recordatorio.id)}
        >
          <Eye size={16} />
          Visualizar
        </button>
        <button 
          className="action-btn"
          onClick={() => onAnalyze(recordatorio.id)}
        >
          <BarChart3 size={16} />
          {recordatorio.status === 'analyzed' ? 'Reanalisar' : 'Analisar'}
        </button>
        <button 
          className="action-btn danger"
          onClick={() => onDelete(recordatorio.id)}
        >
          <Trash2 size={16} />
          Excluir
        </button>
      </div>
    </div>
  );
};
