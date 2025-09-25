import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Phone,
  Mail,
  User,
  UserPlus,
  Search,
  MoreHorizontal,
  Edit,
  MessageSquare,
  FileText,
  Clock,
  Heart,
  Shield,
} from 'lucide-react';
import { mockPatients } from '@/lib/mockData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PatientModal from './PatientModal';

const PatientsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Pacientes</h2>
          <p className="text-muted-foreground">
            Gerencie todos os seus pacientes cadastrados
          </p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-hover">
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-hover transition-shadow cursor-pointer" onClick={() => setSelectedPatientId(patient.id)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {getInitials(patient.name)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {calculateAge(patient.birthDate)} anos
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedPatientId(patient.id)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Prontuário
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Mensagem
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{patient.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Convênio: {patient.insurance}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Última: {new Date(patient.lastSession).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline"
                      className={patient.status === 'active' ? 'border-success text-success bg-success/10' : 'border-muted text-muted-foreground'}
                    >
                      {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {patient.sessionFrequency === 'weekly' ? 'Semanal' : 'Quinzenal'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span className="text-sm font-medium">{patient.totalSessions}</span>
                  </div>
                </div>
                <p className="text-sm">
                  <span className="font-medium text-muted-foreground">Diagnóstico:</span>
                </p>
                <p className="text-sm mt-1">{patient.diagnosis}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PatientModal 
        patientId={selectedPatientId || ''} 
        isOpen={!!selectedPatientId} 
        onClose={() => setSelectedPatientId(null)} 
      />

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum paciente encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Não há pacientes com esse termo de busca.' : 'Você ainda não tem pacientes cadastrados.'}
            </p>
            <Button className="bg-gradient-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Paciente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientsView;