import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Phone, 
  Mail, 
  Calendar, 
  Target,
  Weight,
  TrendingDown,
  TrendingUp,
  Minus
} from "lucide-react";
import { mockNutriData } from "@/lib/mockDataNutricionista";

const PatientsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { patients } = mockNutriData;

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "status-active";
      case "Inativo": return "status-inactive";
      case "Vencendo": return "status-expiring";
      default: return "status-inactive";
    }
  };

  const PatientDetailModal = ({ patient }: any) => {
    if (!patient) return null;
    
    const weightChange = patient.weight[patient.weight.length - 1] - patient.weight[0];
    const isWeightLoss = weightChange < 0;
    
    return (
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {patient.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">{patient.age} anos • {patient.goal}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{patient.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{patient.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Última consulta: {patient.lastConsultation}</span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Objetivo: {patient.goal}</span>
              </div>
            </CardContent>
          </Card>

          {/* Plano Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plano Atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{patient.plan}</span>
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-success">R$ {patient.planPrice}</div>
              <div className="text-sm text-muted-foreground">
                Início: {patient.startDate}<br />
                Vencimento: {patient.expiryDate}
              </div>
            </CardContent>
          </Card>

          {/* Evolução de Peso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Weight className="h-5 w-5" />
                Evolução de Peso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Peso Atual</span>
                  <span className="font-bold">{patient.weight[patient.weight.length - 1]} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Peso Inicial</span>
                  <span className="text-sm">{patient.weight[0]} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Variação</span>
                  <div className={`flex items-center gap-1 ${isWeightLoss ? 'text-success' : 'text-warning'}`}>
                    {isWeightLoss ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                    <span className="font-medium">
                      {isWeightLoss ? '' : '+'}{weightChange.toFixed(1)} kg
                    </span>
                  </div>
                </div>
                
                {/* Mini gráfico de peso */}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-end gap-2 h-16">
                    {patient.weight.map((weight: number, index: number) => (
                      <div key={index} className="flex-1 bg-primary/20 rounded-t" 
                           style={{ height: `${((weight - Math.min(...patient.weight)) / (Math.max(...patient.weight) - Math.min(...patient.weight))) * 100}%` }}>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Início</span>
                    <span>Atual</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anotações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Anotações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{patient.notes}</p>
              <Button variant="outline" size="sm" className="mt-3">
                <Edit className="h-4 w-4 mr-2" />
                Editar Anotações
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mt-6">
          <Button className="action-primary">
            <Calendar className="h-4 w-4 mr-2" />
            Agendar Consulta
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar Paciente
          </Button>
          <Button variant="outline" className="action-info">
            Nova Dieta
          </Button>
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestão de Pacientes</h2>
          <p className="text-muted-foreground">Gerencie seus pacientes e acompanhe sua evolução</p>
        </div>
        <Button className="action-primary">
          <Plus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pacientes */}
      <Card>
        <CardHeader>
          <CardTitle>Pacientes ({filteredPatients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Consulta</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-muted-foreground">{patient.age} anos</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{patient.email}</div>
                        <div className="text-sm text-muted-foreground">{patient.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{patient.plan}</div>
                        <div className="text-sm text-muted-foreground">R$ {patient.planPrice}</div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.expiryDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{patient.lastConsultation}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedPatient(patient)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <PatientDetailModal patient={selectedPatient} />
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientsManagement;