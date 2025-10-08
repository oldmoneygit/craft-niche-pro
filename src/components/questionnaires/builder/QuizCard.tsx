import { useState } from 'react';
import type { Question } from '@/pages/QuestionariosBuilder';

interface QuizCardProps {
  question: Question;
  index: number;
}

export function QuizCard({ question, index }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [scaleValue, setScaleValue] = useState<number>(0);

  if (!question) return null;

  return (
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
          {index + 1}
        </span>
        <span>{question.text || 'Digite uma pergunta...'}</span>
      </div>

      {/* Single Choice */}
      {question.type === 'single_choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(question.options || []).map((option, i) => {
            const isSelected = selectedOption === option;
            return (
              <button
                key={i}
                onClick={() => setSelectedOption(option)}
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
                {option || `Opção ${i + 1}`}
              </button>
            );
          })}
        </div>
      )}

      {/* Multiple Choice */}
      {question.type === 'multiple_choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(question.options || []).map((option, i) => {
            const isChecked = selectedOptions.includes(option);
            return (
              <label
                key={i}
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
                  checked={isChecked}
                  onChange={() => {
                    if (isChecked) {
                      setSelectedOptions(selectedOptions.filter(o => o !== option));
                    } else {
                      setSelectedOptions([...selectedOptions, option]);
                    }
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
                  {option || `Opção ${i + 1}`}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {/* Text */}
      {question.type === 'text' && (
        <input
          type="text"
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

      {/* Textarea */}
      {question.type === 'textarea' && (
        <textarea
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

      {/* Number */}
      {question.type === 'number' && (
        <input
          type="number"
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

      {/* Scale */}
      {question.type === 'scale' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map(num => {
              const isSelected = scaleValue === num;
              return (
                <button
                  key={num}
                  onClick={() => setScaleValue(num)}
                  style={{
                    flex: 1,
                    padding: '20px 0',
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
            <span>Discordo totalmente</span>
            <span>Concordo totalmente</span>
          </div>
        </div>
      )}
    </div>
  );
}
