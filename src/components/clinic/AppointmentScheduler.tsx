import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar,
  Clock,
  User,
  Plus,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Edit,
  Trash2,
  MessageSquare,
  FileText,
  DollarSign
} from "lucide-react";
import { mockAppointments } from "@/lib/mockData";

export default function AppointmentScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Realizado';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const todayAppointments = mockAppointments.filter(apt => 
    new Date(apt.date).toDateString() === selectedDate.toDateString()
  ).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Agenda</h2>
          <p className="text-muted-foreground">Gerencie consultas e horários</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white rounded-xl p-1 shadow-card">
            <Button
              size="sm"
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              onClick={() => setViewMode('day')}
              className="rounded-lg"
            >
              Dia
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              onClick={() => setViewMode('week')}
              className="rounded-lg"
            >
              Semana
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              onClick={() => setViewMode('month')}
              className="rounded-lg"
            >
              Mês
            </Button>
          </div>
          
          <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button className="action-primary shadow-glow">
                <Plus className="h-4 w-4 mr-2" />
                Nova Consulta
              </Button>
            </DialogTrigger>
            <DialogContent className="therapy-card max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Agendar Nova Consulta
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar um novo agendamento
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ana">Ana Costa</SelectItem>
                      <SelectItem value="joao">João Santos</SelectItem>
                      <SelectItem value="carla">Carla Oliveira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Consulta</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Tipo de consulta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Terapia Individual</SelectItem>
                      <SelectItem value="couple">Terapia de Casal</SelectItem>
                      <SelectItem value="evaluation">Avaliação Psicológica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(slot => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Duração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                      <SelectItem value="90">90 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Valor da Consulta</Label>
                  <Input id="value" placeholder="R$ 140,00" className="rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Observações sobre a consulta..." 
                    className="rounded-xl" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>
                  Cancelar
                </Button>
                <Button className="action-success">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Consulta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Date Navigation */}
      <Card className="therapy-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="rounded-xl">
              ← Anterior
            </Button>
            <div className="text-center">
              <h3 className="text-xl font-semibold">
                {selectedDate.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <p className="text-sm text-muted-foreground">
                {todayAppointments.length} consultas agendadas
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl">
              Próximo →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">8</div>
                <div className="text-sm text-muted-foreground">Hoje</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-xl">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">6</div>
                <div className="text-sm text-muted-foreground">Confirmadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-xl">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">2</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">R$ 1.120</div>
                <div className="text-sm text-muted-foreground">Receita Hoje</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Slots */}
        <div className="lg:col-span-2">
          <Card className="therapy-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Agenda do Dia
              </CardTitle>
              <CardDescription>
                Consultas agendadas para {selectedDate.toLocaleDateString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-4 bg-gradient-card rounded-xl border border-border hover:shadow-hover transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-semibold">{appointment.time}</div>
                      <div className="text-xs text-muted-foreground">{appointment.duration}min</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{appointment.patientName}</h4>
                        <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{appointment.type}</p>
                      <p className="text-xs text-muted-foreground">{appointment.notes}</p>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-medium ${getPaymentStatusColor(appointment.paymentStatus)}`}>
                        {appointment.paymentStatus === 'paid' ? '✓ Pago' : '⏳ Pendente'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sessão #{appointment.sessionNumber}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma consulta agendada</h3>
                  <p className="text-muted-foreground mb-4">
                    Não há consultas agendadas para esta data
                  </p>
                  <Button className="action-primary" onClick={() => setIsNewAppointmentOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar Consulta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Next Appointments */}
        <div className="space-y-6">
          <Card className="therapy-card">
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full action-primary rounded-xl" onClick={() => setIsNewAppointmentOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Consulta
              </Button>
              <Button variant="outline" className="w-full rounded-xl">
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar Lembretes
              </Button>
              <Button variant="outline" className="w-full rounded-xl">
                <FileText className="h-4 w-4 mr-2" />
                Relatório do Dia
              </Button>
            </CardContent>
          </Card>

          <Card className="therapy-card">
            <CardHeader>
              <CardTitle className="text-lg">Próximas Consultas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{appointment.patientName}</div>
                    <div className="text-xs text-muted-foreground">{appointment.time}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{appointment.type}</div>
                  <Badge className={`${getStatusColor(appointment.status)} text-xs mt-1`}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="therapy-card max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Detalhes da Consulta
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Paciente</Label>
                  <p className="text-base font-semibold">{selectedAppointment.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data e Horário</Label>
                  <p className="text-sm">
                    {new Date(selectedAppointment.date).toLocaleDateString('pt-BR')} às {selectedAppointment.time}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo de Consulta</Label>
                  <p className="text-sm">{selectedAppointment.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duração</Label>
                  <p className="text-sm">{selectedAppointment.duration} minutos</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <br />
                  <Badge className={`${getStatusColor(selectedAppointment.status)} mt-1`}>
                    {getStatusText(selectedAppointment.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Pagamento</Label>
                  <p className={`text-sm font-medium ${getPaymentStatusColor(selectedAppointment.paymentStatus)}`}>
                    {selectedAppointment.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sessão</Label>
                  <p className="text-sm">#{selectedAppointment.sessionNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Recorrente</Label>
                  <p className="text-sm">{selectedAppointment.isRecurring ? 'Sim' : 'Não'}</p>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Observações</Label>
                <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted/30 rounded-xl">
                  {selectedAppointment.notes}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" className="rounded-xl">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" className="rounded-xl text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button className="action-success rounded-xl">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}