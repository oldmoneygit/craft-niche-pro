import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle, Check, Plus, 
  ChevronLeft, ChevronRight, X as XIcon
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { AgendamentosStatCard } from '@/components/agendamentos/AgendamentosStatCard';
import { AgendamentoModal } from '@/components/agendamentos/AgendamentoModal';
import { toast } from 'sonner';
import './Agendamentos.css';

interface Appointment {
  id: string;
  client_id: string;
  datetime: string;
  type: string;
  status: string;
  value: number;
  notes: string;
  clients: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
}

export function Agendamentos() {
  const { tenantId } = useTenantId();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Query appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', tenantId, currentMonth],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients (
            id,
            name,
            phone,
            email
          )
        `)
        .eq('tenant_id', tenantId)
        .gte('datetime', monthStart.toISOString())
        .lte('datetime', monthEnd.toISOString())
        .order('datetime', { ascending: true });
      
      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!tenantId
  });

  // Stats
  const stats = useMemo(() => {
    if (!appointments) return { total: 0, today: 0, confirmed: 0, completed: 0 };
    
    const today = new Date();
    return {
      total: appointments.length,
      today: appointments.filter(apt => isSameDay(new Date(apt.datetime), today)).length,
      confirmed: appointments.filter(apt => apt.status === 'confirmado').length,
      completed: appointments.filter(apt => apt.status === 'realizado').length
    };
  }, [appointments]);

  // Appointments for selected day
  const dayAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter(apt => isSameDay(new Date(apt.datetime), selectedDate))
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  }, [appointments, selectedDate]);

  // Calendar days
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentMonth]);

  // Mutations
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Status atualizado!');
    }
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Consulta cancelada');
    }
  });

  const getAppointmentsForDay = (day: Date) => {
    return appointments?.filter(apt => isSameDay(new Date(apt.datetime), day)) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'realizado': return '#10b981';
      case 'confirmado': return '#3b82f6';
      case 'cancelado': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  return (
    <div className="agendamentos-page">
      {/* Header */}
      <div className="appointments-header">
        <div className="header-content">
          <h1>
            <CalendarIcon size={32} />
            Agendamentos
          </h1>
          <p>Gerencie suas consultas e agendamentos</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <AgendamentosStatCard
          label="Total Agendamentos"
          value={stats.total}
          icon={<CalendarIcon size={20} />}
          variant="total"
        />
        <AgendamentosStatCard
          label="Hoje"
          value={stats.today}
          icon={<Clock size={20} />}
          variant="today"
        />
        <AgendamentosStatCard
          label="Confirmados"
          value={stats.confirmed}
          icon={<CheckCircle size={20} />}
          variant="confirmed"
        />
        <AgendamentosStatCard
          label="Realizados"
          value={stats.completed}
          icon={<Check size={20} />}
          variant="completed"
        />
      </div>

      {/* Main Content */}
      <div className="appointments-content">
        {/* Calendar */}
        <div className="calendar-section">
          <div className="calendar-container">
            <div className="calendar-header">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft size={20} />
              </button>
              <h3>{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h3>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="calendar-grid">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="calendar-weekday">{day}</div>
              ))}
              
              {monthDays.map(day => {
                const dayApts = getAppointmentsForDay(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);
                
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isCurrentDay ? 'today' : ''}`}
                  >
                    <span className="day-number">{format(day, 'd')}</span>
                    {dayApts.length > 0 && (
                      <div className="appointment-dots">
                        {dayApts.slice(0, 3).map((apt) => (
                          <div
                            key={apt.id}
                            className="appointment-dot"
                            style={{ backgroundColor: getStatusColor(apt.status) }}
                          />
                        ))}
                        {dayApts.length > 3 && (
                          <span className="more-count">+{dayApts.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day Appointments List */}
        <div className="day-appointments-section">
          <h3 className="day-title">
            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </h3>

          {isLoading ? (
            <div className="loading-state">Carregando...</div>
          ) : dayAppointments.length === 0 ? (
            <div className="empty-state">
              <CalendarIcon size={48} />
              <p>Nenhuma consulta agendada para este dia</p>
            </div>
          ) : (
            <div className="appointments-list">
              {dayAppointments.map((apt) => (
                <div key={apt.id} className={`appointment-card status-${apt.status}`}>
                  <div className="appointment-time">
                    {format(new Date(apt.datetime), 'HH:mm')}
                  </div>
                  
                  <div className="appointment-info">
                    <h4 className="client-name">{apt.clients.name}</h4>
                    <p className="appointment-type">{apt.type}</p>
                  </div>
                  
                  <span className={`status-badge ${apt.status}`}>
                    {apt.status === 'agendado' ? 'Agendado' :
                     apt.status === 'confirmado' ? 'Confirmado' :
                     apt.status === 'realizado' ? 'Realizado' : 'Cancelado'}
                  </span>
                  
                  <div className="appointment-actions">
                    {apt.status === 'agendado' && (
                      <button 
                        className="action-btn btn-confirm"
                        onClick={() => updateStatus.mutate({ id: apt.id, status: 'confirmado' })}
                      >
                        <Check size={16} />
                      </button>
                    )}
                    {apt.status === 'confirmado' && (
                      <button 
                        className="action-btn btn-complete"
                        onClick={() => updateStatus.mutate({ id: apt.id, status: 'realizado' })}
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button 
                      className="action-btn btn-edit"
                      onClick={() => handleEdit(apt)}
                    >
                      Editar
                    </button>
                    <button 
                      className="action-btn btn-cancel"
                      onClick={() => deleteAppointment.mutate(apt.id)}
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AgendamentoModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        appointment={editingAppointment}
      />
    </div>
  );
}
