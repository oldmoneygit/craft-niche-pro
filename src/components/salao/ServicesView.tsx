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
  Edit,
  Sparkles,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  X,
} from 'lucide-react';
import { mockServices } from '@/lib/salaoMockData';

export const ServicesView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Cabelo', 'Unhas', 'Sobrancelhas', 'Estética'];

  const filteredServices = mockServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.professional.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getAvailabilityBadge = (available: boolean) => {
    return available ? 
      <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Disponível</Badge> : 
      <Badge variant="secondary"><X className="h-3 w-3 mr-1" />Indisponível</Badge>;
  };

  const getDurationBadge = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    const timeString = hours > 0 ? `${hours}h${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
    
    return (
      <Badge variant="outline" className="flex items-center space-x-1">
        <Clock className="h-3 w-3" />
        <span>{timeString}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Catálogo de Serviços</h2>
          <p className="text-muted-foreground">
            Gerencie todos os serviços oferecidos pelo salão
          </p>
        </div>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-hover">
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
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
                  placeholder="Buscar por nome do serviço ou profissional..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {categories.slice(1).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Serviços */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Serviços ({filteredServices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {getDurationBadge(service.duration)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-lg font-medium">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        {service.price.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{service.professional}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getAvailabilityBadge(service.available)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Sparkles className="h-4 w-4" />
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
                <p className="text-sm text-muted-foreground">Total Serviços</p>
                <p className="text-2xl font-bold">{mockServices.length}</p>
              </div>
              <Sparkles className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preço Médio</p>
                <p className="text-2xl font-bold">
                  R$ {(mockServices.reduce((acc, s) => acc + s.price, 0) / mockServices.length).toFixed(0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">
                  {Math.round(mockServices.reduce((acc, s) => acc + s.duration, 0) / mockServices.length)}min
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categorias</p>
                <p className="text-2xl font-bold">
                  {new Set(mockServices.map(s => s.category)).size}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};