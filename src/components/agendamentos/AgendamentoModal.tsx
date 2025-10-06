import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  clientName?: string;
}

export const AgendamentoModal: React.FC<AgendamentoModalProps> = ({ 
  isOpen, 
  onClose,
  clientId: preselectedClientId,
  clientName: preselectedClientName
}) => {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [clientId, setClientId] = useState<string>(preselectedClientId || '');
  const [appointmentType, setAppointmentType] = useState<string>('primeira_consulta');
  const [notes, setNotes] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');

  // Fetch clients for dropdown
  const { data: clients } = useQuery({
    queryKey: ['clients', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !preselectedClientId
  });

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async () => {
      if (!tenantId || !clientId) throw new Error('Tenant ID ou Cliente não selecionado');

      const datetime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      datetime.setHours(parseInt(hours), parseInt(minutes));

      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          tenant_id: tenantId,
          client_id: clientId,
          datetime: datetime.toISOString(),
          type: appointmentType,
          notes: notes || null,
          value: value ? parseFloat(value) : null,
          payment_status: paymentStatus,
          status: 'agendado'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Agendamento criado!',
        description: `Consulta agendada para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${selectedTime}`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar agendamento',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast({
        title: 'Cliente não selecionado',
        description: 'Por favor, selecione um cliente',
        variant: 'destructive',
      });
      return;
    }
    createAppointment.mutate();
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  const inputStyle: React.CSSProperties = {
    padding: '12px 16px',
    border: isDark ? '1px solid #404040' : '1px solid #e5e5e5',
    borderRadius: '10px',
    background: isDark ? '#171717' : '#ffffff',
    color: isDark ? '#fafafa' : '#171717',
    fontSize: '14px',
    fontFamily: 'inherit',
    width: '100%'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: isDark ? '#fafafa' : '#171717',
    marginBottom: '8px',
    display: 'block'
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        padding: '24px',
        overflowY: 'auto',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          background: isDark 
            ? 'rgba(38, 38, 38, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: isDark 
            ? '1px solid #404040' 
            : '1px solid #e5e5e5',
          borderRadius: '24px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: isDark 
            ? '0 24px 48px rgba(0, 0, 0, 0.5)' 
            : '0 24px 48px rgba(0, 0, 0, 0.12)'
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div
            style={{
              padding: '24px',
              borderBottom: isDark 
                ? '1px solid #404040' 
                : '1px solid #e5e5e5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: isDark ? '#fafafa' : '#171717',
                  marginBottom: '4px'
                }}
              >
                Novo Agendamento
              </h2>
              {preselectedClientName && (
                <p style={{ 
                  fontSize: '14px', 
                  color: 'var(--text-muted)' 
                }}>
                  Cliente: <strong>{preselectedClientName}</strong>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: isDark ? '#171717' : '#ffffff',
                border: isDark 
                  ? '1px solid #404040' 
                  : '1px solid #e5e5e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? '#171717' : '#ffffff';
                e.currentTarget.style.borderColor = isDark ? '#404040' : '#e5e5e5';
              }}
            >
              <X style={{ 
                width: '20px', 
                height: '20px', 
                color: 'white' 
              }} />
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px'
            }}
          >
            {/* Calendar & Time */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Data da Consulta *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      style={{
                        ...inputStyle,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <span>{format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                      <CalendarIcon style={{ width: '16px', height: '16px', opacity: 0.5 }} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0" 
                    align="start"
                    style={{
                      background: isDark ? '#171717' : '#ffffff',
                      border: isDark ? '1px solid #404040' : '1px solid #e5e5e5',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      zIndex: 9999
                    }}
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label style={labelStyle}>Horário *</label>
                <select 
                  style={inputStyle}
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!preselectedClientId && (
                <div>
                  <label style={labelStyle}>Cliente *</label>
                  <select 
                    style={inputStyle}
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clients?.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={labelStyle}>Tipo de Consulta *</label>
                <select 
                  style={inputStyle}
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  required
                >
                  <option value="primeira_consulta">Primeira Consulta</option>
                  <option value="retorno">Retorno</option>
                  <option value="revisao">Revisão de Plano</option>
                  <option value="avaliacao">Avaliação</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Valor da Consulta (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  style={inputStyle}
                  placeholder="0,00"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>Status do Pagamento</label>
                <select 
                  style={inputStyle}
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="partially_paid">Parcialmente Pago</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Observações</label>
                <textarea
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                  placeholder="Observações sobre a consulta..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '24px',
              borderTop: isDark 
                ? '1px solid #404040' 
                : '1px solid #e5e5e5',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: isDark 
                  ? '1px solid #404040' 
                  : '1px solid #e5e5e5',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: isDark ? '#d4d4d4' : '#404040',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createAppointment.isPending}
              style={{
                padding: '12px 32px',
                background: createAppointment.isPending ? '#737373' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                cursor: createAppointment.isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}
              onMouseEnter={(e) => {
                if (!createAppointment.isPending) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.25)';
              }}
            >
              {createAppointment.isPending ? 'Criando...' : 'Criar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
