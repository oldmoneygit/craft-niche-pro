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
            color: isDark ? '#fafafa' : '#171717',
            marginBottom: '8px',
            display: 'block'
          }}
        >
          Selecione a Data
        </label>
        <div
          style={{
            background: isDark ? '#171717' : '#ffffff',
            border: isDark ? '1px solid #404040' : '1px solid #e5e5e5',
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
                color: isDark ? '#fafafa' : '#171717'
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
                  background: isDark ? '#0a0a0a' : '#fafafa',
                  border: isDark ? '1px solid #404040' : '1px solid #e5e5e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#10b981';
                  e.currentTarget.style.borderColor = '#10b981';
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) (svg as SVGElement).style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? '#0a0a0a' : '#fafafa';
                  e.currentTarget.style.borderColor = isDark ? '#404040' : '#e5e5e5';
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) (svg as SVGElement).style.color = isDark ? '#d4d4d4' : '#404040';
                }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px', color: isDark ? '#d4d4d4' : '#404040' }} />
              </button>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isDark ? '#0a0a0a' : '#fafafa',
                  border: isDark ? '1px solid #404040' : '1px solid #e5e5e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#10b981';
                  e.currentTarget.style.borderColor = '#10b981';
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) (svg as SVGElement).style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? '#0a0a0a' : '#fafafa';
                  e.currentTarget.style.borderColor = isDark ? '#404040' : '#e5e5e5';
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) (svg as SVGElement).style.color = isDark ? '#d4d4d4' : '#404040';
                }}
              >
                <ChevronRight style={{ width: '16px', height: '16px', color: isDark ? '#d4d4d4' : '#404040' }} />
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
                  color: isDark ? '#a3a3a3' : '#737373',
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
                  color: isDark ? '#a3a3a3' : '#737373',
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
                    color: isSelected ? 'white' : (isDark ? '#d4d4d4' : '#404040'),
                    cursor: 'pointer',
                    background: isSelected ? '#10b981' : 'transparent',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = isDark ? '#0a0a0a' : '#fafafa';
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
                        background: '#f59e0b'
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
                  color: isDark ? '#a3a3a3' : '#737373',
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
            color: isDark ? '#fafafa' : '#171717',
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
                  background: isSelected ? '#10b981' : (isDark ? '#171717' : '#ffffff'),
                  border: `1px solid ${isSelected ? '#10b981' : (isDark ? '#404040' : '#e5e5e5')}`,
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isSelected ? 'white' : (isDark ? '#d4d4d4' : '#404040'),
                  cursor: isUnavailable ? 'not-allowed' : 'pointer',
                  opacity: isUnavailable ? 0.3 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isUnavailable && !isSelected) {
                    e.currentTarget.style.background = isDark ? '#0a0a0a' : '#fafafa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUnavailable && !isSelected) {
                    e.currentTarget.style.background = isDark ? '#171717' : '#ffffff';
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
