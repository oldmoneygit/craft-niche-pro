import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Heart,
  Shield,
  Clock,
  Target,
  Save,
  Edit,
} from 'lucide-react';
import { mockPatients, mockAppointments } from '@/lib/mockData';

interface PatientModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PatientModal = ({ patientId, isOpen, onClose }: PatientModalProps) => {
  const patient = mockPatients.find(p => p.id === patientId);
  const patientAppointments = mockAppointments.filter(a => a.patientName === patient?.name);
  const [notes, setNotes] = useState(patient?.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  if (!patient) return null;

  const calculateAge = (birthDate: string) => {
    return Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const saveNotes = () => {
    // Aqui seria a lógica para salvar no backend
    setIsEditingNotes(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <p className="text-sm text-muted-foreground">
                {calculateAge(patient.birthDate)} anos • {patient.totalSessions} sessões
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="sessions">Sessões</TabsTrigger>
            <TabsTrigger value="notes">Prontuário</TabsTrigger>
            <TabsTrigger value="goals">Objetivos</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Nascimento: {new Date(patient.birthDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>Convênio: {patient.insurance}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>Emergência: {patient.emergencyContact}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Informações Clínicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Diagnóstico:</span>
                    <Badge className="ml-2" variant="secondary">{patient.diagnosis}</Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Frequência:</span>
                    <span className="ml-2 text-sm">
                      {patient.sessionFrequency === 'weekly' ? 'Semanal' : 'Quinzenal'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Medicação atual:</span>
                    <span className="ml-2 text-sm">{patient.currentMedication}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Histórico médico:</span>
                    <p className="text-sm text-muted-foreground mt-1">{patient.medicalHistory}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Sessões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patientAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium">
                          {new Date(appointment.date).toLocaleDateString('pt-BR')}
                        </div>
                        <Badge variant="outline">{appointment.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Sessão #{appointment.sessionNumber}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{appointment.duration} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Anotações do Prontuário
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditingNotes ? 'Cancelar' : 'Editar'}
                </Button>
              </CardHeader>
              <CardContent>
                {isEditingNotes ? (
                  <div className="space-y-4">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={8}
                      placeholder="Adicione suas anotações sobre o paciente..."
                    />
                    <Button onClick={saveNotes} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Anotações
                    </Button>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm">{notes}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Objetivos Terapêuticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patient.therapyGoals.map((goal, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{goal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PatientModal;