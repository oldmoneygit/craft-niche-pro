import { useState } from 'react';
import { X, User, Mail, Phone, Calendar, Activity, Target, Ruler, Weight } from 'lucide-react';
import { ClientWithStats } from '@/hooks/useClientsData';
import { format } from 'date-fns';

interface ClientDetailsModalProps {
  client: ClientWithStats;
  onClose: () => void;
}

export function ClientDetailsModal({ client, onClose }: ClientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('info');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const goalLabels: Record<string, string> = {
    weight_loss: 'Perda de Peso',
    muscle_gain: 'Ganho de Massa',
    maintenance: 'Manutenção',
    health: 'Saúde'
  };

  const activityLabels: Record<string, string> = {
    sedentary: 'Sedentário',
    light: 'Leve',
    moderate: 'Moderado',
    intense: 'Intenso',
    very_intense: 'Muito Intenso'
  };

  const tabs = [
    { id: 'info', label: 'Informações' },
    { id: 'services', label: 'Serviços' },
    { id: 'plan', label: 'Plano Alimentar' },
    { id: 'questionnaires', label: 'Questionários' },
    { id: 'appointments', label: 'Consultas' },
    { id: 'anamnesis', label: 'Anamneses' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'var(--bg-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-8 relative"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          }}
        >
          <div className="flex items-center gap-5">
            <div 
              className="w-18 h-18 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}
            >
              {getInitials(client.name)}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">{client.name}</h2>
              <p className="text-sm opacity-90">
                Cliente desde {formatDate(client.created_at)}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div 
          className="flex gap-2 px-8 overflow-x-auto"
          style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)'
          }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
              style={{
                color: activeTab === tab.id ? '#10b981' : 'var(--text-muted)',
                borderColor: activeTab === tab.id ? '#10b981' : 'transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto max-h-[500px]">
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-6">
              <InfoItem icon={Phone} label="Telefone" value={client.phone || 'Não informado'} />
              <InfoItem icon={Mail} label="Email" value={client.email || 'Não informado'} />
              <InfoItem 
                icon={User} 
                label="Idade" 
                value={calculateAge(client.birth_date) ? `${calculateAge(client.birth_date)} anos` : 'Não informado'} 
              />
              <InfoItem icon={Calendar} label="Data de Nascimento" value={formatDate(client.birth_date)} />
              <InfoItem icon={Ruler} label="Altura" value={client.height_cm ? `${client.height_cm} cm` : 'Não informado'} />
              <InfoItem icon={Weight} label="Peso Atual" value={client.weight_kg ? `${client.weight_kg} kg` : 'Não informado'} />
              <InfoItem icon={Target} label="Objetivo" value={client.goal ? goalLabels[client.goal] : 'Não informado'} />
              <InfoItem icon={Activity} label="Nível de Atividade" value={client.activity_level ? activityLabels[client.activity_level] : 'Não informado'} />
              
              {client.notes && (
                <div className="col-span-2">
                  <InfoItem icon={User} label="Observações" value={client.notes} />
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'services' && (
            <div className="text-center py-12">
              <p style={{ color: 'var(--text-muted)' }}>Conteúdo em desenvolvimento...</p>
            </div>
          )}
          
          {activeTab !== 'info' && activeTab !== 'services' && (
            <div className="text-center py-12">
              <p style={{ color: 'var(--text-muted)' }}>Conteúdo em desenvolvimento...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color: 'var(--text-muted)' }} />
        <h4 
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </h4>
      </div>
      <p 
        className="text-base font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </p>
    </div>
  );
}
