import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'scale';
  question: string;
  options?: string[];
  required: boolean;
}

interface QuestionnaireData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function PublicQuestionnaireResponse() {
  const { token } = useParams<{ token: string }>();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [responseId, setResponseId] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [respondentData, setRespondentData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [step, setStep] = useState<'info' | 'questions'>('info');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    console.log('Token recebido:', token);
    if (token) {
      fetchQuestionnaire();
    } else {
      setError('Token não encontrado na URL');
      setLoading(false);
    }
  }, [token]);

  const fetchQuestionnaire = async () => {
    try {
      // 1. Buscar response pelo token
      const { data: response, error: responseError } = await supabase
        .from('questionnaire_responses')
        .select('id, status, questionnaire_id, client_id')
        .eq('public_token', token)
        .single();

      if (responseError) {
        console.error('Response error:', responseError);
        setError('Questionário não encontrado ou link inválido');
        setLoading(false);
        return;
      }

      if (!response) {
        setError('Link inválido ou expirado');
        setLoading(false);
        return;
      }

      // Verificar se já foi respondido
      if (response.status === 'completed') {
        setError('Este questionário já foi respondido');
        setLoading(false);
        return;
      }

      setResponseId(response.id);
      setDebugInfo(`Response ID: ${response.id}, Questionnaire ID: ${response.questionnaire_id}`);
      console.log('Response loaded:', response);

      // 2. Buscar dados do questionário separadamente
      const { data: questionnaireData, error: qError } = await supabase
        .from('questionnaires')
        .select('id, title, description, questions')
        .eq('id', response.questionnaire_id)
        .single();

      if (qError) {
        console.error('Questionnaire error:', qError);
        setError('Erro ao carregar questionário');
        setLoading(false);
        return;
      }

      if (!questionnaireData) {
        setError('Questionário não encontrado');
        setLoading(false);
        return;
      }

      console.log('Questionnaire loaded:', questionnaireData);
      console.log('Questions:', questionnaireData.questions);
      setQuestionnaire({
        id: questionnaireData.id,
        title: questionnaireData.title,
        description: questionnaireData.description || '',
        questions: questionnaireData.questions as unknown as Question[]
      });
      setLoading(false);

    } catch (err: any) {
      console.error('Unexpected error:', err);
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

  const validateAnswers = (): boolean => {
    if (!questionnaire) return false;

    for (const question of questionnaire.questions) {
      if (question.required) {
        const answer = answers[question.id];
        
        if (!answer || 
            (Array.isArray(answer) && answer.length === 0) ||
            (typeof answer === 'string' && answer.trim() === '')) {
          setError(`Por favor, responda a pergunta: "${question.question}"`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAnswers()) return;

    setSubmitting(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('questionnaire_responses')
        .update({
          answers: answers,
          status: 'completed',
          completed_at: new Date().toISOString(),
          respondent_name: respondentData.name,
          respondent_phone: respondentData.phone,
          respondent_email: respondentData.email || null
        })
        .eq('id', responseId);

      if (updateError) throw updateError;

      setSuccess(true);

    } catch (err) {
      console.error('Error submitting:', err);
      setError('Erro ao enviar respostas. Tente novamente.');
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
          <p className="text-gray-600 mb-4">{error}</p>
          {debugInfo && (
            <p className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
              Debug: {debugInfo}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Antes de começar...</h2>
              <p className="text-gray-600 mt-2">Por favor, informe seus dados de contato</p>
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
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
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
                  
                  // Aplicar máscara (00) 00000-0000
                  if (phone.length <= 11) {
                    if (phone.length > 10) {
                      phone = phone.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                    } else if (phone.length > 6) {
                      phone = phone.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
                    } else if (phone.length > 2) {
                      phone = phone.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                    } else if (phone.length > 0) {
                      phone = phone.replace(/^(\d*)/, '($1');
                    }
                  }
                  
                  setRespondentData({...respondentData, phone});
                }}
                placeholder="(00) 00000-0000"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
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
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                />
              </div>

            <button
              onClick={() => {
                // Validação rigorosa
                if (!respondentData.name || respondentData.name.trim().length < 3) {
                  setValidationError('Por favor, informe seu nome completo (mínimo 3 caracteres)');
                  return;
                }
                
                if (!respondentData.phone || respondentData.phone.replace(/\D/g, '').length < 10) {
                  setValidationError('Por favor, informe um telefone válido com DDD');
                  return;
                }
                
                setValidationError('');
                setStep('questions');
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-600"
            >
              Continuar para o Questionário
            </button>

            {validationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 mt-2">
                {validationError}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Respostas Enviadas!</h2>
          <p className="text-gray-600">
            Obrigado por responder o questionário. O nutricionista vai analisar suas respostas em breve.
          </p>
        </div>
      </div>
    );
  }

  console.log('Rendering questionnaire:', questionnaire);
  console.log('Questions:', questionnaire?.questions);

  if (!questionnaire || !questionnaire.questions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Questionário Vazio</h2>
          <p className="text-gray-600">Este questionário não possui perguntas.</p>
          {debugInfo && (
            <p className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
              Debug: {debugInfo}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{questionnaire?.title}</h1>
            {questionnaire?.description && (
              <p className="text-green-100">{questionnaire.description}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {questionnaire?.questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <label className="block">
                  <span className="text-gray-900 font-medium text-lg">
                    {index + 1}. {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                  <span className="text-sm text-gray-500 block mt-1">
                    Tipo: {
                      question.type === 'text' ? 'Resposta curta' :
                      question.type === 'textarea' ? 'Resposta longa' :
                      question.type === 'radio' ? 'Múltipla escolha' :
                      question.type === 'checkbox' ? 'Caixas de seleção' :
                      'Escala (1-10)'
                    }
                  </span>
                </label>

                {/* Text */}
                {question.type === 'text' && (
                  <input
                    type="text"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value, 'text')}
                    placeholder="Resposta curta..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required={question.required}
                  />
                )}

                {/* Textarea */}
                {question.type === 'textarea' && (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value, 'textarea')}
                    placeholder="Resposta longa..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required={question.required}
                  />
                )}

                {/* Radio */}
                {question.type === 'radio' && (
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value, 'radio')}
                          className="w-4 h-4 text-green-600"
                          required={question.required}
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Checkbox */}
                {question.type === 'checkbox' && (
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          value={option}
                          checked={(answers[question.id] || []).includes(option)}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value, 'checkbox')}
                          className="w-4 h-4 text-green-600 rounded"
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Scale */}
                {question.type === 'scale' && (
                  <div>
                    <div className="flex justify-between mb-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleAnswerChange(question.id, num, 'scale')}
                          className={`w-10 h-10 rounded-full font-semibold transition ${
                            answers[question.id] === num
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 (Baixo)</span>
                      <span>10 (Alto)</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Respostas'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
