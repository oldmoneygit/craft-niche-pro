import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle, Check, Plus, 
  ChevronLeft, ChevronRight, X as XIcon, ArrowRight
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

  // Next upcoming appointments
  const nextAppointments = useMemo(() => {
    if (!appointments) return [];
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.datetime) >= now && apt.status !== 'cancelado')
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
      .slice(0, 5);
  }, [appointments]);

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
      case 'realizado': return 'var(--primary)';
      case 'confirmado': return 'var(--secondary)';
      case 'cancelado': return 'var(--destructive)';
      default: return 'var(--warning)';
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
          {/* Mini Stats */}
          <div className="calendar-mini-stats">
            <div className="mini-stat">
              <span className="mini-stat-value" style={{ color: 'var(--warning)' }}>{stats.today}</span>
              <span className="mini-stat-label">Hoje</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-value" style={{ color: 'var(--secondary)' }}>{stats.confirmed}</span>
              <span className="mini-stat-label">Confirm.</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-value" style={{ color: 'var(--primary)' }}>{stats.completed}</span>
              <span className="mini-stat-label">Realiz.</span>
            </div>
          </div>

          <div className="calendar-container">
            <div className="calendar-header">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft size={18} />
              </button>
              <h3>{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h3>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="calendar-grid">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                <div key={`${day}-${idx}`} className="calendar-weekday">{day}</div>
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
                        {dayApts.slice(0, 2).map((apt) => (
                          <div
                            key={apt.id}
                            className="appointment-dot"
                            style={{ backgroundColor: getStatusColor(apt.status) }}
                          />
                        ))}
                        {dayApts.length > 2 && (
                          <span className="more-count">+{dayApts.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Appointments */}
          {nextAppointments.length > 0 && (
            <div className="next-appointments-section">
              <div className="next-appointments-title">
                <ArrowRight size={14} />
                Próximas Consultas
              </div>
              {nextAppointments.map((apt) => (
                <div key={apt.id} className="next-appointment-item">
                  <div className="next-appointment-date">
                    <div className="next-appointment-day">
                      {format(new Date(apt.datetime), 'd')}
                    </div>
                    <div className="next-appointment-month">
                      {format(new Date(apt.datetime), 'MMM', { locale: ptBR })}
                    </div>
                  </div>
                  <div className="next-appointment-details">
                    <div className="next-appointment-client">{apt.clients.name}</div>
                    <div className="next-appointment-time">
                      {format(new Date(apt.datetime), "EEE, HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                  <span className={`status-badge ${apt.status}`} style={{ fontSize: '9px', padding: '3px 8px' }}>
                    {apt.status === 'agendado' ? 'Agendado' : 'Confirmado'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Day Appointments List */}
        <div className="day-appointments-section">
          <div className="section-header-appointments">
            <h3 className="day-title">
              {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </h3>
            <span style={{ 
              fontSize: '13px', 
              color: 'hsl(var(--muted-foreground))',
              fontWeight: 500
            }}>
              {dayAppointments.length} {dayAppointments.length === 1 ? 'consulta' : 'consultas'}
            </span>
          </div>

          {/* Summary Cards */}
          <div className="appointments-summary">
            <div className="summary-card">
              <span className="summary-card-value">{appointments?.length || 0}</span>
              <span className="summary-card-label">Total do Mês</span>
            </div>
            <div className="summary-card">
              <span className="summary-card-value" style={{ color: 'var(--secondary)' }}>
                {appointments?.filter(a => a.status === 'confirmado').length || 0}
              </span>
              <span className="summary-card-label">Confirmados</span>
            </div>
            <div className="summary-card">
              <span className="summary-card-value" style={{ color: 'var(--warning)' }}>
                {appointments?.filter(a => a.status === 'agendado').length || 0}
              </span>
              <span className="summary-card-label">Pendentes</span>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">Carregando...</div>
          ) : dayAppointments.length === 0 ? (
            <div className="empty-state">
              <CalendarIcon size={48} />
              <p>Nenhuma consulta agendada para este dia</p>
            </div>
          ) : (
            <div className="appointments-scroll">
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
