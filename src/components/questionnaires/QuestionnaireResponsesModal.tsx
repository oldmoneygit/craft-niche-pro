import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, Mail, Phone, Calendar, CheckCircle, Eye, X, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ResponseData {
  id: string;
  respondent_name: string;
  respondent_email: string | null;
  respondent_phone: string;
  completed_at: string;
  score: number | null;
  answers: any;
  client_id: string | null;
}

interface QuestionnaireResponsesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaireId: string;
  questionnaireTitle: string;
  questions: any[];
}

export function QuestionnaireResponsesModal({
  open,
  onOpenChange,
  questionnaireId,
  questionnaireTitle,
  questions
}: QuestionnaireResponsesModalProps) {
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<ResponseData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<ResponseData | null>(null);

  useEffect(() => {
    if (open && questionnaireId) {
      fetchResponses();
    }
  }, [open, questionnaireId]);

  useEffect(() => {
    filterResponses();
  }, [searchTerm, responses]);

  const calculateScore = (answers: Record<string, any>, questions: any[]): number => {
    console.log('=== CALCULATE SCORE DEBUG ===');
    console.log('Questions received:', questions);
    console.log('Answers received:', answers);
    
    let totalScore = 0;
    let maxPossibleScore = 0;

    questions.forEach(question => {
      console.log('\n--- Question:', question.id);
      console.log('Scorable:', question.scorable);
      console.log('Question type:', question.question_type);
      console.log('Option scores:', question.option_scores);
      
      if (!question.scorable) {
        console.log('Skipping - not scorable');
        return;
      }

      const answer = answers?.[question.id];
      console.log('Answer:', answer);
      
      const weight = question.weight || 1;
      let questionScore = 0;
      let maxQuestionScore = 0;

      // Encontrar score máximo possível para esta pergunta
      if (question.option_scores && Object.keys(question.option_scores).length > 0) {
        const scores = Object.values(question.option_scores) as number[];
        maxQuestionScore = Math.max(...scores);
        console.log('Max score from options:', maxQuestionScore);
      } else if (question.question_type === 'scale') {
        maxQuestionScore = 10;
        console.log('Scale question - max score: 10');
      }

      // Calcular score da resposta
      if (['single_select', 'single_choice', 'radio'].includes(question.question_type) && answer) {
        questionScore = question.option_scores?.[answer] || 0;
        console.log('Single choice score:', questionScore);
      } 
      else if (['multi_select', 'multiple_choice', 'checkbox'].includes(question.question_type) && Array.isArray(answer)) {
        const scores = answer.map((opt: string) => question.option_scores?.[opt] || 0);
        questionScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
        console.log('Multi choice score:', questionScore);
      }
      else if (question.question_type === 'scale') {
        questionScore = answer; // Scale já é 1-10
        maxQuestionScore = 10;
        console.log('Scale score:', questionScore);
      }

      console.log('Weight:', weight, 'Question score:', questionScore, 'Max:', maxQuestionScore);
      totalScore += questionScore * weight;
      maxPossibleScore += maxQuestionScore * weight;
      console.log('Running totals - score:', totalScore, 'max:', maxPossibleScore);
    });

    const finalScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
    console.log('\n=== FINAL SCORE:', finalScore, '% ===');
    console.log('Total score:', totalScore, 'Max possible:', maxPossibleScore);
    return finalScore;
  };

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('questionnaire_id', questionnaireId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      
      // Recalcular score para respostas que não têm ou têm score zerado
      const responsesWithScore = (data || []).map(response => {
        if (response.score === null || response.score === 0) {
          const calculatedScore = calculateScore(response.answers as Record<string, any>, questions);
          return {
            ...response,
            score: calculatedScore
          };
        }
        return response;
      });
      
      setResponses(responsesWithScore);
      setFilteredResponses(responsesWithScore);
    } catch (error) {
      console.error('Erro ao buscar respostas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResponses = () => {
    if (!searchTerm.trim()) {
      setFilteredResponses(responses);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = responses.filter(response => 
      response.respondent_name?.toLowerCase().includes(term) ||
      response.respondent_email?.toLowerCase().includes(term) ||
      response.respondent_phone?.includes(term)
    );
    setFilteredResponses(filtered);
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getAnswerDisplay = (question: any, answer: any) => {
    if (!answer) return { text: 'Não respondido', score: null };
    
    // Para perguntas de escala (1-10)
    if (question.question_type === 'scale') {
      const score = answer;
      return { text: answer.toString(), score: score };
    }
    
    // Para respostas múltiplas (array)
    if (Array.isArray(answer)) {
      if (answer.length === 0) return { text: 'Não respondido', score: null };
      
      const scores = answer.map((opt: string) => question.option_scores?.[opt] || null).filter(s => s !== null);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length * 10) / 10 : null;
      
      return { 
        text: answer.join(', '), 
        score: avgScore 
      };
    }
    
    // Para resposta única
    const score = question.option_scores?.[answer] || null;
    return { 
      text: answer.toString(), 
      score: score 
    };
  };

  if (selectedResponse) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Respostas do Cliente
                </DialogTitle>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{selectedResponse.respondent_name}</span>
                  </div>
                  {selectedResponse.respondent_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>{selectedResponse.respondent_email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{formatPhone(selectedResponse.respondent_phone)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(selectedResponse.completed_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  {selectedResponse.score !== null && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Pontuação: {selectedResponse.score}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedResponse(null)}
                className="ml-4"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {questions.map((question, index) => {
                const answer = selectedResponse.answers?.[question.id];
                const answerDisplay = getAnswerDisplay(question, answer);
                
                return (
                  <div 
                    key={question.id}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-semibold text-gray-900 dark:text-white text-base flex-1">
                            {question.question_text}
                          </p>
                          {question.scorable && answerDisplay.score !== null && (
                            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {answerDisplay.score} pts
                            </div>
                          )}
                        </div>
                        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {answerDisplay.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="p-6 pt-4 border-t">
            <Button
              onClick={() => setSelectedResponse(null)}
              variant="outline"
              className="w-full"
            >
              Voltar para Lista
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Respostas - {questionnaireTitle}
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {filteredResponses.length} {filteredResponses.length === 1 ? 'resposta' : 'respostas'}
          </p>
        </DialogHeader>

        <div className="p-6 pt-4">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* List of Responses */}
          <ScrollArea className="h-[450px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Carregando respostas...</p>
                </div>
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {searchTerm 
                    ? 'Nenhuma resposta encontrada com esse termo de busca'
                    : 'Nenhuma resposta ainda'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredResponses.map((response) => (
                  <div
                    key={response.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer group"
                    onClick={() => setSelectedResponse(response)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-500" />
                          <span className="font-semibold text-gray-900 dark:text-white text-base">
                            {response.respondent_name}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {response.respondent_email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5" />
                              <span>{response.respondent_email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{formatPhone(response.respondent_phone)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {format(new Date(response.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </div>

                        {response.score !== null && (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              Pontuação: {response.score}%
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Respostas
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
