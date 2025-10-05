import { useState, useRef, useEffect } from 'react';
import { 
  Lightbulb, Send, Plus, FileText, Settings, 
  BarChart3, User
} from 'lucide-react';
import './AgenteIA.css';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  time: string;
}

export function AgenteIA() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou a assistente virtual de nutrição. Como posso ajudá-lo hoje?',
      type: 'assistant',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    '"quero agendar"',
    '"quanto custa"',
    '"posso comer fruta à noite"',
    '"qual horário funciona"'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      type: 'user',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Obrigada pela sua mensagem! Esta é uma resposta simulada da assistente IA. Configure a Base de Conhecimento para personalizar as respostas automáticas.',
        type: 'assistant',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion.replace(/"/g, ''));
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="agente-ia-page">
      {/* Header */}
      <div className="ai-header">
        <div className="header-content">
          <h1>
            <Lightbulb size={32} />
            Agente IA
          </h1>
          <p>Assistente inteligente para atendimento automatizado</p>
        </div>
        <div className="header-actions">
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>Online</span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <aside className="ai-sidebar">
          {/* Status Card */}
          <div className="info-card">
            <h3>Status da IA</h3>
            <div className="stat-item">
              <span className="stat-label">Conversas hoje</span>
              <span className="stat-value">12</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tempo médio</span>
              <span className="stat-value">&lt; 2min</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Taxa de sucesso</span>
              <span className="stat-value">94%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Modelo ativo</span>
              <span className="stat-value">GPT-4</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="info-card">
            <h3>Ações Rápidas</h3>
            <div className="quick-actions">
              <button className="action-btn">
                <Plus size={16} />
                Novo Template
              </button>
              <button className="action-btn">
                <FileText size={16} />
                Base Conhecimento
              </button>
              <button className="action-btn">
                <Settings size={16} />
                Configurações IA
              </button>
              <button className="action-btn">
                <BarChart3 size={16} />
                Ver Relatórios
              </button>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="chat-area">
          <div className="chat-header">
            <div>
              <div className="chat-title">Teste a Assistente Virtual</div>
              <div className="chat-info">Simule conversas para validar respostas</div>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'assistant' ? (
                    <Lightbulb size={20} />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="message-content">
                  <div className="message-bubble">{message.text}</div>
                  <div className="message-time">{message.time}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message assistant">
                <div className="message-avatar">
                  <Lightbulb size={20} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <div className="suggestions-row">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="input-wrapper">
              <div className="input-field">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite uma mensagem de teste..."
                  rows={1}
                />
              </div>
              <button className="send-button" onClick={handleSend}>
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
