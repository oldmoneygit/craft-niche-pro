import { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle, Check,
  Plus, Edit, Trash2, Phone
} from 'lucide-react';
import { AgendamentosStatCard } from '@/components/agendamentos/AgendamentosStatCard';
import { AgendamentoModal } from '@/components/agendamentos/AgendamentoModal';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <AgendamentosStatCard
          label="Total Agendamentos"
          value={1}
          icon={<CalendarIcon size={20} />}
          variant="total"
        />

        <AgendamentosStatCard
          label="Hoje"
          value={0}
          icon={<Clock size={20} />}
          variant="today"
        />

        <AgendamentosStatCard
          label="Confirmados"
          value={0}
          icon={<CheckCircle size={20} />}
          variant="confirmed"
        />

        <AgendamentosStatCard
          label="Realizados"
          value={0}
          icon={<Check size={20} />}
          variant="completed"
        />
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
      <AgendamentoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
