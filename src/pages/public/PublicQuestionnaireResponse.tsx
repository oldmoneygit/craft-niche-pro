import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft, User, Mail, Phone, Sparkles, MessageSquare, ListChecks } from 'lucide-react';
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

      // Buscar questionário
      const { data: questionnaireData, error: qError } = await supabase
        .from('questionnaires')
        .select('id, title, description')
        .eq('id', response.questionnaire_id)
        .single();

      if (qError || !questionnaireData) {
        setError('Erro ao carregar questionário');
        setLoading(false);
        return;
      }

      // Buscar perguntas da tabela questionnaire_questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questionnaire_questions')
        .select('*')
        .eq('questionnaire_id', response.questionnaire_id)
        .order('order_index', { ascending: true });

      if (questionsError) {
        console.error('Erro ao carregar perguntas:', questionsError);
        setError('Erro ao carregar perguntas do questionário');
        setLoading(false);
        return;
      }

      // Mapear perguntas para o formato esperado pelo componente
      const mappedQuestions = (questionsData || []).map((q: any) => ({
        id: q.id,
        question: q.question_text,
        type: q.question_type,
        options: q.options || [],
        required: q.is_required
      }));

      setQuestionnaire({
        ...questionnaireData,
        questions: mappedQuestions
      });
      setLoading(false);

    } catch (err: any) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao carregar questionário');
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any, type?: string) => {
    if (type === 'checkbox' || type === 'multiple_choice') {
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">Carregando questionário...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !success) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-red-500 via-pink-500 to-orange-500">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-scale-in">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Ops!</h2>
          <p className="text-gray-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    const finalScore = calculateScore(answers, questionnaire?.questions || []);
    
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600">
        {/* Confetti effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
          <div className="absolute top-20 right-1/4 w-3 h-3 bg-pink-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-300 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-10 max-w-lg w-full animate-scale-in">
          <div className="text-center mb-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl animate-bounce mb-6">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Obrigado!
            </h2>
          </div>

          {finalScore > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 text-center border-2 border-blue-200 animate-fade-in">
              <p className="text-sm text-gray-600 mb-2 font-medium">Sua pontuação</p>
              <p className="text-6xl font-bold text-blue-600 mb-2">{finalScore}%</p>
              <p className="text-lg text-gray-700 font-medium">
                {finalScore >= 80 ? '😁 Excelente!' : 
                 finalScore >= 60 ? '😊 Bom trabalho!' :
                 finalScore >= 40 ? '😐 Continue assim!' :
                 '☹️ Vamos melhorar!'}
              </p>
            </div>
          )}

          <p className="text-gray-600 text-center text-lg leading-relaxed">
            Suas respostas foram enviadas com sucesso. O nutricionista vai analisar em breve. 🎉
          </p>
        </div>
      </div>
    );
  }

  // STEP 1: Info
  if (currentStep === 'info') {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          <div className="shadow-2xl rounded-2xl border-0 bg-white/90 backdrop-blur-xl p-8">
            <div className="text-center space-y-4 mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center animate-scale-in shadow-lg">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                {questionnaire.title}
              </h1>
              {questionnaire.description && (
                <p className="text-base text-gray-600 leading-relaxed">
                  {questionnaire.description}
                </p>
              )}
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2 group">
                <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 text-violet-500" />
                  Nome completo *
                </label>
                <input
                  id="name"
                  type="text"
                  value={respondentData.name}
                  onChange={(e) => setRespondentData({ ...respondentData, name: e.target.value })}
                  placeholder="Digite seu nome"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-300 text-base"
                  required
                />
              </div>

              <div className="space-y-2 group">
                <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 text-violet-500" />
                  Telefone *
                </label>
                <input
                  id="phone"
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
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-300 text-base"
                  required
                />
              </div>

              <div className="space-y-2 group">
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4 text-violet-500" />
                  E-mail (opcional)
                </label>
                <input
                  id="email"
                  type="email"
                  value={respondentData.email}
                  onChange={(e) => setRespondentData({ ...respondentData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-300 text-base"
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
                className="w-full mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group flex items-center justify-center gap-2"
              >
                <span className="text-lg">Iniciar Questionário</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm text-red-800 animate-fade-in">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Questions
  if (currentStep === 'questions') {
    if (!questionnaire || !questionnaire.questions || questionnaire.questions.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <p className="text-red-600 font-semibold mb-2">Erro ao carregar perguntas</p>
            <p className="text-gray-600 text-sm mb-4">
              O questionário não possui perguntas cadastradas ou houve um erro ao carregá-las.
            </p>
            <button
              onClick={() => setCurrentStep('info')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Voltar
            </button>
          </div>
        </div>
      );
    }

    const currentQuestion = questionnaire.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questionnaire.questions.length) * 100;

    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="w-full max-w-2xl relative z-10 animate-fade-in">
          <div className="shadow-2xl rounded-2xl border-0 bg-white/95 backdrop-blur-xl">
            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-cyan-500" />
                    Pergunta {currentQuestionIndex + 1} de {questionnaire.questions.length}
                  </span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500 ease-out shadow-lg"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-cyan-50 to-blue-50 px-3 py-1.5 rounded-full text-cyan-700 font-medium border border-cyan-200">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {currentQuestion.type === 'text' ? 'Resposta curta' :
                   currentQuestion.type === 'textarea' ? 'Resposta longa' :
                   currentQuestion.type === 'single_choice' ? 'Escolha uma' :
                   currentQuestion.type === 'multiple_choice' ? 'Múltipla escolha' :
                   currentQuestion.type === 'number' ? 'Número' :
                   currentQuestion.type === 'scale' ? 'Escala 1-10' :
                   currentQuestion.type}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {currentQuestion.question}
                  {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                </h2>
              </div>

              <div className="space-y-4 py-4">
                {/* TEXT */}
                {currentQuestion.type === 'text' && (
                  <input
                    type="text"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Digite sua resposta"
                    className="w-full text-base border-2 border-gray-200 rounded-xl p-4 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300"
                  />
                )}

                {/* TEXTAREA */}
                {currentQuestion.type === 'textarea' && (
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Digite sua resposta"
                    className="w-full text-base min-h-[140px] border-2 border-gray-200 rounded-xl p-4 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 resize-none"
                  />
                )}

                {/* NUMBER */}
                {currentQuestion.type === 'number' && (
                  <input
                    type="number"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Digite um número"
                    className="w-full text-base border-2 border-gray-200 rounded-xl p-4 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300"
                  />
                )}

                {/* SCALE */}
                {currentQuestion.type === 'scale' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleAnswerChange(currentQuestion.id, num.toString())}
                          className={`aspect-square rounded-xl border-2 font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                            answers[currentQuestion.id] === num.toString()
                              ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-transparent shadow-lg scale-110'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-cyan-300 hover:shadow-md'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 px-1 font-medium">
                      <span>😞 Muito ruim</span>
                      <span>😊 Excelente</span>
                    </div>
                  </div>
                )}

                {/* SINGLE CHOICE */}
                {currentQuestion.type === 'single_choice' && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option: any, index: number) => (
                      <div
                        key={option.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <button
                          type="button"
                          onClick={() => handleAnswerChange(currentQuestion.id, option.text)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                            answers[currentQuestion.id] === option.text
                              ? 'border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-cyan-300 hover:shadow-sm bg-white'
                          }`}
                        >
                          <span className="text-base font-medium">{option.text}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* MULTIPLE CHOICE */}
                {currentQuestion.type === 'multiple_choice' && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option: any, index: number) => (
                      <div
                        key={option.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <button
                          type="button"
                          onClick={() => handleAnswerChange(currentQuestion.id, option.text, 'checkbox')}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                            (answers[currentQuestion.id] as string[] || []).includes(option.text)
                              ? 'border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-cyan-300 hover:shadow-sm bg-white'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            (answers[currentQuestion.id] as string[] || []).includes(option.text)
                              ? 'bg-cyan-500 border-cyan-500'
                              : 'border-gray-300'
                          }`}>
                            {(answers[currentQuestion.id] as string[] || []).includes(option.text) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-base font-medium flex-1">{option.text}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={goToPrevQuestion}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-cyan-500 hover:text-cyan-600 transition-all duration-300 group flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                    Anterior
                  </button>
                )}
                <button
                  onClick={goToNextQuestion}
                  disabled={!canGoNext()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                >
                  <span>{currentQuestionIndex === questionnaire.questions.length - 1 ? 'Revisar' : 'Próxima'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: Review
  if (currentStep === 'review') {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="w-full max-w-3xl relative z-10 animate-fade-in">
          <div className="shadow-2xl rounded-2xl border-0 bg-white/95 backdrop-blur-xl">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <ListChecks className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">Revise suas respostas</h2>
                  <p className="text-base text-gray-600">
                    Confira tudo antes de enviar. Você pode voltar e editar qualquer resposta.
                  </p>
                </div>
              </div>

              {/* Info do respondente */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-200 space-y-3 animate-fade-in">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Seus dados
                </h3>
                <div className="text-sm text-gray-700 space-y-2 pl-7">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Nome:</span> {respondentData.name}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Telefone:</span> {respondentData.phone}
                  </p>
                  {respondentData.email && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">E-mail:</span> {respondentData.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Respostas */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                  Suas respostas
                </h3>
                {questionnaire.questions.map((q: any, index: number) => (
                  <div 
                    key={q.id} 
                    className="border-l-4 border-emerald-500 pl-5 py-3 bg-white rounded-r-xl hover:shadow-md transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <p className="font-semibold text-gray-900 mb-2 text-base">
                      {index + 1}. {q.question}
                    </p>
                    <p className="text-gray-700 mb-3 bg-gray-50 px-3 py-2 rounded-lg">
                      {Array.isArray(answers[q.id])
                        ? answers[q.id].join(', ') || 'Não respondido'
                        : answers[q.id] || 'Não respondido'}
                    </p>
                    <button
                      onClick={() => {
                        setCurrentQuestionIndex(index);
                        setCurrentStep('questions');
                      }}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium underline transition-colors duration-200"
                    >
                      ✏️ Editar resposta
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep('questions')}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 group flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 group flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Enviar Respostas
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}