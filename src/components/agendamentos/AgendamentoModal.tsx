import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  clientName?: string;
  leadData?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    preferred_time_description?: string;
    preferred_datetime?: string;
  };
  appointment?: any;
}

export const AgendamentoModal: React.FC<AgendamentoModalProps> = ({ 
  isOpen, 
  onClose,
  clientId: preselectedClientId,
  clientName: preselectedClientName,
  leadData,
  appointment
}) => {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Parse preferred time from lead or appointment
  const suggestedDateTime = React.useMemo(() => {
    if (appointment?.datetime) {
      const aptDate = new Date(appointment.datetime);
      const time = `${aptDate.getHours().toString().padStart(2, '0')}:${aptDate.getMinutes().toString().padStart(2, '0')}`;
      return { date: aptDate, time };
    }
    
    if (leadData?.preferred_datetime) {
      const preferredDate = new Date(leadData.preferred_datetime);
      const time = `${preferredDate.getHours().toString().padStart(2, '0')}:${preferredDate.getMinutes().toString().padStart(2, '0')}`;
      return { date: preferredDate, time };
    }
    
    return { date: new Date(), time: '10:00' };
  }, [leadData, appointment]);
  
  const [selectedDate, setSelectedDate] = useState<Date>(suggestedDateTime.date);
  const [selectedTime, setSelectedTime] = useState<string>(suggestedDateTime.time);
  const [clientId, setClientId] = useState<string>(preselectedClientId || appointment?.client_id || '');
  const [appointmentType, setAppointmentType] = useState<string>(appointment?.type || 'primeira_consulta');
  const [notes, setNotes] = useState<string>(
    appointment?.notes || 
    (leadData?.preferred_time_description ? `Preferência: ${leadData.preferred_time_description}` : '')
  );
  const [value, setValue] = useState<string>(appointment?.value?.toString() || '');
  const [paymentStatus, setPaymentStatus] = useState<string>(appointment?.payment_status || 'pending');
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  // Reset state when appointment changes
  useEffect(() => {
    if (appointment) {
      const aptDate = new Date(appointment.datetime);
      setSelectedDate(aptDate);
      
      const hours = aptDate.getHours().toString().padStart(2, '0');
      const minutes = aptDate.getMinutes().toString().padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
      
      setClientId(appointment.client_id);
      setAppointmentType(appointment.type);
      setNotes(appointment.notes || '');
      setValue(appointment.value?.toString() || '');
      setPaymentStatus(appointment.payment_status || 'pending');
    }
  }, [appointment]);

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
    enabled: !!tenantId && !preselectedClientId && !leadData && !appointment
  });

  // Auto-create or find client from lead data
  useEffect(() => {
    if (!leadData || !tenantId || clientId || appointment) return;
    
    const findOrCreateClient = async () => {
      setIsCreatingClient(true);
      
      try {
        const { data: existingClients, error: searchError } = await supabase
          .from('clients')
          .select('id, name')
          .eq('tenant_id', tenantId)
          .eq('phone', leadData.phone.replace(/\D/g, ''));
        
        if (searchError) throw searchError;
        
        if (existingClients && existingClients.length > 0) {
          setClientId(existingClients[0].id);
          toast({
            title: 'Cliente encontrado!',
            description: `Cliente "${existingClients[0].name}" já existe no sistema`,
          });
        } else {
          const { data: newClient, error: createError } = await supabase
            .from('clients')
            .insert([{
              tenant_id: tenantId,
              name: leadData.name,
              phone: leadData.phone,
              email: leadData.email || null,
              notes: leadData.preferred_time_description ? `Preferência: ${leadData.preferred_time_description}` : null
            }])
            .select('id, name')
            .single();
          
          if (createError) throw createError;
          
          setClientId(newClient.id);
          toast({
            title: 'Cliente criado!',
            description: `Novo cliente "${newClient.name}" adicionado ao sistema`,
          });
        }
      } catch (error: any) {
        toast({
          title: 'Erro ao processar cliente',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsCreatingClient(false);
      }
    };
    
    findOrCreateClient();
  }, [leadData, tenantId, clientId, toast, appointment]);

  // Create or Update appointment mutation
  const saveAppointment = useMutation({
    mutationFn: async () => {
      if (!tenantId || !clientId) throw new Error('Tenant ID ou Cliente não selecionado');

      const datetime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      datetime.setHours(parseInt(hours), parseInt(minutes));

      const payload = {
        tenant_id: tenantId,
        client_id: clientId,
        datetime: datetime.toISOString(),
        type: appointmentType,
        notes: notes || null,
        value: value ? parseFloat(value) : null,
        payment_status: paymentStatus,
        status: appointment?.status || 'agendado'
      };

      if (appointment?.id) {
        const { data, error } = await supabase
          .from('appointments')
          .update(payload)
          .eq('id', appointment.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('appointments')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      
      if (leadData?.id && !appointment) {
        try {
          await supabase
            .from('leads')
            .update({ status: 'scheduled' })
            .eq('id', leadData.id);
          
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        } catch (error) {
          console.error('Error updating lead status:', error);
        }
      }
      
      toast({
        title: appointment ? 'Agendamento atualizado!' : 'Agendamento criado!',
        description: `Consulta ${appointment ? 'atualizada' : 'agendada'} para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${selectedTime}`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: appointment ? 'Erro ao atualizar agendamento' : 'Erro ao criar agendamento',
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
    saveAppointment.mutate();
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
    border: isDark ? '1px solid var(--border-dark)' : '1px solid var(--border)',
    borderRadius: '10px',
    background: isDark ? 'var(--text-primary)' : 'var(--bg-white)',
    color: isDark ? 'var(--text-primary-light)' : 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'inherit',
    width: '100%'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: isDark ? 'var(--text-primary-light)' : 'var(--text-primary)',
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
            ? '1px solid var(--border-dark)' 
            : '1px solid var(--border)',
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
                ? '1px solid var(--border-dark)' 
                : '1px solid var(--border)',
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
                  color: isDark ? 'var(--text-primary-light)' : 'var(--text-primary)',
                  marginBottom: '4px'
                }}
              >
                {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h2>
              {(preselectedClientName || leadData) && (
                <p style={{ 
                  fontSize: '14px', 
                  color: isDark ? 'var(--text-muted-light)' : 'var(--text-muted)'
                }}>
                  Cliente: <strong>{preselectedClientName || leadData?.name}</strong>
                  {isCreatingClient && ' (processando...)'}
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
                background: 'var(--destructive)',
                border: '1px solid var(--destructive)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--destructive)';
                e.currentTarget.style.borderColor = 'var(--destructive)';
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
                      background: isDark ? 'var(--text-primary)' : 'var(--bg-white)',
                      border: isDark ? '1px solid var(--border-dark)' : '1px solid var(--border)',
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
              {!preselectedClientId && !leadData && !appointment && (
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
                ? '1px solid var(--border-dark)' 
                : '1px solid var(--border)',
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
                  ? '1px solid var(--border-dark)' 
                  : '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: isDark ? '#d4d4d4' : 'var(--border-dark)',
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
              disabled={saveAppointment.isPending || isCreatingClient || !clientId}
              style={{
                padding: '12px 32px',
                background: (saveAppointment.isPending || isCreatingClient) ? 'var(--text-muted)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                cursor: (saveAppointment.isPending || isCreatingClient || !clientId) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}
              onMouseEnter={(e) => {
                if (!saveAppointment.isPending && !isCreatingClient && clientId) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.25)';
              }}
            >
              {isCreatingClient ? 'Processando cliente...' : 
               saveAppointment.isPending ? 'Salvando...' : 
               appointment ? 'Atualizar Agendamento' : 'Criar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
