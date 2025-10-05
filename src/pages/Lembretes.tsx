import React, { useState } from 'react';
import { LembreteCard } from '@/components/lembretes/LembreteCard';
import { LembreteModal } from '@/components/lembretes/LembreteModal';

export default function Lembretes() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<any>(null);

  const lembretes = [
    {
      type: 'consulta' as const,
      title: 'Lembrete de Consulta',
      subtitle: 'Enviado antes da consulta',
      timing: 'Enviado 24 horas antes',
      message: `Olá {nome}! 👋

Lembrete: Você tem consulta amanhã às {horario}.

📍 Local: {local}
🩺 Dr(a): {nutricionista}

Lembre-se de trazer seus exames e estar em jejum de 12h se necessário.

Qualquer dúvida, estou à disposição!`,
      variables: ['{nome}', '{horario}', '{data}', '{local}', '{nutricionista}'],
      isActive: true
    },
    {
      type: 'confirmacao' as const,
      title: 'Confirmação de Consulta',
      subtitle: 'Solicita confirmação do paciente',
      timing: 'Enviado 48 horas antes',
      message: `Oi {nome}! 😊

Sua consulta está agendada para {data} às {horario}.

Você pode confirmar sua presença?

✅ Responda SIM para confirmar
❌ Responda NÃO para remarcar

Aguardo seu retorno!`,
      variables: ['{nome}', '{data}', '{horario}'],
      isActive: true
    },
    {
      type: 'feedback' as const,
      title: 'Solicitação de Feedback',
      subtitle: 'Coleta informações semanais',
      timing: 'Toda segunda-feira às 9h',
      message: `Bom dia, {nome}! ☀️

Como foi sua semana alimentar? 

Gostaria de saber:
• Como está se sentindo?
• Conseguiu seguir o plano?
• Teve alguma dificuldade?

Seu feedback é muito importante para ajustarmos o acompanhamento!

Aguardo seu retorno 💚`,
      variables: ['{nome}', '{semana}'],
      isActive: true
    },
    {
      type: 'retorno' as const,
      title: 'Follow-up de Retorno',
      subtitle: 'Reativa clientes inativos',
      timing: 'Após 30 dias sem consulta',
      message: `Olá {nome}! 

Senti sua falta por aqui! 😊

Notei que faz um tempo que não nos vemos. Como você está?

Gostaria de reagendar uma consulta para acompanharmos sua evolução?

Estou à disposição para te ajudar a retomar seus objetivos! 💪

Responda quando puder!`,
      variables: ['{nome}', '{dias_ausente}', '{ultima_consulta}'],
      isActive: true
    },
    {
      type: 'aniversario' as const,
      title: 'Parabéns de Aniversário',
      subtitle: 'Mensagem personalizada',
      timing: 'No dia do aniversário às 8h',
      message: `🎉🎂 PARABÉNS, {nome}! 🎂🎉

Hoje é um dia muito especial!

Desejo que você continue alcançando todos os seus objetivos de saúde e bem-estar! 

Que tal comemorar de forma saudável? Lembre-se: você merece celebrar e cuidar de você! 💚

Aproveite seu dia! 🎈✨`,
      variables: ['{nome}', '{idade}'],
      isActive: true
    },
    {
      type: 'hidratacao' as const,
      title: 'Lembrete de Hidratação',
      subtitle: 'Incentiva consumo de água',
      timing: '3x ao dia (9h, 14h, 18h)',
      message: `💧 Hora de se hidratar, {nome}!

Já bebeu água hoje? 

Lembre-se: a hidratação adequada é essencial para:
✓ Melhor metabolismo
✓ Mais energia
✓ Pele saudável
✓ Controle do apetite

Meta diária: {meta_agua}L

Beba um copo agora! 💚`,
      variables: ['{nome}', '{meta_agua}'],
      isActive: false
    }
  ];

  const handleEdit = (lembrete: any) => {
    setSelectedReminder(lembrete);
    setModalOpen(true);
  };

  const handleTest = (lembrete: any) => {
    alert(`Teste enviado para: ${lembrete.title}`);
  };

  const handleSave = (message: string) => {
    console.log('Mensagem salva:', message);
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
            Configurar Lembretes
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.7 }}>
            Personalize as mensagens automáticas enviadas aos pacientes
          </p>
        </div>

        {/* Lembretes Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '24px' }}>
          {lembretes.map((lembrete, index) => (
            <LembreteCard
              key={index}
              {...lembrete}
              onToggle={() => console.log('Toggle', lembrete.type)}
              onEdit={() => handleEdit(lembrete)}
              onTest={() => handleTest(lembrete)}
            />
          ))}
        </div>
      </div>

      {selectedReminder && (
        <LembreteModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          reminderType={selectedReminder.type}
          reminderTitle={selectedReminder.title}
          currentMessage={selectedReminder.message}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
