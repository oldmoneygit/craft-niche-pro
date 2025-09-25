import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  User,
  Scissors,
} from 'lucide-react';
import { mockAppointments } from '@/lib/salaoMockData';

export const SalaoAppointmentsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = ['all', 'Agendado', 'Em Andamento', 'Concluído', 'Cancelado'];

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = appointment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Agendado':
        return <Clock className="h-4 w-4" />;
      case 'Em Andamento':
        return <Scissors className="h-4 w-4" />;
      case 'Concluído':
        return <CheckCircle className="h-4 w-4" />;
      case 'Cancelado':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Agendado':
        return <Badge variant="outline" className="text-blue-600">{getStatusIcon(status)} {status}</Badge>;
      case 'Em Andamento':
        return <Badge variant="secondary" className="text-orange-600">{getStatusIcon(status)} {status}</Badge>;
      case 'Concluído':
        return <Badge variant="default" className="text-green-600">{getStatusIcon(status)} {status}</Badge>;
      case 'Cancelado':
        return <Badge variant="destructive">{getStatusIcon(status)} {status}</Badge>;
      default:
        return <Badge variant="outline">{getStatusIcon(status)} {status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agendamentos</h2>
          <p className="text-muted-foreground">
            Gerencie todos os agendamentos do salão
          </p>
        </div>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-hover">
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, serviço ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                {statusOptions.slice(1).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Agendamentos ({filteredAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agendamento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.paymentMethod}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.client}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {appointment.clientPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Scissors className="h-4 w-4 mr-2 text-pink-500" />
                        <span className="font-medium">{appointment.service}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{appointment.professional}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.date}</p>
                        <p className="text-sm text-muted-foreground">{appointment.time}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{appointment.duration}min</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-lg">
                      R$ {appointment.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(appointment.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
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

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agendamentos</p>
                <p className="text-2xl font-bold">{mockAppointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-orange-500">
                  {mockAppointments.filter(a => a.status === 'Em Andamento').length}
                </p>
              </div>
              <Scissors className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos Hoje</p>
                <p className="text-2xl font-bold text-green-500">
                  {mockAppointments.filter(a => a.status === 'Concluído').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Hoje</p>
                <p className="text-2xl font-bold">
                  R$ {mockAppointments.reduce((acc, a) => acc + a.price, 0).toFixed(0)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};