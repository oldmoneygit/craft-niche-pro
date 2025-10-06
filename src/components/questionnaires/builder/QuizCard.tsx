import { useState } from 'react';
import type { Question } from '@/pages/QuestionariosBuilder';

interface QuizCardProps {
  question: Question;
  index: number;
}

export function QuizCard({ question, index }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!question) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="text-lg font-bold text-gray-900 mb-5 flex items-start">
        <span className="flex-shrink-0 w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
          {index + 1}
        </span>
        <span>{question.text || 'Digite uma pergunta...'}</span>
      </div>

      {/* Single Choice */}
      {question.type === 'single_choice' && (
        <div className="space-y-3">
          {(question.options || []).map((option, i) => (
            <button
              key={i}
              onClick={() => setSelectedOption(option)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedOption === option
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                  : 'border-gray-200 bg-white hover:border-emerald-500'
              }`}
            >
              {option || `Opção ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Multiple Choice */}
      {question.type === 'multiple_choice' && (
        <div className="space-y-3">
          {(question.options || []).map((option, i) => (
            <label
              key={i}
              className="flex items-center p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-emerald-500 transition-all"
            >
              <input
                type="checkbox"
                className="w-5 h-5 text-emerald-500 rounded mr-3"
              />
              <span>{option || `Opção ${i + 1}`}</span>
            </label>
          ))}
        </div>
      )}

      {/* Text */}
      {question.type === 'text' && (
        <input
          type="text"
          placeholder="Digite sua resposta..."
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring focus:ring-emerald-200"
        />
      )}

      {/* Textarea */}
      {question.type === 'textarea' && (
        <textarea
          placeholder="Digite sua resposta..."
          rows={5}
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring focus:ring-emerald-200 resize-none"
        />
      )}

      {/* Number */}
      {question.type === 'number' && (
        <input
          type="number"
          placeholder="0"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring focus:ring-emerald-200"
        />
      )}

      {/* Scale */}
      {question.type === 'scale' && (
        <div>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                className="flex-1 py-4 rounded-xl border-2 border-gray-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 font-bold transition-all"
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Discordo totalmente</span>
            <span>Concordo totalmente</span>
          </div>
        </div>
      )}
    </div>
  );
}
