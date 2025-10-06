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
      <div className="w-full max-w-[420px] mx-auto bg-gray-900 rounded-[36px] p-3 shadow-2xl">
        <div className="bg-white rounded-[28px] overflow-hidden h-[760px] flex flex-col">
          {/* Header */}
          <div className="bg-emerald-500 text-white p-5 text-center">
            <h3 className="text-lg font-bold mb-2">
              {title || 'Título do Questionário'}
            </h3>
            <p className="text-sm opacity-90">
              {description || 'Responda as perguntas com atenção'}
            </p>

            {/* Progress Bar */}
            <div className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {questions.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-sm font-medium">
                  Adicione perguntas para ver o preview
                </p>
              </div>
            ) : (
              <QuizCard question={currentQuestion} index={currentQuestionIndex} />
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-gray-200 flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={goPrev}
              disabled={currentQuestionIndex === 0}
            >
              Voltar
            </Button>
            <Button
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              onClick={goNext}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
