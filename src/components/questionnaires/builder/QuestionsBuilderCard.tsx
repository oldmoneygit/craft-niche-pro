import { Button } from '@/components/ui/button';
import { QuestionEditor } from './QuestionEditor';
import type { Question } from '@/pages/QuestionariosBuilder';

interface QuestionsBuilderCardProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
}

export function QuestionsBuilderCard({ questions, setQuestions }: QuestionsBuilderCardProps) {
  const addQuestion = (type: Question['type'] = 'single_choice') => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      type: type,
      options: type === 'single_choice' || type === 'multiple_choice' ? [''] : [],
      required: false,
      order_index: questions.length
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    if (confirm('Deseja realmente excluir esta pergunta?')) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = { ...questions[index] };
    questionToDuplicate.id = Date.now().toString();
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, questionToDuplicate);
    setQuestions(newQuestions);
  };

  const moveQuestion = (index: number, direction: number) => {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === questions.length - 1)
    ) return;

    const newQuestions = [...questions];
    const targetIndex = index + direction;
    [newQuestions[index], newQuestions[targetIndex]] =
      [newQuestions[targetIndex], newQuestions[index]];
    setQuestions(newQuestions);
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Perguntas
      </h2>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => addQuestion('text')}
          className="text-sm"
        >
          + Texto Curto
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addQuestion('textarea')}
          className="text-sm"
        >
          + Texto Longo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addQuestion('single_choice')}
          className="text-sm"
        >
          + Múltipla Escolha
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addQuestion('scale')}
          className="text-sm"
        >
          + Escala 1-5
        </Button>
      </div>

      {/* Lista de Perguntas */}
      <div className="space-y-4 mb-6">
        {questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            index={index}
            onUpdate={(updates) => updateQuestion(index, updates)}
            onDelete={() => deleteQuestion(index)}
            onDuplicate={() => duplicateQuestion(index)}
            onMoveUp={() => moveQuestion(index, -1)}
            onMoveDown={() => moveQuestion(index, 1)}
          />
        ))}
      </div>

      {/* Botão Adicionar */}
      <Button
        variant="outline"
        className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        onClick={() => addQuestion()}
      >
        + Adicionar Pergunta
      </Button>
    </div>
  );
}
