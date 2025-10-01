import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Question } from '@/components/questionnaires/types/questionnaire';

export default function PublicQuestionnaireResponse() {
  const { token } = useParams<{ token: string }>();
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [responseId, setResponseId] = useState('');
  
  // Dados do respondente
  const [respondentData, setRespondentData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  
  // Controle do quiz
  const [currentStep, setCurrentStep] = useState<'info' | 'questions' | 'review'>('info');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (token) fetchQuestionnaire();
  }, [token]);

  const fetchQuestionnaire = async () => {
    try {
      const { data: response, error: responseError } = await supabase
        .from('questionnaire_responses')
        .select('id, status, questionnaire_id, client_id')
        .eq('public_token', token)
        .single();

      if (responseError || !response) {
        setError('Questionário não encontrado ou link inválido');
        setLoading(false);
        return;
      }

      if (response.status === 'completed') {
        setError('Este questionário já foi respondido');
        setLoading(false);
        return;
      }

      setResponseId(response.id);

      const { data: questionnaireData, error: qError } = await supabase
        .from('questionnaires')
        .select('id, title, description, questions')
        .eq('id', response.questionnaire_id)
        .single();

      if (qError || !questionnaireData) {
        setError('Erro ao carregar questionário');
        setLoading(false);
        return;
      }

      setQuestionnaire(questionnaireData);
      setLoading(false);

    } catch (err: any) {
      setError('Erro inesperado ao carregar questionário');
      setLoading(false);
    }
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

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questionnaire.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentStep('review');
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = (answers: Record<string, any>, questions: Question[]): number => {
    let totalScore = 0;
    let totalWeight = 0;

    questions.forEach(question => {
      if (!question.scorable) return;

      const answer = answers[question.id];
      const weight = question.weight || 1;
      let questionScore = 0;

      if (question.type === 'single_select') {
        questionScore = question.optionScores?.[answer] || 0;
      } else if (question.type === 'multi_select' && Array.isArray(answer)) {
        const scores = answer.map(opt => question.optionScores?.[opt] || 0);
        questionScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      } else if (question.type === 'scale') {
        questionScore = (answer / 10) * 100;
      }

      totalScore += questionScore * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const finalScore = calculateScore(answers, questionnaire?.questions || []);
      const phoneClean = respondentData.phone.replace(/\D/g, '');
      
      const { error: updateError } = await supabase
        .from('questionnaire_responses')
        .update({
          answers: answers,
          status: 'completed',
          completed_at: new Date().toISOString(),
          respondent_name: respondentData.name,
          respondent_phone: phoneClean,
          respondent_email: respondentData.email || null,
          score: finalScore
        })
        .eq('id', responseId);

      if (updateError) throw updateError;

      // Buscar tenant e vincular cliente
      const { data: responseData } = await supabase
        .from('questionnaire_responses')
        .select('tenant_id')
        .eq('id', responseId)
        .single();

      if (responseData) {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id, email, name')
          .eq('tenant_id', responseData.tenant_id)
          .eq('phone', phoneClean)
          .maybeSingle();

        let clientId;

        if (existingClient) {
          clientId = existingClient.id;
          if ((respondentData.email && respondentData.email !== existingClient.email) ||
              respondentData.name !== existingClient.name) {
            await supabase.from('clients').update({ 
              email: respondentData.email || existingClient.email,
              name: respondentData.name
            }).eq('id', clientId);
          }
        } else {
          const { data: newClient } = await supabase
            .from('clients')
            .insert({
              tenant_id: responseData.tenant_id,
              name: respondentData.name,
              phone: phoneClean,
              email: respondentData.email || null
            })
            .select('id')
            .single();

          clientId = newClient?.id;
        }

        if (clientId) {
          await supabase
            .from('questionnaire_responses')
            .update({ client_id: clientId })
            .eq('id', responseId);
        }
      }

      setSuccess(true);

    } catch (err: any) {
      setError(err.message || 'Erro ao enviar respostas');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando questionário...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops!</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    const finalScore = calculateScore(answers, questionnaire?.questions || []);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Respostas Enviadas!</h2>
          </div>

          {finalScore > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 text-center border-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Sua pontuação</p>
              <p className="text-5xl font-bold text-blue-600 mb-2">{finalScore}%</p>
              <p className="text-lg text-gray-700">
                {finalScore >= 80 ? '😁 Excelente!' : 
                 finalScore >= 60 ? '😊 Bom trabalho!' :
                 finalScore >= 40 ? '😐 Continue assim!' :
                 '☹️ Vamos melhorar!'}
              </p>
            </div>
          )}

          <p className="text-gray-600 text-center">
            Obrigado por responder! O nutricionista vai analisar suas respostas em breve.
          </p>
        </div>
      </div>
    );
  }

  // TELA 1: Dados do respondente
  if (currentStep === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{questionnaire.title}</h1>
              <p className="text-gray-600">{questionnaire.description}</p>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Antes de começar...</h3>
              <p className="text-sm text-gray-600">Por favor, informe seus dados para que possamos acompanhar sua evolução</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={respondentData.name}
                  onChange={(e) => setRespondentData({...respondentData, name: e.target.value})}
                  placeholder="Seu nome"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone/WhatsApp *
                </label>
                <input
                  type="tel"
                  value={respondentData.phone}
                  onChange={(e) => {
                    let phone = e.target.value.replace(/\D/g, '');
                    if (phone.length <= 11) {
                      if (phone.length > 10) {
                        phone = phone.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                      } else if (phone.length > 6) {
                        phone = phone.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
                      } else if (phone.length > 2) {
                        phone = phone.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                      }
                    }
                    setRespondentData({...respondentData, phone});
                  }}
                  placeholder="(00) 00000-0000"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  value={respondentData.email}
                  onChange={(e) => setRespondentData({...respondentData, email: e.target.value})}
                  placeholder="seu@email.com"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => {
                  if (!respondentData.name || respondentData.name.trim().length < 3) {
                    setError('Por favor, informe seu nome completo');
                    return;
                  }
                  if (!respondentData.phone || respondentData.phone.replace(/\D/g, '').length < 10) {
                    setError('Por favor, informe um telefone válido');
                    return;
                  }
                  setError('');
                  setCurrentStep('questions');
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition"
              >
                Iniciar Questionário
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TELA 2: Perguntas (uma por vez)
  if (currentStep === 'questions') {
    const currentQuestion = questionnaire.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questionnaire.questions.length) * 100;

    // DEBUG LOG
    console.log('Pergunta atual:', {
      id: currentQuestion.id,
      type: currentQuestion.type,
      question: currentQuestion.question,
      hasOptions: !!currentQuestion.options,
      optionsCount: currentQuestion.options?.length || 0,
      options: currentQuestion.options
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
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
                  Pergunta {currentQuestionIndex + 1} de {questionnaire.questions.length}
                </span>
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                  {currentQuestion.type === 'text' ? 'Resposta curta' :
                   currentQuestion.type === 'textarea' ? 'Resposta longa' :
                   (currentQuestion.type === 'single_select' || currentQuestion.type === 'radio') ? 'Escolha uma' :
                   (currentQuestion.type === 'multi_select' || currentQuestion.type === 'checkbox') ? 'Múltipla escolha' :
                   currentQuestion.type === 'number' ? 'Número' :
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

              {(currentQuestion.type === 'single_select' || currentQuestion.type === 'radio') && (
                <div className="space-y-3">
                  {(!currentQuestion.options || currentQuestion.options.length === 0) ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <p className="text-yellow-800 text-sm">
                        ⚠️ Erro: Esta pergunta não possui opções configuradas
                      </p>
                    </div>
                  ) : (
                    currentQuestion.options.map((option, idx) => (
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
                    ))
                  )}
                </div>
              )}

              {(currentQuestion.type === 'multi_select' || currentQuestion.type === 'checkbox') && (
                <div className="space-y-3">
                  {(!currentQuestion.options || currentQuestion.options.length === 0) ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <p className="text-yellow-800 text-sm">
                        ⚠️ Erro: Esta pergunta não possui opções configuradas
                      </p>
                    </div>
                  ) : (
                    currentQuestion.options.map((option, idx) => {
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
                    })
                  )}
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
                onClick={goToPrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Voltar
              </button>
              <button
                onClick={goToNextQuestion}
                disabled={!canGoNext()}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {currentQuestionIndex === questionnaire.questions.length - 1 ? 'Revisar Respostas' : 'Próxima'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TELA 3: Revisão final
  if (currentStep === 'review') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisar Respostas</h2>
            <p className="text-gray-600 mb-6">Confira suas respostas antes de enviar</p>
            
            <div className="space-y-4 mb-8">
              {questionnaire.questions.map((q: any, index: number) => (
                <div key={q.id} className="border-b pb-4">
                  <p className="font-semibold text-gray-900 mb-2">
                    {index + 1}. {q.question}
                  </p>
                  <p className="text-gray-700 mb-2">
                    {(q.type === 'multi_select' || q.type === 'checkbox') && Array.isArray(answers[q.id])
                      ? answers[q.id].join(', ') || 'Não respondido'
                      : answers[q.id] || 'Não respondido'}
                  </p>
                  <button
                    onClick={() => {
                      setCurrentStep('questions');
                      setCurrentQuestionIndex(index);
                    }}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Editar resposta
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCurrentStep('questions');
                  setCurrentQuestionIndex(questionnaire.questions.length - 1);
                }}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Enviar Respostas
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
