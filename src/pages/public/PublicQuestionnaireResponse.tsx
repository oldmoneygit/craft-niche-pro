import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, AlertCircle, Loader2, Sparkles, User, Mail, Phone } from 'lucide-react';
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
        required: q.is_required,
        scorable: q.scorable || false,
        weight: q.weight || 1,
        optionScores: q.option_scores || {}
      }));

      console.log('=== QUESTIONS FOR ANSWERING ===');
      console.log('Questions being used for answering:', mappedQuestions);
      console.log('Question IDs for answering:', mappedQuestions.map((q: any) => q.id));

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
      console.log('=== SUBMITTING ANSWERS ===');
      console.log('Answers object:', answers);
      console.log('Question IDs:', questionnaire?.questions.map((q: any) => q.id));
      
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
      <div className="min-h-screen flex items-center justify-center p-0 sm:p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        {/* Container responsivo - com frame no desktop, sem frame no mobile */}
        <div 
          className="w-full h-screen sm:h-auto sm:max-w-[420px] sm:shadow-2xl"
          style={{
            background: typeof window !== 'undefined' && window.innerWidth >= 640 ? '#1f2937' : 'transparent',
            borderRadius: typeof window !== 'undefined' && window.innerWidth >= 640 ? '36px' : '0',
            padding: typeof window !== 'undefined' && window.innerWidth >= 640 ? '12px' : '0'
          }}
        >
          <div 
            className="flex flex-col h-full"
            style={{
              background: 'white',
              borderRadius: typeof window !== 'undefined' && window.innerWidth >= 640 ? '28px' : '0',
              overflow: 'hidden',
              minHeight: typeof window !== 'undefined' && window.innerWidth >= 640 ? '760px' : '100vh'
            }}
          >
            {/* Header Verde */}
            <div 
              style={{
                background: '#10b981',
                color: 'white',
                padding: '20px',
                textAlign: 'center'
              }}
            >
              <div 
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  lineHeight: '1.3'
                }}
              >
                {questionnaire.title}
              </h3>
              {questionnaire.description && (
                <p 
                  style={{
                    fontSize: '13px',
                    opacity: '0.9',
                    lineHeight: '1.4'
                  }}
                >
                  {questionnaire.description}
                </p>
              )}
            </div>

            {/* Content */}
            <div 
              className="flex-1 overflow-y-auto"
              style={{
                padding: '24px',
                background: 'white'
              }}
            >
              <div style={{ animation: 'slideIn 0.3s ease' }}>
                <style>{`
                  @keyframes slideIn {
                    from {
                      opacity: 0;
                      transform: translateY(10px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `}</style>

                <div style={{ marginBottom: '24px' }}>
                  <label 
                    htmlFor="name" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}
                  >
                    <User className="w-4 h-4" style={{ color: '#10b981' }} />
                    Nome completo *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={respondentData.name}
                    onChange={(e) => setRespondentData({ ...respondentData, name: e.target.value })}
                    placeholder="Digite seu nome"
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '15px',
                      color: '#374151',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label 
                    htmlFor="phone" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}
                  >
                    <Phone className="w-4 h-4" style={{ color: '#10b981' }} />
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
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '15px',
                      color: '#374151',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label 
                    htmlFor="email" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}
                  >
                    <Mail className="w-4 h-4" style={{ color: '#10b981' }} />
                    E-mail (opcional)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={respondentData.email}
                    onChange={(e) => setRespondentData({ ...respondentData, email: e.target.value })}
                    placeholder="seu@email.com"
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '15px',
                      color: '#374151',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {error && (
                  <div 
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#fef2f2',
                      border: '2px solid #fecaca',
                      color: '#991b1b',
                      fontSize: '14px',
                      marginBottom: '16px',
                      animation: 'slideIn 0.3s ease'
                    }}
                  >
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div 
              style={{
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                background: 'white'
              }}
            >
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
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#10b981',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10b981';
                }}
              >
                Iniciar Questionário
              </button>
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
      <div className="min-h-screen flex items-center justify-center p-0 sm:p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        {/* Container responsivo - com frame no desktop, sem frame no mobile */}
        <div 
          className="w-full h-screen sm:h-auto sm:max-w-[420px] sm:shadow-2xl"
          style={{
            background: typeof window !== 'undefined' && window.innerWidth >= 640 ? '#1f2937' : 'transparent',
            borderRadius: typeof window !== 'undefined' && window.innerWidth >= 640 ? '36px' : '0',
            padding: typeof window !== 'undefined' && window.innerWidth >= 640 ? '12px' : '0'
          }}
        >
          <div 
            className="flex flex-col h-full"
            style={{
              background: 'white',
              borderRadius: typeof window !== 'undefined' && window.innerWidth >= 640 ? '28px' : '0',
              overflow: 'hidden',
              minHeight: typeof window !== 'undefined' && window.innerWidth >= 640 ? '760px' : '100vh'
            }}
          >
            {/* Header Verde */}
            <div 
              style={{
                background: '#10b981',
                color: 'white',
                padding: '20px',
                textAlign: 'center'
              }}
            >
              <h3 
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  lineHeight: '1.3'
                }}
              >
                {questionnaire.title}
              </h3>
              {questionnaire.description && (
                <p 
                  style={{
                    fontSize: '13px',
                    opacity: '0.9',
                    lineHeight: '1.4'
                  }}
                >
                  {questionnaire.description}
                </p>
              )}

              {/* Progress Bar */}
              <div 
                style={{
                  marginTop: '16px',
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{
                    height: '100%',
                    background: 'white',
                    width: `${progress}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Content */}
            <div 
              className="flex-1 overflow-y-auto"
              style={{
                padding: '24px',
                background: 'white'
              }}
            >
              <div style={{ animation: 'slideIn 0.3s ease' }}>
                <style>{`
                  @keyframes slideIn {
                    from {
                      opacity: 0;
                      transform: translateY(10px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `}</style>
                
                {/* Pergunta com Número */}
                <div 
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    lineHeight: '1.4'
                  }}
                >
                  <span 
                    style={{
                      width: '28px',
                      height: '28px',
                      background: '#10b981',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '700',
                      marginRight: '12px',
                      flexShrink: 0
                    }}
                  >
                    {currentQuestionIndex + 1}
                  </span>
                  <span>
                    {currentQuestion.question}
                    {currentQuestion.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                  </span>
                </div>

                <div style={{ marginTop: '20px' }}>
                  {/* TEXT */}
                  {currentQuestion.type === 'text' && (
                    <input
                      type="text"
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Digite sua resposta..."
                      style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '15px',
                        color: '#374151',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  )}

                  {/* TEXTAREA */}
                  {currentQuestion.type === 'textarea' && (
                    <textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Digite sua resposta..."
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '15px',
                        color: '#374151',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        resize: 'none',
                        lineHeight: '1.5'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  )}

                  {/* NUMBER */}
                  {currentQuestion.type === 'number' && (
                    <input
                      type="number"
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '15px',
                        color: '#374151',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  )}

                  {/* SCALE */}
                  {currentQuestion.type === 'scale' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                          const isSelected = answers[currentQuestion.id] === num.toString();
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleAnswerChange(currentQuestion.id, num.toString())}
                              style={{
                                flex: '0 0 calc(20% - 6.4px)',
                                aspectRatio: '1',
                                padding: '12px 0',
                                borderRadius: '12px',
                                border: isSelected ? '2px solid #10b981' : '2px solid #e5e7eb',
                                background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'white',
                                color: isSelected ? '#10b981' : '#374151',
                                fontSize: '18px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.borderColor = '#10b981';
                                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.borderColor = '#e5e7eb';
                                  e.currentTarget.style.background = 'white';
                                }
                              }}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
                        <span>😞 Muito ruim</span>
                        <span>😊 Excelente</span>
                      </div>
                    </div>
                  )}

                  {/* SINGLE CHOICE */}
                  {currentQuestion.type === 'single_choice' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {currentQuestion.options?.map((option: any, index: number) => {
                        const optionText = typeof option === 'string' ? option : option.text;
                        const isSelected = answers[currentQuestion.id] === optionText;
                        
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleAnswerChange(currentQuestion.id, optionText)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '16px',
                              borderRadius: '12px',
                              border: isSelected ? '2px solid #10b981' : '2px solid #e5e7eb',
                              background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'white',
                              color: isSelected ? '#10b981' : '#374151',
                              fontWeight: isSelected ? '600' : '500',
                              fontSize: '15px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              lineHeight: '1.4'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.borderColor = '#10b981';
                                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.background = 'white';
                              }
                            }}
                          >
                            {optionText}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* MULTIPLE CHOICE */}
                  {currentQuestion.type === 'multiple_choice' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {currentQuestion.options?.map((option: any, index: number) => {
                        const optionText = typeof option === 'string' ? option : option.text;
                        const isSelected = Array.isArray(answers[currentQuestion.id]) && 
                          answers[currentQuestion.id].includes(optionText);
                        
                        return (
                          <label
                            key={index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '16px',
                              borderRadius: '12px',
                              border: '2px solid #e5e7eb',
                              background: 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#10b981';
                              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e5e7eb';
                              e.currentTarget.style.background = 'white';
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const currentAnswers = Array.isArray(answers[currentQuestion.id]) 
                                  ? answers[currentQuestion.id] 
                                  : [];
                                const newAnswers = isSelected
                                  ? currentAnswers.filter((a: string) => a !== optionText)
                                  : [...currentAnswers, optionText];
                                handleAnswerChange(currentQuestion.id, newAnswers);
                              }}
                              style={{
                                width: '20px',
                                height: '20px',
                                marginRight: '12px',
                                accentColor: '#10b981',
                                cursor: 'pointer'
                              }}
                            />
                            <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500', lineHeight: '1.4' }}>
                              {optionText}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div 
              style={{
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: '12px',
                background: 'white'
              }}
            >
              <button
                onClick={goToPrevQuestion}
                disabled={currentQuestionIndex === 0}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: currentQuestionIndex === 0 ? '#f3f4f6' : '#f3f4f6',
                  color: '#6b7280',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentQuestionIndex === 0 ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentQuestionIndex !== 0) {
                    e.currentTarget.style.background = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentQuestionIndex !== 0) {
                    e.currentTarget.style.background = '#f3f4f6';
                  }
                }}
              >
                Voltar
              </button>
              <button
                onClick={goToNextQuestion}
                disabled={!canGoNext()}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: !canGoNext() ? '#10b981' : '#10b981',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: !canGoNext() ? 'not-allowed' : 'pointer',
                  opacity: !canGoNext() ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (canGoNext()) {
                    e.currentTarget.style.background = '#059669';
                  }
                }}
                onMouseLeave={(e) => {
                  if (canGoNext()) {
                    e.currentTarget.style.background = '#10b981';
                  }
                }}
              >
                {currentQuestionIndex === questionnaire.questions.length - 1 ? 'Revisar' : 'Próxima'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: Review
  return (
    <div className="min-h-screen flex items-center justify-center p-0 sm:p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Container responsivo - com frame no desktop, sem frame no mobile */}
      <div 
        className="w-full h-screen sm:h-auto sm:max-w-[420px] sm:shadow-2xl"
        style={{
          background: typeof window !== 'undefined' && window.innerWidth >= 640 ? '#1f2937' : 'transparent',
          borderRadius: typeof window !== 'undefined' && window.innerWidth >= 640 ? '36px' : '0',
          padding: typeof window !== 'undefined' && window.innerWidth >= 640 ? '12px' : '0'
        }}
      >
        <div 
          className="flex flex-col h-full"
          style={{
            background: 'white',
            borderRadius: typeof window !== 'undefined' && window.innerWidth >= 640 ? '28px' : '0',
            overflow: 'hidden',
            minHeight: typeof window !== 'undefined' && window.innerWidth >= 640 ? '760px' : '100vh'
          }}
        >
          {/* Header Verde */}
          <div 
            style={{
              background: '#10b981',
              color: 'white',
              padding: '20px',
              textAlign: 'center'
            }}
          >
            <div 
              style={{
                width: '56px',
                height: '56px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 
              style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '8px',
                lineHeight: '1.3'
              }}
            >
              Revise suas respostas
            </h3>
            <p 
              style={{
                fontSize: '13px',
                opacity: '0.9',
                lineHeight: '1.4'
              }}
            >
              Confira suas respostas antes de enviar
            </p>
          </div>

          {/* Content - Lista de Respostas */}
          <div 
            className="flex-1 overflow-y-auto"
            style={{
              padding: '24px',
              background: 'white'
            }}
          >
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px',
                animation: 'slideIn 0.3s ease' 
              }}
            >
              <style>{`
                @keyframes slideIn {
                  from {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>

              {questionnaire.questions.map((q: any, idx: number) => {
                const answer = answers[q.id];
                const hasAnswer = answer && (Array.isArray(answer) ? answer.length > 0 : answer.toString().trim() !== '');
                
                return (
                  <div 
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setCurrentStep('questions');
                    }}
                    style={{
                      background: '#f9fafb',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}
                    >
                      <span 
                        style={{
                          width: '24px',
                          height: '24px',
                          background: '#10b981',
                          color: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '700',
                          marginRight: '10px',
                          flexShrink: 0
                        }}
                      >
                        {idx + 1}
                      </span>
                      <p 
                        style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#1f2937',
                          lineHeight: '1.4',
                          flex: 1,
                          paddingRight: '24px'
                        }}
                      >
                        {q.question}
                      </p>
                      {/* Ícone de editar */}
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '16px',
                          opacity: 0.5
                        }}
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </div>
                    <div style={{ paddingLeft: '34px' }}>
                      <p 
                        style={{
                          fontSize: '14px',
                          color: hasAnswer ? '#4b5563' : '#9ca3af',
                          lineHeight: '1.5',
                          fontStyle: hasAnswer ? 'normal' : 'italic'
                        }}
                      >
                        {Array.isArray(answer) 
                          ? (answer.length > 0 ? answer.join(', ') : 'Não respondido')
                          : (answer || 'Não respondido')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer com Botões */}
          <div 
            style={{
              padding: '20px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '12px',
              background: 'white'
            }}
          >
            <button
              onClick={() => {
                setCurrentQuestionIndex(0);
                setCurrentStep('questions');
              }}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: '2px solid #10b981',
                background: 'white',
                color: '#10b981',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0fdf4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
              }}
            >
              Editar Respostas
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: submitting ? '#9ca3af' : '#10b981',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = '#059669';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = '#10b981';
                }
              }}
            >
              {submitting ? 'Enviando...' : 'Enviar Respostas'}
            </button>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div 
              style={{
                margin: '0 20px 20px',
                padding: '16px',
                background: '#fef2f2',
                border: '2px solid #fecaca',
                borderRadius: '12px',
                color: '#991b1b',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
