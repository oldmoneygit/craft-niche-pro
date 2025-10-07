import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AgendamentoCalendarProps {
  selectedDate: Date;
  selectedTime: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
}

export const AgendamentoCalendar: React.FC<AgendamentoCalendarProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange
}) => {
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const unavailableSlots = ['08:00', '15:00'];
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Calendar */}
      <div>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: isDark ? 'var(--text-primary-light)' : 'var(--text-primary)',
            marginBottom: '8px',
            display: 'block'
          }}
        >
          Selecione a Data
        </label>
        <div
          style={{
            background: isDark ? 'var(--text-primary)' : 'var(--bg-white)',
            border: isDark ? '1px solid var(--border-dark)' : '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}
          >
            <span
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: isDark ? 'var(--text-primary-light)' : 'var(--text-primary)'
              }}
            >
              Outubro 2025
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isDark ? '#0a0a0a' : 'var(--text-primary-light)',
                  border: isDark ? '1px solid var(--border-dark)' : '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) (svg as SVGElement).style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? '#0a0a0a' : 'var(--text-primary-light)';
                  e.currentTarget.style.borderColor = isDark ? 'var(--border-dark)' : 'var(--border)';
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) (svg as SVGElement).style.color = isDark ? '#d4d4d4' : 'var(--border-dark)';
                }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px', color: isDark ? '#d4d4d4' : 'var(--border-dark)' }} />
              </button>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isDark ? '#0a0a0a' : 'var(--text-primary-light)',
                  border: isDark ? '1px solid var(--border-dark)' : '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) (svg as SVGElement).style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? '#0a0a0a' : 'var(--text-primary-light)';
                  e.currentTarget.style.borderColor = isDark ? 'var(--border-dark)' : 'var(--border)';
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) (svg as SVGElement).style.color = isDark ? '#d4d4d4' : 'var(--border-dark)';
                }}
              >
                <ChevronRight style={{ width: '16px', height: '16px', color: isDark ? '#d4d4d4' : 'var(--border-dark)' }} />
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              textAlign: 'center',
              fontSize: '13px'
            }}
          >
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div
                key={day}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isDark ? 'var(--text-muted-light)' : 'var(--text-muted)',
                  padding: '8px 4px'
                }}
              >
                {day}
              </div>
            ))}
            {/* Previous month days */}
            {[29, 30].map((day) => (
              <div
                key={`prev-${day}`}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  fontWeight: 600,
                  color: isDark ? 'var(--text-muted-light)' : 'var(--text-muted)',
                  opacity: 0.3
                }}
              >
                {day}
              </div>
            ))}
            {/* Current month days */}
            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const isSelected = day === 5;
              const hasAppointment = day === 2;

              return (
                <div
                  key={day}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    fontWeight: 600,
                    color: isSelected ? 'white' : (isDark ? '#d4d4d4' : 'var(--border-dark)'),
                    cursor: 'pointer',
                    background: isSelected ? 'var(--primary)' : 'transparent',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = isDark ? '#0a0a0a' : 'var(--text-primary-light)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {day}
                  {hasAppointment && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: 'var(--warning)'
                      }}
                    />
                  )}
                </div>
              );
            })}
            {/* Next month days */}
            {[1, 2].map((day) => (
              <div
                key={`next-${day}`}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  fontWeight: 600,
                  color: isDark ? 'var(--text-muted-light)' : 'var(--text-muted)',
                  opacity: 0.3
                }}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: isDark ? 'var(--text-primary-light)' : 'var(--text-primary)',
            marginBottom: '8px',
            display: 'block'
          }}
        >
          Horários Disponíveis
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          }}
        >
          {timeSlots.map((time) => {
            const isUnavailable = unavailableSlots.includes(time);
            const isSelected = selectedTime === time;

            return (
              <button
                key={time}
                onClick={() => !isUnavailable && onTimeChange(time)}
                disabled={isUnavailable}
                style={{
                  padding: '10px',
                  background: isSelected ? 'var(--primary)' : (isDark ? 'var(--text-primary)' : 'var(--bg-white)'),
                  border: `1px solid ${isSelected ? 'var(--primary)' : (isDark ? 'var(--border-dark)' : 'var(--border)')}`,
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isSelected ? 'white' : (isDark ? '#d4d4d4' : 'var(--border-dark)'),
                  cursor: isUnavailable ? 'not-allowed' : 'pointer',
                  opacity: isUnavailable ? 0.3 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isUnavailable && !isSelected) {
                    e.currentTarget.style.background = isDark ? '#0a0a0a' : 'var(--text-primary-light)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUnavailable && !isSelected) {
                    e.currentTarget.style.background = isDark ? 'var(--text-primary)' : 'var(--bg-white)';
                  }
                }}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
