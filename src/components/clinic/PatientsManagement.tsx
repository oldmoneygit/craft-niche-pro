import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  Heart,
  Clock,
  MapPin,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  Edit,
  MoreVertical
} from "lucide-react";
import { mockPatients } from "@/lib/mockData";

export default function PatientsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gestão de Pacientes</h2>
          <p className="text-muted-foreground">Acompanhe e gerencie todos os seus pacientes</p>
        </div>
        <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
          <DialogTrigger asChild>
            <Button className="action-primary shadow-glow">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="therapy-card max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Cadastrar Novo Paciente
              </DialogTitle>
              <DialogDescription>
                Preencha as informações básicas do novo paciente
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Nome do paciente" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@exemplo.com" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(11) 99999-9999" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input id="birthDate" type="date" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Convênio</Label>
                <Select>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecione o convênio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unimed">Unimed</SelectItem>
                    <SelectItem value="bradesco">Bradesco Saúde</SelectItem>
                    <SelectItem value="sulamerica">SulAmérica</SelectItem>
                    <SelectItem value="particular">Particular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency">Contato de Emergência</Label>
                <Input id="emergency" placeholder="Nome e telefone" className="rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes">Observações Iniciais</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Motivo da consulta, sintomas relatados, etc." 
                  className="rounded-xl min-h-[100px]" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsNewPatientOpen(false)}>
                Cancelar
              </Button>
              <Button className="action-success">
                <Heart className="h-4 w-4 mr-2" />
                Cadastrar Paciente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="therapy-card">
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email ou diagnóstico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Button variant="outline" className="rounded-xl">
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">52</div>
                <div className="text-sm text-muted-foreground">Total de Pacientes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-xl">
                <Activity className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">45</div>
                <div className="text-sm text-muted-foreground">Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-xl">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">5</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <Heart className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">4.2</div>
                <div className="text-sm text-muted-foreground">Sessões/Mês</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="therapy-card hover:shadow-hover transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{patient.email}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(patient.status)} rounded-full`}>
                  {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Última consulta: {new Date(patient.lastSession).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.totalSessions} sessões realizadas</span>
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-xl">
                <div className="text-sm font-medium mb-1">Diagnóstico:</div>
                <div className="text-sm text-muted-foreground">{patient.diagnosis}</div>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="flex-1 action-primary rounded-xl"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      Ver Perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="therapy-card max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Perfil do Paciente - {patient.name}
                      </DialogTitle>
                    </DialogHeader>
                    
                    {selectedPatient && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                        {/* Personal Info */}
                        <Card className="therapy-card">
                          <CardHeader>
                            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Nome</Label>
                                <p className="text-sm text-muted-foreground">{selectedPatient.name}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Email</Label>
                                <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Telefone</Label>
                                <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Data Nascimento</Label>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(selectedPatient.birthDate).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Convênio</Label>
                                <p className="text-sm text-muted-foreground">{selectedPatient.insurance}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Status</Label>
                                <Badge className={`${getStatusColor(selectedPatient.status)} text-xs`}>
                                  {selectedPatient.status === 'active' ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Contato de Emergência</Label>
                              <p className="text-sm text-muted-foreground">{selectedPatient.emergencyContact}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Clinical Info */}
                        <Card className="therapy-card">
                          <CardHeader>
                            <CardTitle className="text-lg">Informações Clínicas</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Diagnóstico</Label>
                              <p className="text-sm text-muted-foreground mt-1">{selectedPatient.diagnosis}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Medicação Atual</Label>
                              <p className="text-sm text-muted-foreground mt-1">{selectedPatient.currentMedication}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Frequência</Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {selectedPatient.sessionFrequency === 'weekly' ? 'Semanal' : 'Quinzenal'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Histórico Médico</Label>
                              <p className="text-sm text-muted-foreground mt-1">{selectedPatient.medicalHistory}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Therapy Goals */}
                        <Card className="therapy-card lg:col-span-2">
                          <CardHeader>
                            <CardTitle className="text-lg">Objetivos Terapêuticos</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedPatient.therapyGoals.map((goal: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-success/5 rounded-xl">
                                  <CheckCircle className="h-4 w-4 text-success" />
                                  <span className="text-sm">{goal}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Session History */}
                        <Card className="therapy-card lg:col-span-2">
                          <CardHeader>
                            <CardTitle className="text-lg">Histórico de Sessões</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="text-center p-4 bg-primary/5 rounded-xl">
                                <div className="text-2xl font-bold text-primary">{selectedPatient.totalSessions}</div>
                                <div className="text-sm text-muted-foreground">Total de Sessões</div>
                              </div>
                              <div className="text-center p-4 bg-secondary/5 rounded-xl">
                                <div className="text-2xl font-bold text-secondary">
                                  {new Date(selectedPatient.lastSession).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="text-sm text-muted-foreground">Última Sessão</div>
                              </div>
                              <div className="text-center p-4 bg-accent/5 rounded-xl">
                                <div className="text-2xl font-bold text-accent">
                                  {new Date(selectedPatient.registeredAt).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="text-sm text-muted-foreground">Cadastrado em</div>
                              </div>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl">
                              <Label className="text-sm font-medium">Observações Clínicas</Label>
                              <p className="text-sm text-muted-foreground mt-2">{selectedPatient.notes}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="outline" className="rounded-xl">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button className="action-secondary rounded-xl">
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendar Consulta
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button size="sm" variant="outline" className="rounded-xl">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card className="therapy-card">
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum paciente encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente ajustar os termos de busca' : 'Cadastre seu primeiro paciente para começar'}
            </p>
            <Button className="action-primary" onClick={() => setIsNewPatientOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Paciente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}