import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Video, 
  MapPin, 
  User,
  Edit,
  Trash2,
  CheckCircle
} from "lucide-react";
import { mockNutriData } from "@/lib/mockDataNutricionista";

const AppointmentScheduler = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const { appointments, patients } = mockNutriData;

  // Horários disponíveis (simulação)
  const availableHours = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", 
    "16:00", "16:30", "17:00", "17:30"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Agendado": return "bg-primary/10 text-primary";
      case "Confirmado": return "bg-success/10 text-success";
      case "Cancelado": return "bg-destructive/10 text-destructive";
      case "Realizado": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "Online" ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />;
  };

  const NewAppointmentModal = () => (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Nova Consulta</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-4">
        <div>
          <Label>Paciente</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id.toString()}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Data</Label>
            <Input type="date" />
          </div>
          <div>
            <Label>Horário</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Horário" />
              </SelectTrigger>
              <SelectContent>
                {availableHours.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Tipo de Consulta</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Observações</Label>
          <Textarea 
            placeholder="Observações sobre a consulta..."
            className="h-20"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button className="action-primary flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Agendar Consulta
          </Button>
          <Button variant="outline" onClick={() => setShowNewAppointment(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Agenda</h2>
          <p className="text-muted-foreground">Gerencie suas consultas e horários</p>
        </div>
        <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
          <DialogTrigger asChild>
            <Button className="action-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nova Consulta
            </Button>
          </DialogTrigger>
          <NewAppointmentModal />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simulação de calendário */}
            <div className="space-y-2">
              <div className="text-center">
                <h3 className="font-semibold">Novembro 2024</h3>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((day) => (
                  <div key={day} className="p-2 font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    className={`p-2 rounded hover:bg-primary/10 ${
                      day === 25 ? "bg-primary text-primary-foreground" : ""
                    } ${
                      [26, 27, 28].includes(day) ? "bg-warning/20 text-warning" : ""
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              
              {/* Legenda */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary"></div>
                  <span>Hoje</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-warning/60"></div>
                  <span>Com consultas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Consultas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Consultas de Hoje (25/11/2024)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-bold text-lg">{appointment.time}</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{appointment.patientName}</span>
                        {getTypeIcon(appointment.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-success">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações de Horário */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Disponibilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {[
              "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
            ].map((day, index) => (
              <Card key={day} className="p-4">
                <h4 className="font-medium mb-2">{day}</h4>
                <div className="space-y-2">
                  {index < 5 ? ( // Dias úteis
                    <>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Manhã:</span><br />
                        08:00 - 12:00
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Tarde:</span><br />
                        14:00 - 18:00
                      </div>
                    </>
                  ) : index === 5 ? ( // Sábado
                    <div className="text-sm">
                      <span className="text-muted-foreground">Manhã:</span><br />
                      08:00 - 12:00
                    </div>
                  ) : ( // Domingo
                    <div className="text-sm text-muted-foreground">
                      Fechado
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Button variant="outline" className="mt-4">
            <Edit className="h-4 w-4 mr-2" />
            Editar Horários
          </Button>
        </CardContent>
      </Card>

      {/* Próximas Consultas */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Consultas (Esta Semana)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.filter(apt => apt.date !== "2024-11-25").map((appointment) => (
              <Card key={appointment.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{appointment.patientName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.date} às {appointment.time}
                    </p>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  {getTypeIcon(appointment.type)}
                  <span>{appointment.type}</span>
                </div>
                
                <p className="text-sm">{appointment.notes}</p>
                
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    Reagendar
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentScheduler;