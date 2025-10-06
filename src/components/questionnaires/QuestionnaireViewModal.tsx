import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock, HelpCircle, FileText } from "lucide-react";
import type { Questionnaire } from '@/hooks/useQuestionnaires';

interface QuestionnaireViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaire: Questionnaire & {
    response_count: number;
    completion_rate: number;
  };
}

export function QuestionnaireViewModal({ 
  open, 
  onOpenChange, 
  questionnaire 
}: QuestionnaireViewModalProps) {
  const categoryColors = {
    anamnese: 'bg-blue-500',
    habitos: 'bg-emerald-500',
    recordatorio: 'bg-amber-500',
    satisfacao: 'bg-purple-500',
    outro: 'bg-gray-500',
  };

  const color = categoryColors[questionnaire.category as keyof typeof categoryColors] || categoryColors.outro;
  const questions = questionnaire.questions as any[] || [];

  const getQuestionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      text: 'Resposta Curta',
      textarea: 'Resposta Longa',
      single_select: 'Escolha Única',
      radio: 'Escolha Única',
      multi_select: 'Múltipla Escolha',
      checkbox: 'Múltipla Escolha',
      number: 'Número',
      scale: 'Escala (1-10)',
    };
    return types[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{questionnaire.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mb-3">
                {questionnaire.description || 'Sem descrição'}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className={`${color} text-white`}>
                  {questionnaire.category}
                </Badge>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <HelpCircle className="w-4 h-4" />
                  <span className="font-medium">{questions.length}</span> perguntas
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">~{questionnaire.estimated_time || 15}</span> min
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">{questionnaire.response_count}</span> respostas
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] px-6 py-4">
          <div className="space-y-6">
            {questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma pergunta cadastrada</p>
              </div>
            ) : (
              questions.map((question: any, index: number) => (
                <div 
                  key={question.id || index}
                  className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`${color} text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getQuestionTypeLabel(question.type)}
                      </p>
                    </div>
                  </div>

                  {/* Mostrar opções se houver */}
                  {(question.type === 'single_select' || 
                    question.type === 'radio' || 
                    question.type === 'multi_select' || 
                    question.type === 'checkbox') && 
                   question.options && question.options.length > 0 && (
                    <div className="ml-11 mt-3 space-y-2">
                      {question.options.map((option: string, optIndex: number) => (
                        <div 
                          key={optIndex}
                          className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-600"
                        >
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Campo exemplo para tipos de texto */}
                  {(question.type === 'text' || question.type === 'textarea') && (
                    <div className="ml-11 mt-3">
                      <div className={`p-3 bg-white dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-600 text-sm text-gray-400 ${
                        question.type === 'textarea' ? 'min-h-[80px]' : ''
                      }`}>
                        {question.type === 'text' ? 'Resposta curta...' : 'Resposta longa...'}
                      </div>
                    </div>
                  )}

                  {/* Escala exemplo */}
                  {question.type === 'scale' && (
                    <div className="ml-11 mt-3">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <div 
                            key={num}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-medium text-gray-500"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Campo número exemplo */}
                  {question.type === 'number' && (
                    <div className="ml-11 mt-3">
                      <div className="w-32 p-3 bg-white dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-600 text-sm text-gray-400">
                        0
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
