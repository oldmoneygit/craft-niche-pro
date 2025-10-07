import { Button } from '@/components/ui/button';
import { QuizCard } from './QuizCard';
import type { Question } from '@/pages/QuestionariosBuilder';

interface MobilePreviewProps {
  title: string;
  description: string;
  questions: Question[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
}

export function MobilePreview({
  title,
  description,
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex
}: MobilePreviewProps) {
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  const goNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <p className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
        📱 Preview Mobile
      </p>

      {/* Frame do Celular */}
      <div 
        className="w-full max-w-[420px] mx-auto shadow-2xl"
        style={{
          background: '#1f2937',
          borderRadius: '36px',
          padding: '12px'
        }}
      >
        <div 
          className="flex flex-col"
          style={{
            background: 'white',
            borderRadius: '28px',
            overflow: 'hidden',
            height: '760px'
          }}
        >
          {/* Header Verde */}
          <div 
            style={{
              background: 'var(--primary)',
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
              {title || 'Avaliação de Hábitos Alimentares'}
            </h3>
            <p 
              style={{
                fontSize: '13px',
                opacity: '0.9',
                lineHeight: '1.4'
              }}
            >
              {description || 'Por favor, responda as perguntas sobre seus hábitos alimentares'}
            </p>

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
            {questions.length === 0 ? (
              <div 
                style={{
                  textAlign: 'center',
                  paddingTop: '60px',
                  paddingBottom: '60px',
                  color: 'var(--text-tertiary)'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <p style={{ fontSize: '15px', fontWeight: '500', lineHeight: '1.4' }}>
                  Adicione perguntas para ver o preview
                </p>
              </div>
            ) : (
              <QuizCard question={currentQuestion} index={currentQuestionIndex} />
            )}
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
              onClick={goPrev}
              disabled={currentQuestionIndex === 0}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: currentQuestionIndex === 0 ? '#f3f4f6' : '#f3f4f6',
                color: 'var(--text-secondary)',
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
              onClick={goNext}
              disabled={currentQuestionIndex === questions.length - 1}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: currentQuestionIndex === questions.length - 1 ? 'var(--primary)' : 'var(--primary)',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: currentQuestionIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
                opacity: currentQuestionIndex === questions.length - 1 ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (currentQuestionIndex !== questions.length - 1) {
                  e.currentTarget.style.background = 'var(--primary-dark)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentQuestionIndex !== questions.length - 1) {
                  e.currentTarget.style.background = 'var(--primary)';
                }
              }}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
