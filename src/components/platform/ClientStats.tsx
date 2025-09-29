import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Plus, Target, Phone } from 'lucide-react';

interface ClientStatsProps {
  clients: any[];
}

export default function ClientStats({ clients }: ClientStatsProps) {
  const totalClients = clients.length;
  
  const newThisMonth = clients.filter(client => {
    const created = new Date(client.created_at);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;
  
  const withGoals = clients.filter(client => client.goal && client.goal.trim()).length;
  
  const withContact = clients.filter(client => client.email || client.phone).length;
  
  const stats = [
    {
      title: 'Total de Clientes',
      value: totalClients,
      icon: User,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'clientes cadastrados'
    },
    {
      title: 'Novos este mês',
      value: newThisMonth,
      icon: Plus,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'novos clientes'
    },
    {
      title: 'Com objetivos',
      value: withGoals,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'têm objetivos definidos'
    },
    {
      title: 'Com contato',
      value: withContact,
      icon: Phone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'com email ou telefone'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}