import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, CheckCircle, MessageSquare, TrendingUp, BookTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/shared/StatCard';
import { QuestionnaireCard } from '@/components/questionnaires/QuestionnaireCard';
import { QuestionnaireModal } from '@/components/questionnaires/QuestionnaireModal';
import { SendQuestionnaireModal } from '@/components/questionnaires/SendQuestionnaireModal';
import { MyTemplatesModal } from '@/components/questionnaires/MyTemplatesModal';
import { QuestionnaireViewModal } from '@/components/questionnaires/QuestionnaireViewModal';
import { QuestionnaireShareModal } from '@/components/questionnaires/QuestionnaireShareModal';
import { QuestionnaireResponsesModal } from '@/components/questionnaires/QuestionnaireResponsesModal';
import { useQuestionnaires, type Questionnaire } from '@/hooks/useQuestionnaires';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Questionarios() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [responsesModalOpen, setResponsesModalOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [selectedForSend, setSelectedForSend] = useState<{ id: string; title: string } | null>(null);
  const [selectedForShare, setSelectedForShare] = useState<{ id: string; title: string } | null>(null);
  const [selectedForResponses, setSelectedForResponses] = useState<{ id: string; title: string; questions: any[] } | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionnaireToDelete, setQuestionnaireToDelete] = useState<{ id: string; title: string } | null>(null);

  const { questionnaires, isLoading, toggleActive, deleteQuestionnaire } = useQuestionnaires();

  const categories = [
    { key: 'Todos', label: 'Todos' },
    { key: 'anamnese', label: 'Anamnese' },
    { key: 'habitos', label: 'Hábitos' },
    { key: 'recordatorio', label: 'Recordatório' },
    { key: 'satisfacao', label: 'Satisfação' },
  ];

  const filteredQuestionnaires = activeCategory === 'Todos'
    ? questionnaires
    : questionnaires.filter(q => q.category === activeCategory.toLowerCase());

  const stats = {
    total: questionnaires.length,
    active: questionnaires.filter(q => q.is_active).length,
    totalResponses: questionnaires.reduce((sum, q) => sum + (q.response_count || 0), 0),
    avgCompletion: questionnaires.length > 0
      ? Math.round(questionnaires.reduce((sum, q) => sum + (q.completion_rate || 0), 0) / questionnaires.length)
      : 0,
  };

  const handleView = (questionnaire: any) => {
    setSelectedQuestionnaire(questionnaire);
    setViewModalOpen(true);
  };

  const handleEdit = (questionnaire: any) => {
    navigate(`/questionarios/${questionnaire.id}/editar`);
  };

  const handleSend = (questionnaire: any) => {
    setSelectedForShare({ id: questionnaire.id, title: questionnaire.title });
    setShareModalOpen(true);
  };

  const handleToggleActive = async (questionnaire: any) => {
    await toggleActive.mutateAsync({
      id: questionnaire.id,
      is_active: !questionnaire.is_active,
    });
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedQuestionnaire(null);
  };

  const handleDelete = (questionnaire: any) => {
    setQuestionnaireToDelete({ id: questionnaire.id, title: questionnaire.title });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (questionnaireToDelete) {
      await deleteQuestionnaire.mutateAsync(questionnaireToDelete.id);
      setDeleteDialogOpen(false);
      setQuestionnaireToDelete(null);
    }
  };

  const handleViewResponses = async (questionnaire: any) => {
    // Buscar perguntas do questionário
    const { data: questions } = await supabase
      .from('questionnaire_questions')
      .select('*')
      .eq('questionnaire_id', questionnaire.id)
      .order('order_index', { ascending: true });

    setSelectedForResponses({
      id: questionnaire.id,
      title: questionnaire.title,
      questions: questions || []
    });
    setResponsesModalOpen(true);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Questionários
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie questionários e anamneses para seus pacientes
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setTemplatesModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2 px-6 py-3 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/60 hover:border-emerald-500 dark:hover:bg-emerald-900/30 dark:hover:border-emerald-500 rounded-xl font-semibold shadow-lg transition-all duration-300"
            >
              <BookTemplate className="w-5 h-5" />
              Meus Templates
            </Button>
            <Button
              onClick={() => navigate('/questionarios/novo')}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Novo Questionário
            </Button>
          </div>
        </div>

        {/* StatCards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="Total de Questionários"
            value={stats.total}
            variant="primary"
          />
          
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            label="Ativos"
            value={stats.active}
            variant="success"
          />
          
          <StatCard
            icon={<MessageSquare className="w-6 h-6" />}
            label="Respostas Coletadas"
            value={stats.totalResponses}
            variant="warning"
          />
          
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Taxa de Conclusão"
            value={`${stats.avgCompletion}%`}
            variant="purple"
          />
        </div>

        {/* Tabs de Categoria */}
        <div className="flex gap-2 mb-6 p-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                activeCategory === category.key
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-gray-200/70 hover:text-gray-800 dark:hover:bg-gray-700/70 dark:hover:text-gray-300'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Grid de Questionários */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Carregando questionários...</p>
          </div>
        ) : filteredQuestionnaires.length === 0 ? (
          <div className="text-center py-12 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {activeCategory === 'Todos' 
                ? 'Nenhum questionário criado ainda'
                : `Nenhum questionário na categoria "${activeCategory}"`
              }
            </p>
            <Button
              onClick={() => navigate('/questionarios/novo')}
              className="bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-600 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Questionário
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuestionnaires.map((questionnaire) => (
              <QuestionnaireCard
                key={questionnaire.id}
                questionnaire={questionnaire as any}
                onView={() => handleView(questionnaire)}
                onEdit={() => handleEdit(questionnaire)}
                onSend={() => handleSend(questionnaire)}
                onToggleActive={() => handleToggleActive(questionnaire)}
                onDelete={() => handleDelete(questionnaire)}
                onViewResponses={() => handleViewResponses(questionnaire)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      <QuestionnaireModal
        open={isCreateModalOpen}
        onOpenChange={handleCloseCreateModal}
        questionnaire={selectedQuestionnaire}
      />

      <SendQuestionnaireModal
        open={sendModalOpen}
        onOpenChange={setSendModalOpen}
        questionnaireId={selectedForSend?.id || null}
        questionnaireTitle={selectedForSend?.title}
      />

      <MyTemplatesModal
        open={templatesModalOpen}
        onOpenChange={setTemplatesModalOpen}
      />

      {selectedQuestionnaire && (
        <QuestionnaireViewModal
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          questionnaire={selectedQuestionnaire as any}
        />
      )}

      {selectedForShare && (
        <QuestionnaireShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          questionnaireId={selectedForShare.id}
          questionnaireTitle={selectedForShare.title}
        />
      )}

      {selectedForResponses && (
        <QuestionnaireResponsesModal
          open={responsesModalOpen}
          onOpenChange={setResponsesModalOpen}
          questionnaireId={selectedForResponses.id}
          questionnaireTitle={selectedForResponses.title}
          questions={selectedForResponses.questions}
        />
      )}

      {/* Alert Dialog de Confirmação */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Questionário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o questionário <strong>"{questionnaireToDelete?.title}"</strong>?
              <br /><br />
              Esta ação não pode ser desfeita e todas as perguntas relacionadas também serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}