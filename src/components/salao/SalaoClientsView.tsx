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
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  TrendingUp,
  Heart,
  Star,
  Gift,
} from 'lucide-react';
import { mockClients } from '@/lib/salaoMockData';

export const SalaoClientsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = ['all', 'Ativo', 'Inativo', 'VIP'];

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <Badge variant="default">Ativo</Badge>;
      case 'VIP':
        return <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
          <Star className="h-3 w-3 mr-1" />VIP
        </Badge>;
      default:
        return <Badge variant="secondary">Inativo</Badge>;
    }
  };

  const getClientTypeIcon = (totalSpent: number) => {
    if (totalSpent > 1000) return <Star className="h-4 w-4 text-yellow-500" />;
    if (totalSpent > 500) return <Heart className="h-4 w-4 text-pink-500" />;
    return <User className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clientes</h2>
          <p className="text-muted-foreground">
            Gerencie sua base de clientes e histórico
          </p>
        </div>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-hover">
          <Plus className="h-4 w-4 mr-2" />
          Nova Cliente
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
                  placeholder="Buscar por nome, telefone ou email..."
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

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Clientes ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Profissional Preferida</TableHead>
                  <TableHead>Histórico</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getClientTypeIcon(client.totalSpent)}
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {client.birthDate}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                          {client.phone}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                          {client.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start text-sm">
                        <MapPin className="h-3 w-3 mr-2 text-muted-foreground mt-0.5" />
                        <span className="max-w-32 truncate">{client.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-2 text-yellow-500" />
                        <span className="text-sm">{client.preferredProfessional}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                          {client.totalVisits} visitas
                        </div>
                        <div className="text-sm font-medium">
                          R$ {client.totalSpent.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Cliente desde {client.firstVisit}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                        {client.lastVisit}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(client.status)}
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
                <p className="text-sm text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold">{mockClients.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes VIP</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {mockClients.filter(c => c.totalSpent > 1000).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Ativas</p>
                <p className="text-2xl font-bold text-green-500">
                  {mockClients.filter(c => c.status === 'Ativo').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold">
                  R$ {mockClients.reduce((acc, c) => acc + c.totalSpent, 0).toLocaleString()}
                </p>
              </div>
              <Gift className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};