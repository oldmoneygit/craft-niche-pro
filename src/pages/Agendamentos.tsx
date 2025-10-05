import { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle, Check,
  Plus, Edit, Trash2, Phone, ChevronLeft, ChevronRight,
  X, Lightbulb
} from 'lucide-react';
import './Agendamentos.css';

type AppointmentStatus = 'pending' | 'confirmed' | 'completed';

interface Appointment {
  id: string;
  client: string;
  type: string;
  date: string;
  time: string;
  phone: string;
  status: AppointmentStatus;
}

export function Agendamentos() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(5);
  const [selectedTime, setSelectedTime] = useState('10:00');

  const appointments: Appointment[] = [
    {
      id: '1',
      client: 'MARCÃO DA MASSA',
      type: 'Primeira Consulta',
      date: '02/10/2025',
      time: '14:00',
      phone: '19981661010',
      status: 'pending'
    }
  ];

  const stats = [
    { label: 'Total Agendamentos', value: '1', icon: CalendarIcon, variant: 'total' },
    { label: 'Hoje', value: '0', icon: Clock, variant: 'today' },
    { label: 'Confirmados', value: '0', icon: CheckCircle, variant: 'confirmed' },
    { label: 'Realizados', value: '0', icon: Check, variant: 'completed' }
  ];

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const unavailableSlots = ['08:00', '15:00'];

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleDayClick = (day: number) => {
    if (day > 0 && day <= 31) {
      setSelectedDate(day);
    }
  };

  const handleTimeClick = (time: string) => {
    if (!unavailableSlots.includes(time)) {
      setSelectedTime(time);
    }
  };

  const handleEdit = (id: string) => {
    console.log('Edit:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete:', id);
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
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <Plus size={18} />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card ${stat.variant}`}>
              <div className="stat-top">
                <span className="stat-label">{stat.label}</span>
                <div className="stat-icon">
                  <Icon size={22} />
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Appointments List */}
      <div className="appointments-section">
        <div className="section-header">
          <h2 className="section-title">Próximos Agendamentos</h2>
          <div className="filter-tabs">
            <button className="tab active">Todos</button>
            <button className="tab">Pendentes</button>
            <button className="tab">Confirmados</button>
          </div>
        </div>

        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className={`appointment-card ${appointment.status}`}>
              <div className="appointment-header">
                <div>
                  <div className="appointment-client">{appointment.client}</div>
                  <span className="appointment-type">{appointment.type}</span>
                </div>
                <span className={`appointment-status status-${appointment.status}`}>
                  {appointment.status === 'pending' ? 'Agendado' : 
                   appointment.status === 'confirmed' ? 'Confirmado' : 'Realizado'}
                </span>
              </div>

              <div className="appointment-info">
                <div className="info-item">
                  <CalendarIcon size={16} />
                  <span>{appointment.date}</span>
                </div>
                <div className="info-item">
                  <Clock size={16} />
                  <span>{appointment.time}</span>
                </div>
                <div className="info-item">
                  <Phone size={16} />
                  <span>{appointment.phone}</span>
                </div>
              </div>

              <div className="appointment-actions">
                <button className="action-btn btn-edit" onClick={() => handleEdit(appointment.id)}>
                  <Edit size={16} />
                  Editar
                </button>
                <button className="action-btn btn-delete" onClick={() => handleDelete(appointment.id)}>
                  <Trash2 size={16} />
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal active" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Novo Agendamento</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            {/* AI Suggestion */}
            <div className="ai-suggestion">
              <div className="ai-suggestion-icon">
                <Lightbulb size={20} />
              </div>
              <div className="ai-suggestion-content">
                <h4>Sugestão da IA</h4>
                <p>Seu horário mais próximo disponível é <strong>dia 10 às 13h30</strong>. <a href="#appointments">Verifique suas consultas agendadas aqui</a>.</p>
              </div>
            </div>

            <div className="modal-body">
              {/* Calendar Section */}
              <div className="calendar-section">
                <div className="form-group">
                  <label className="form-label">Selecione a Data</label>
                  <div className="calendar">
                    <div className="calendar-header">
                      <span className="calendar-month">Outubro 2025</span>
                      <div className="calendar-nav">
                        <button className="nav-btn">
                          <ChevronLeft size={16} />
                        </button>
                        <button className="nav-btn">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="calendar-grid">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                        <div key={day} className="calendar-day-label">{day}</div>
                      ))}
                      {[29, 30].map((day) => (
                        <div key={`prev-${day}`} className="calendar-day other-month">{day}</div>
                      ))}
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <div
                          key={day}
                          className={`calendar-day ${day === 5 ? 'today' : ''} ${
                            selectedDate === day ? 'selected' : ''
                          } ${day === 2 ? 'has-appointment' : ''}`}
                          onClick={() => handleDayClick(day)}
                        >
                          {day}
                        </div>
                      ))}
                      {[1, 2].map((day) => (
                        <div key={`next-${day}`} className="calendar-day other-month">{day}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Horários Disponíveis</label>
                  <div className="time-slots">
                    {timeSlots.map((time) => (
                      <div
                        key={time}
                        className={`time-slot ${selectedTime === time ? 'selected' : ''} ${
                          unavailableSlots.includes(time) ? 'unavailable' : ''
                        }`}
                        onClick={() => handleTimeClick(time)}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">Cliente *</label>
                  <select className="form-select">
                    <option>Selecione um cliente</option>
                    <option>Pamela Nascimento</option>
                    <option>MARCÃO DA MASSA</option>
                    <option>Jeferson de Lima</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Consulta *</label>
                  <select className="form-select">
                    <option>Primeira Consulta</option>
                    <option>Retorno</option>
                    <option>Revisão de Plano</option>
                    <option>Avaliação</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Observações</label>
                  <textarea className="form-textarea" placeholder="Observações sobre a consulta..."></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Valor da Consulta</label>
                  <input type="text" className="form-input" placeholder="R$ 0,00" />
                </div>

                <div className="form-group">
                  <label className="form-label">Status do Pagamento</label>
                  <select className="form-select">
                    <option>Pendente</option>
                    <option>Pago</option>
                    <option>Parcelado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>Cancelar</button>
              <button className="btn-submit">Criar Agendamento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
