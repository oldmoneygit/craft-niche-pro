import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useAIAgent } from '@/hooks/useAIAgent';
import { useTenantId } from '@/hooks/useTenantId';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

interface SchedulingFlowState {
  active: boolean;
  step: 'intent' | 'name' | 'phone' | 'time' | 'confirm';
  data: {
    name?: string;
    phone?: string;
    preferredTime?: string;
  };
}

export default function PlatformAIChat() {
  const { tenantId } = useTenantId();
  const { searchKnowledgeWithAI, detectSchedulingIntent, isProcessing } = useAIAgent();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [schedulingFlow, setSchedulingFlow] = useState<SchedulingFlowState>({
    active: false,
    step: 'intent',
    data: {}
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensagem inicial
  useEffect(() => {
    setMessages([{
      id: '1',
      type: 'system',
      content: '🤖 Assistente IA ativada! Você pode simular conversas de pacientes aqui para testar as respostas. A IA usará o conhecimento que você cadastrou na Base de Conhecimento.',
      timestamp: new Date()
    }]);
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      const now = new Date();
      const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

      const { data: appointments } = await supabase
        .from('appointments')
        .select('datetime')
        .eq('tenant_id', tenantId)
        .gte('datetime', now.toISOString())
        .lte('datetime', fiveDaysLater.toISOString());

      // Horários padrão de atendimento (9h às 17h)
      const businessHours = [9, 10, 11, 14, 15, 16, 17];
      const bookedSlots = appointments?.map(a => new Date(a.datetime).toISOString()) || [];

      // Gerar próximos 5 dias úteis com horários disponíveis
      const slots = [];
      let date = new Date(now);
      date.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7 && slots.length < 6; i++) {
        date.setDate(date.getDate() + 1);
        
        // Pular fins de semana
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        // Verificar horários disponíveis neste dia
        for (const hour of businessHours) {
          const slotDate = new Date(date);
          slotDate.setHours(hour, 0, 0, 0);
          
          if (slotDate > now && !bookedSlots.includes(slotDate.toISOString())) {
            slots.push({
              date: slotDate,
              display: `${slotDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })} às ${hour}h`
            });
            
            if (slots.length >= 6) break;
          }
        }
      }

      return slots.map((s, i) => `${i + 1}. ${s.display}`).join('\n');

    } catch (error) {
      console.error('Error fetching slots:', error);
      return "Segunda 14h\nQuarta 10h\nSexta 16h";
    }
  };

  const createLead = async (leadData: any) => {
    if (!tenantId) return false;

    try {
      const { error } = await supabase.from('leads').insert({
        tenant_id: tenantId,
        name: leadData.name,
        phone: leadData.phone,
        preferred_time_description: leadData.preferredTime,
        conversation_summary: leadData.conversationSummary,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Novo Lead! 🎉",
        description: `${leadData.name} quer agendar consulta`,
      });

      return true;
    } catch (error) {
      console.error('Error creating lead:', error);
      return false;
    }
  };

  const handleSchedulingIntent = async () => {
    if (!tenantId) return "Sistema indisponível no momento.";

    // Iniciar fluxo de agendamento
    setSchedulingFlow({
      active: true,
      step: 'name',
      data: {}
    });

    return "Ótimo! Vou te ajudar a agendar. Primeiro, qual seu nome completo?";
  };

  const processSchedulingFlow = async (message: string) => {
    const { step, data } = schedulingFlow;

    switch (step) {
      case 'name':
        setSchedulingFlow({
          active: true,
          step: 'phone',
          data: { ...data, name: message }
        });
        return `Prazer, ${message}! Agora me passa seu telefone com DDD (ex: 11 99999-9999)`;

      case 'phone':
        // Validação básica de telefone
        const phoneClean = message.replace(/\D/g, '');
        if (phoneClean.length < 10) {
          return "Por favor, digite um telefone válido com DDD (ex: 11 99999-9999)";
        }

        setSchedulingFlow({
          active: true,
          step: 'time',
          data: { ...data, phone: message }
        });

        // Buscar horários disponíveis reais
        const availableSlots = await fetchAvailableSlots();
        return `Perfeito! Aqui estão os horários disponíveis:\n\n${availableSlots}\n\nQual você prefere? (pode digitar o número ou o dia/hora)`;

      case 'time':
        // Aceitar qualquer resposta como horário preferido
        setSchedulingFlow({
          active: true,
          step: 'confirm',
          data: { ...data, preferredTime: message }
        });
        
        return `Perfeito! Vou resumir:\n\n📋 Nome: ${data.name}\n📱 Telefone: ${data.phone}\n📅 Horário preferido: ${message}\n\nTudo certo? Digite SIM para eu enviar sua solicitação ao nutricionista, ou CANCELAR para desistir.`;

      case 'confirm':
        if (message.toLowerCase().includes('sim')) {
          // Criar lead no banco
          const leadCreated = await createLead({
            name: data.name!,
            phone: data.phone!,
            preferredTime: data.preferredTime!,
            conversationSummary: `Lead capturado via IA Chat`
          });

          if (leadCreated) {
            setSchedulingFlow({ active: false, step: 'intent', data: {} });
            return `✅ Pronto! Sua solicitação foi enviada!\n\n📋 Resumo:\nNome: ${data.name}\nTelefone: ${data.phone}\nHorário: ${data.preferredTime}\n\nO nutricionista vai confirmar seu horário em breve pelo WhatsApp. Fique de olho no seu telefone! 📱\n\nPrecisa de mais alguma coisa?`;
          } else {
            return "Ops, tive um problema ao salvar. Por favor, tente novamente ou entre em contato diretamente.";
          }
        } else {
          setSchedulingFlow({ active: false, step: 'intent', data: {} });
          return "Agendamento cancelado. Precisando de algo mais, é só chamar!";
        }

      default:
        return "Algo deu errado. Vamos começar de novo?";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    try {
      let aiResponse = '';

      // PRIORIDADE 1: Se está em fluxo de agendamento ativo, processar isso PRIMEIRO
      if (schedulingFlow.active) {
        aiResponse = await processSchedulingFlow(currentInput);
      } 
      // PRIORIDADE 2: Se detectou intenção de agendamento, iniciar fluxo
      else if (detectSchedulingIntent(currentInput)) {
        aiResponse = await handleSchedulingIntent();
      }
      // PRIORIDADE 3: Buscar na base de conhecimento
      else {
        const result = await searchKnowledgeWithAI(currentInput, tenantId!);
        
        if (result && result.answer) {
          aiResponse = result.answer;
        } else {
          aiResponse = "Como posso ajudar? Posso responder dúvidas sobre nutrição ou ajudar com agendamento de consultas.";
        }
      }

      // Adiciona resposta da IA
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
      }, 800);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a mensagem",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <PlatformPageWrapper title="Agente IA">
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Assistente IA Nutrição</h3>
                <p className="text-green-100 text-sm">
                  {isProcessing ? 'Digitando...' : 'Online - Pronta para responder'}
                </p>
              </div>
            </div>
            <div className="text-white text-sm bg-white/10 px-3 py-1 rounded">
              Modo Teste
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-blue-500' 
                  : message.type === 'system'
                  ? 'bg-gray-400'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[75%] ${
                message.type === 'user' ? 'items-end' : 'items-start'
              }`}>
                <div className={`p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-none'
                    : message.type === 'system'
                    ? 'bg-yellow-50 text-gray-700 text-sm border border-yellow-200 rounded-tl-none'
                    : 'bg-white text-gray-900 shadow-sm rounded-tl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-right text-gray-500' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Simule uma mensagem de paciente..."
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>💡 Teste: "quero agendar", "quanto custa", "posso comer fruta à noite"</span>
            <span className="text-gray-400">Enter para enviar</span>
          </div>
        </div>
      </div>
    </PlatformPageWrapper>
  );
}