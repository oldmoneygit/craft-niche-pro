import { X, Calendar, User, Phone, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'today' | 'month' | 'pending' | 'inactive';
  data: any[];
}

export function DashboardDetailsModal({ isOpen, onClose, title, type, data }: DashboardDetailsModalProps) {
  if (!isOpen) return null;

  const renderContent = () => {
    if (data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Nenhum registro encontrado
          </p>
        </div>
      );
    }

    switch (type) {
      case 'today':
        return data.map((appointment) => (
          <div
            key={appointment.id}
            style={{
              padding: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              {appointment.client_name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {appointment.client_name || 'Cliente'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} />
                {format(new Date(appointment.datetime), "HH:mm", { locale: ptBR })} - {appointment.type}
              </div>
            </div>
            <div
              style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                background: appointment.status === 'confirmado' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: appointment.status === 'confirmado' ? '#3b82f6' : '#f59e0b'
              }}
            >
              {appointment.status}
            </div>
          </div>
        ));

      case 'month':
        return data.map((client) => (
          <div
            key={client.id}
            style={{
              padding: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              {client.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {client.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} />
                {client.phone || 'Sem telefone'}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </div>
          </div>
        ));

      case 'pending':
        return data.map((appointment) => (
          <div
            key={appointment.id}
            style={{
              padding: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              {appointment.client_name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {appointment.client_name || 'Cliente'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={14} />
                {format(new Date(appointment.datetime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            </div>
          </div>
        ));

      case 'inactive':
        return data.map((client) => (
          <div
            key={client.id}
            style={{
              padding: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              {client.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {client.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} />
                {client.phone || 'Sem telefone'}
              </div>
            </div>
            {client.lastAppointment && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Última: {format(new Date(client.lastAppointment), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            )}
          </div>
        ));

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-primary)',
          borderRadius: '20px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <X size={20} style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1
          }}
        >
          {renderContent()}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
