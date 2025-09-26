import React from 'react';
import { Link } from 'react-router-dom';
import { getAllClients } from '@/core/config/clientRegistry';
import BaseTemplate from '@/core/layouts/BaseTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  TrendingUp, 
  DollarSign, 
  ExternalLink,
  Settings,
  Plus
} from 'lucide-react';

export default function AdminDashboard() {
  const allClients = getAllClients();

  const totalClients = allClients.length;
  const activeClients = allClients.filter(client => true).length; // Mock: todos ativos
  const totalRevenue = allClients.length * 299; // Mock: R$ 299 por cliente

  const businessTypeColors: Record<string, string> = {
    nutritionist: 'bg-green-100 text-green-800',
    clinic: 'bg-blue-100 text-blue-800',
    salon: 'bg-pink-100 text-pink-800',
    fitness: 'bg-orange-100 text-orange-800',
    other: 'bg-gray-100 text-gray-800',
  };

  const businessTypeLabels: Record<string, string> = {
    nutritionist: 'Nutricionista',
    clinic: 'Clínica',
    salon: 'Salão',
    fitness: 'Academia',
    other: 'Outros',
  };

  return (
    <BaseTemplate title="Admin Dashboard">
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 flex">
              <h1 className="text-lg font-semibold">Plataforma Admin</h1>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <Button asChild>
                <Link to="/onboarding">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Plataforma
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-6">
          <div className="flex items-center justify-between space-y-2 mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h2>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClients}</div>
                <p className="text-xs text-muted-foreground">Plataformas ativas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeClients}</div>
                <p className="text-xs text-muted-foreground">Logados nos últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">MRR atual</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+25%</div>
                <p className="text-xs text-muted-foreground">Novos clientes este mês</p>
              </CardContent>
            </Card>
          </div>

          {/* Clients List */}
          <Card>
            <CardHeader>
              <CardTitle>Plataformas Criadas</CardTitle>
              <CardDescription>
                Gerencie todas as plataformas dos seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                        {client.branding.companyName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{client.branding.companyName}</h3>
                        <p className="text-sm text-muted-foreground">/{client.subdomain}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="secondary" 
                        className={businessTypeColors[client.businessType] || businessTypeColors.other}
                      >
                        {businessTypeLabels[client.businessType] || 'Outros'}
                      </Badge>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/platform/${client.id}`}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Abrir
                          </Link>
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </BaseTemplate>
  );
}