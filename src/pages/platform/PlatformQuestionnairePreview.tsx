import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const PlatformQuestionnairePreview = () => {
  const { questionnaireId } = useParams<{ questionnaireId: string }>();
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (questionnaireId) fetchQuestionnaire();
  }, [questionnaireId]);

  const fetchQuestionnaire = async () => {
    const { data } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('id', questionnaireId)
      .single();

    setQuestionnaire(data);
    setLoading(false);
  };

  const handleAnswerChange = (questionId: string, value: any, type: string) => {
    if (type === 'checkbox') {
      const currentAnswers = answers[questionId] || [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((v: string) => v !== value)
        : [...currentAnswers, value];
      setAnswers({ ...answers, [questionId]: newAnswers });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const canGoNext = () => {
    const currentQuestion = questionnaire?.questions[currentQuestionIndex];
    if (!currentQuestion?.required) return true;
    
    const answer = answers[currentQuestion.id];
    if (!answer) return false;
    if (Array.isArray(answer) && answer.length === 0) return false;
    if (typeof answer === 'string' && answer.trim() === '') return false;
    
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <p className="text-gray-600">Carregando preview...</p>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <p className="text-gray-600">Questionário não encontrado</p>
      </div>
    );
  }

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionnaire.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      {/* Banner de Preview */}
      <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white py-3 px-6 flex items-center justify-between z-50">
        <div>
          <p className="font-bold">Modo Preview</p>
          <p className="text-xs opacity-90">Este é apenas um teste - respostas não serão salvas</p>
        </div>
        <button
          onClick={() => window.close()}
          className="bg-white/20 hover:bg-white/30 rounded-lg p-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden mt-16">
        {/* Barra de progresso */}
        <div className="h-2 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Conteúdo */}
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">
                {currentQuestionIndex + 1} / {questionnaire.questions.length}
              </span>
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                {currentQuestion.type === 'text' ? 'Resposta curta' :
                 currentQuestion.type === 'textarea' ? 'Resposta longa' :
                 currentQuestion.type === 'radio' ? 'Escolha uma' :
                 currentQuestion.type === 'checkbox' ? 'Múltipla escolha' :
                 'Escala 1-10'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentQuestion.question}
              {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
            </h2>
          </div>

          {/* Campo de resposta */}
          <div className="mb-8 min-h-[200px]">
            {currentQuestion.type === 'text' && (
              <input
                type="text"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, 'text')}
                placeholder="Digite sua resposta..."
                className="w-full border-2 border-gray-300 rounded-lg p-4 text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
              />
            )}

            {currentQuestion.type === 'textarea' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, 'textarea')}
                placeholder="Digite sua resposta..."
                rows={5}
                className="w-full border-2 border-gray-300 rounded-lg p-4 text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
              />
            )}

            {currentQuestion.type === 'radio' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerChange(currentQuestion.id, option, 'radio')}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[currentQuestion.id] === option
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        answers[currentQuestion.id] === option
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQuestion.id] === option && (
                          <div className="w-3 h-3 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-base text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'checkbox' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option: string, idx: number) => {
                  const isChecked = (answers[currentQuestion.id] || []).includes(option);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerChange(currentQuestion.id, option, 'checkbox')}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isChecked
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isChecked
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {isChecked && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-base text-gray-900">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'scale' && (
              <div>
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleAnswerChange(currentQuestion.id, num, 'scale')}
                      className={`h-16 rounded-lg font-bold text-xl transition-all ${
                        answers[currentQuestion.id] === num
                          ? 'bg-green-500 text-white scale-110 shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>1 = Baixo</span>
                  <span>10 = Alto</span>
                </div>
              </div>
            )}
          </div>

          {/* Navegação */}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Voltar
            </button>
            <button
              onClick={() => {
                if (currentQuestionIndex < questionnaire.questions.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                } else {
                  alert('Preview finalizado! Em produção, as respostas seriam enviadas aqui.');
                }
              }}
              disabled={!canGoNext()}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {currentQuestionIndex === questionnaire.questions.length - 1 ? 'Finalizar Preview' : 'Próximo'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
