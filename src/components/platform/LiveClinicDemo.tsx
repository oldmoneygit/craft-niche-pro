import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Brain,
  Calendar,
  MessageSquare,
  Phone,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  User,
  Bot,
} from 'lucide-react';

type ChatMessage = {
  id: number;
  type: 'ai' | 'user';
  message: string;
  timestamp: string;
};

const LiveClinicDemo = () => {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'ai',
      message: 'Olá! Sou a assistente virtual da Clínica Mente Sã. Como posso ajudá-lo hoje?',
      timestamp: '14:30',
    },
  ]);

  const clinicInfo = {
    name: 'Clínica Mente Sã',
    subtitle: 'Psicologia & Bem-Estar Mental',
    description: 'Especializada em terapia cognitivo-comportamental, ansiedade e depressão. Atendimento humanizado e personalizado.',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123 - Vila Madalena, São Paulo',
    rating: 4.9,
    reviews: 127,
    specialties: ['Terapia Individual', 'Terapia de Casal', 'Ansiedade', 'Depressão', 'Neuropsicologia'],
    doctor: {
      name: 'Dra. Maria Silva',
      crp: 'CRP 06/123456',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    },
  };

  const scheduleOptions = [
    { date: 'Hoje', time: '16:00', available: true },
    { date: 'Amanhã', time: '09:00', available: true },
    { date: 'Amanhã', time: '14:30', available: true },
    { date: 'Sex 27/12', time: '10:00', available: true },
  ];

  const handleSendMessage = (message: string) => {
    // Adiciona mensagem do usuário
    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMessage]);

    // Simula resposta da IA após um delay
    setTimeout(() => {
      let aiResponse = '';
      
      if (message.toLowerCase().includes('agendar') || message.toLowerCase().includes('consulta')) {
        aiResponse = 'Perfeito! Temos horários disponíveis para esta semana. Vou mostrar as opções:\n\n📅 **Hoje às 16:00h**\n📅 **Amanhã às 09:00h ou 14:30h**\n📅 **Sexta-feira às 10:00h**\n\nQual horário fica melhor para você?';
      } else if (message.toLowerCase().includes('preço') || message.toLowerCase().includes('valor')) {
        aiResponse = 'Nossos valores são:\n\n💰 **Consulta Individual**: R$ 120 (50 min)\n💰 **Terapia de Casal**: R$ 180 (60 min)\n💰 **Avaliação Psicológica**: R$ 250 (90 min)\n\nAceitamos convênios Unimed, Bradesco Saúde e SulAmérica. Gostaria de agendar uma consulta?';
      } else if (message.toLowerCase().includes('endereço') || message.toLowerCase().includes('onde')) {
        aiResponse = `Estamos localizados na ${clinicInfo.address}.\n\n📍 Fácil acesso por transporte público\n🚗 Estacionamento disponível\n\nPrecisa de mais alguma informação?`;
      } else {
        aiResponse = 'Entendo! Posso ajudar você com:\n\n🗓️ **Agendamento de consultas**\n💰 **Informações sobre valores**\n📍 **Localização e contato**\n🩺 **Especialidades da clínica**\n\nO que gostaria de saber?';
      }

      const aiMessage: ChatMessage = {
        id: chatMessages.length + 2,
        type: 'ai',
        message: aiResponse,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const quickQuestions = [
    'Gostaria de agendar uma consulta',
    'Qual o valor das consultas?',
    'Onde fica a clínica?',
    'Quais especialidades vocês atendem?',
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Clinic Header */}
      <Card className="bg-gradient-card border-primary/20 overflow-hidden">
        <div className="relative">
          <div className="absolute top-4 right-4">
            <Badge className="bg-success/10 text-success border-success">
              <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
              Online Agora
            </Badge>
          </div>
          
          <CardHeader className="pb-4">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-1">{clinicInfo.name}</CardTitle>
                <p className="text-muted-foreground mb-2">{clinicInfo.subtitle}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-warning fill-warning mr-1" />
                    <span className="font-medium">{clinicInfo.rating}</span>
                    <span className="ml-1">({clinicInfo.reviews} avaliações)</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Vila Madalena, SP
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Clinic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor Info */}
          <Card>
            <CardHeader>
              <CardTitle>Profissional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <img src={clinicInfo.doctor.photo} alt={clinicInfo.doctor.name} />
                  <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{clinicInfo.doctor.name}</h4>
                  <p className="text-sm text-muted-foreground">{clinicInfo.doctor.crp}</p>
                  <p className="text-sm text-muted-foreground">Especialista em TCC</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle>Especialidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {clinicInfo.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre a Clínica</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{clinicInfo.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{clinicInfo.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{clinicInfo.address}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>Seg-Sex: 8h às 18h | Sáb: 8h às 12h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Booking & Chat */}
        <div className="space-y-6">
          {/* Quick Booking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Agendar Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduleOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-between hover:border-primary hover:bg-primary/5"
                  onClick={() => handleSendMessage(`Gostaria de agendar para ${option.date} às ${option.time}`)}
                >
                  <span>{option.date} - {option.time}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ))}
              <p className="text-xs text-muted-foreground text-center mt-3">
                * Clique em um horário para agendar via chat
              </p>
            </CardContent>
          </Card>

          {/* AI Chat Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-accent" />
                Assistente Virtual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showChat ? (
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Tire suas dúvidas e agende consultas com nossa IA
                  </p>
                  <Button 
                    className="w-full bg-gradient-primary hover:shadow-hover"
                    onClick={() => setShowChat(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Iniciar Conversa
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="max-h-64 overflow-y-auto space-y-3 p-2">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-start space-x-2 max-w-xs">
                          {message.type === 'ai' && (
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-accent text-white text-xs">
                                <Bot className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`p-2 rounded-lg text-xs ${
                              message.type === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.message}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {message.timestamp}
                            </span>
                          </div>
                          {message.type === 'user' && (
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-primary text-white text-xs">
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Questions */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Perguntas rápidas:</p>
                    <div className="grid gap-2">
                      {quickQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs justify-start"
                          onClick={() => handleSendMessage(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveClinicDemo;