import { useState } from 'react';
import { X, User, Mail, Phone, Calendar, Ruler, Weight, Target, Activity } from 'lucide-react';
import { useClientsData } from '@/hooks/useClientsData';
import { ClientWithStats } from '@/hooks/useClientsData';

interface EditClientModalProps {
  client: ClientWithStats;
  onClose: () => void;
}

export function EditClientModal({ client, onClose }: EditClientModalProps) {
  const { updateClient } = useClientsData('');
  const [formData, setFormData] = useState({
    name: client.name || '',
    email: client.email || '',
    phone: client.phone || '',
    birth_date: client.birth_date || '',
    height_cm: client.height_cm?.toString() || '',
    weight_kg: client.weight_kg?.toString() || '',
    goal: client.goal || '',
    activity_level: client.activity_level || '',
    notes: client.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    const clientData: any = {
      name: formData.name.trim(),
    };

    if (formData.email) clientData.email = formData.email;
    if (formData.phone) clientData.phone = formData.phone;
    if (formData.birth_date) clientData.birth_date = formData.birth_date;
    if (formData.height_cm) clientData.height_cm = parseFloat(formData.height_cm);
    if (formData.weight_kg) clientData.weight_kg = parseFloat(formData.weight_kg);
    if (formData.goal) clientData.goal = formData.goal;
    if (formData.activity_level) clientData.activity_level = formData.activity_level;
    if (formData.notes) clientData.notes = formData.notes;

    await updateClient.mutateAsync({ id: client.id, updates: clientData });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'var(--bg-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-8 relative"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          }}
        >
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-1">Editar Cliente</h2>
            <p className="text-sm opacity-90">Atualize as informações de {client.name}</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Nome */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                <User size={16} />
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border transition-all"
                style={{
                  background: 'var(--bg-card)',
                  backdropFilter: 'blur(20px)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Digite o nome completo"
              />
            </div>

            {/* Email e Telefone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Phone size={16} />
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                <Calendar size={16} />
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border transition-all"
                style={{
                  background: 'var(--bg-card)',
                  backdropFilter: 'blur(20px)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Altura e Peso */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Ruler size={16} />
                  Altura (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height_cm}
                  onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="170"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Weight size={16} />
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="70"
                />
              </div>
            </div>

            {/* Objetivo e Atividade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Target size={16} />
                  Objetivo
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">Selecione...</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="weight_loss">Perda de Peso</option>
                  <option value="muscle_gain">Ganho de Massa</option>
                  <option value="health">Saúde</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Activity size={16} />
                  Nível de Atividade
                </label>
                <select
                  value={formData.activity_level}
                  onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">Selecione...</option>
                  <option value="sedentary">Sedentário</option>
                  <option value="light">Leve</option>
                  <option value="moderate">Moderado</option>
                  <option value="intense">Intenso</option>
                  <option value="very_intense">Muito Intenso</option>
                </select>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border transition-all resize-none"
                style={{
                  background: 'var(--bg-card)',
                  backdropFilter: 'blur(20px)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Informações adicionais sobre o cliente..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateClient.isPending}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
              style={{
                background: updateClient.isPending 
                  ? 'var(--text-tertiary)' 
                  : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                cursor: updateClient.isPending ? 'not-allowed' : 'pointer'
              }}
            >
              {updateClient.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
