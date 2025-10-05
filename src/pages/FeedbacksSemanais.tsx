import React, { useState } from 'react';
import { Clock, CheckCircle, Users } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { FeedbackAlertBox } from '@/components/feedbacks/FeedbackAlertBox';
import { FeedbackClientCard } from '@/components/feedbacks/FeedbackClientCard';
import { FeedbackModal } from '@/components/feedbacks/FeedbackModal';

export function FeedbacksSemanais() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState({ name: '', phone: '' });

  const clients = [
    { name: 'Ana Carolina Lima', phone: '19981669495', daysPending: 999 },
    { name: 'Marcão da Massa', phone: '19981661010', daysPending: 999 },
    { name: 'Pamela Nascimento de Lima', phone: '+55 61 3224 4073', daysPending: 999 }
  ];

  const handleOpenModal = (name: string, phone: string) => {
    setSelectedClient({ name, phone });
    setIsModalOpen(true);
  };

  const handleSendAll = () => {
    if (confirm(`Deseja enviar o feedback semanal para todos os ${clients.length} clientes pendentes?`)) {
      alert('Feedbacks enviados para todos! ✅');
    }
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
            Feedbacks Semanais
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.7 }}>
            Gerencie e envie feedbacks semanais para seus pacientes
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard label="Pendentes" value={3} icon={<Clock className="w-6 h-6" />} variant="warning" />
          <StatCard label="Em dia" value={0} icon={<CheckCircle className="w-6 h-6" />} variant="success" />
          <StatCard label="Total Clientes" value={3} icon={<Users className="w-6 h-6" />} variant="primary" />
        </div>

        {/* Alert Box */}
        <FeedbackAlertBox pendingCount={clients.length} onSendAll={handleSendAll} />

        {/* Clients List */}
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Clientes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {clients.map((client, index) => (
            <FeedbackClientCard
              key={index}
              {...client}
              onSendFeedback={() => handleOpenModal(client.name, client.phone)}
            />
          ))}
        </div>
      </div>

      <FeedbackModal
        isOpen={isModalOpen}
        clientName={selectedClient.name}
        clientPhone={selectedClient.phone}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
