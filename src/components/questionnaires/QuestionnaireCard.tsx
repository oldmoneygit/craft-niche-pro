import { Eye, Edit, Send, Clock, HelpCircle, FileText, Power, Trash } from 'lucide-react';
import type { Questionnaire } from '@/hooks/useQuestionnaires';

interface QuestionnaireCardProps {
  questionnaire: Questionnaire & {
    response_count: number;
    completion_rate: number;
  };
  onView: () => void;
  onEdit: () => void;
  onSend: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

export function QuestionnaireCard({ 
  questionnaire, 
  onView, 
  onEdit, 
  onSend, 
  onToggleActive,
  onDelete
}: QuestionnaireCardProps) {
  const categoryColors = {
    anamnese: { badge: 'bg-blue-500', border: 'border-blue-500', icon: 'text-blue-500', bg: 'bg-blue-500' },
    habitos: { badge: 'bg-emerald-500', border: 'border-emerald-500', icon: 'text-emerald-500', bg: 'bg-emerald-500' },
    recordatorio: { badge: 'bg-amber-500', border: 'border-amber-500', icon: 'text-amber-500', bg: 'bg-amber-500' },
    satisfacao: { badge: 'bg-purple-500', border: 'border-purple-500', icon: 'text-purple-500', bg: 'bg-purple-500' },
    outro: { badge: 'bg-gray-500', border: 'border-gray-500', icon: 'text-gray-500', bg: 'bg-gray-500' },
  };
  
  const colors = categoryColors[questionnaire.category as keyof typeof categoryColors] || categoryColors.outro;

  return (
    <div className={`relative bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:${colors.border} group`}>
      {/* Borda lateral colorida */}
      <div className={`absolute left-0 top-0 bottom-0 w-0 ${colors.bg} transition-all duration-300 group-hover:w-1 rounded-l-2xl`} />
      
      {/* Header com badge e status */}
      <div className="flex justify-between items-start mb-4">
        <span className={`${colors.badge} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
          {questionnaire.category}
        </span>
        <div className="flex items-center gap-2">
          {questionnaire.is_active && (
            <span className="flex items-center gap-1 text-emerald-500 text-xs font-semibold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Ativo
            </span>
          )}
          <button
            onClick={onToggleActive}
            className={`p-1.5 rounded-lg transition-colors ${
              questionnaire.is_active
                ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                : 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20'
            }`}
            title={questionnaire.is_active ? 'Desativar' : 'Ativar'}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Título */}
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem]">
        {questionnaire.title}
      </h3>
      
      {/* Descrição */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
        {questionnaire.description || 'Sem descrição'}
      </p>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl">
        <div className="text-center">
          <div className={`flex items-center justify-center gap-1 text-sm ${colors.icon} mb-1`}>
            <HelpCircle className="w-4 h-4" />
            <span className="font-bold">{questionnaire.question_count}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">perguntas</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-sm text-gray-700 dark:text-gray-300 mb-1">
            <Clock className="w-4 h-4" />
            <span className="font-bold">~{questionnaire.estimated_time || 15} min</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">duração</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-sm text-gray-700 dark:text-gray-300 mb-1">
            <FileText className="w-4 h-4" />
            <span className="font-bold">{questionnaire.response_count}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">respostas</div>
        </div>
      </div>

      {/* Taxa de conclusão */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            Taxa de Conclusão
          </span>
          <span className={`text-sm font-bold ${colors.icon}`}>
            {questionnaire.completion_rate}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bg} transition-all duration-500`}
            style={{ width: `${questionnaire.completion_rate}%` }}
          />
        </div>
      </div>

      {/* Botões de ação */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onView}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
        >
          <Eye className="w-4 h-4" />
          Visualizar
        </button>
        
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
        
        <button
          onClick={onSend}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-purple-500/10 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
        >
          <Send className="w-4 h-4" />
          Enviar
        </button>

        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-red-500/10 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <Trash className="w-4 h-4" />
          Excluir
        </button>
      </div>
    </div>
  );
}