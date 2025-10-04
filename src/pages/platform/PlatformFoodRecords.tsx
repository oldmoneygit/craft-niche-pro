import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, ClipboardList, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PlatformFoodRecords() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', tenantId],
    queryFn: async () => {
      console.log('🔍 Buscando clientes para tenant:', tenantId);

      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('tenant_id', tenantId)
        .order('name');

      if (error) {
        console.error('❌ Erro ao buscar clientes:', error);
        console.log('📊 Usando clientes mock temporários');

        return [
          { id: 'mock-1', name: 'João Silva', email: 'joao@example.com' },
          { id: 'mock-2', name: 'Maria Santos', email: 'maria@example.com' },
          { id: 'mock-3', name: 'Pedro Oliveira', email: 'pedro@example.com' }
        ];
      }

      console.log('✅ Clientes carregados:', data?.length || 0);
      return data || [];
    }
  });

  const { data: records = [] } = useQuery({
    queryKey: ['food-records', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];

      console.log('🔍 Buscando recordatórios para cliente:', selectedClient);

      const { data, error } = await supabase
        .from('food_records')
        .select(`
          id,
          record_date,
          notes,
          created_at,
          record_meals(
            id,
            record_items(
              kcal_total,
              protein_total,
              carb_total,
              fat_total
            )
          )
        `)
        .eq('client_id', selectedClient)
        .order('record_date', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar recordatórios:', error);
      } else {
        console.log('✅ Recordatórios carregados:', data?.length || 0);
      }

      return data || [];
    },
    enabled: !!selectedClient
  });

  const handleCreateRecord = (clientId: string) => {
    navigate(`/platform/${tenantId}/recordatorio/novo?client=${clientId}`);
  };

  const calculateTotals = (record: any) => {
    let totals = { kcal: 0, protein: 0, carb: 0, fat: 0 };

    record.record_meals?.forEach((meal: any) => {
      meal.record_items?.forEach((item: any) => {
        totals.kcal += item.kcal_total || 0;
        totals.protein += item.protein_total || 0;
        totals.carb += item.carb_total || 0;
        totals.fat += item.fat_total || 0;
      });
    });

    return totals;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/platform/${tenantId}`)}
            className="text-gray-100 hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-100">
              <ClipboardList className="h-8 w-8" />
              Recordatório Alimentar
            </h1>
            <p className="text-gray-400 mt-1">
              Registre o que seus pacientes realmente comem
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="bg-gray-700/50">
              <CardTitle className="text-lg text-gray-100">Pacientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 bg-gray-800">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client.id)}
                  className={`w-full p-3 text-left rounded-lg transition-colors ${
                    selectedClient === client.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">{client.name}</div>
                  {client.email && (
                    <div className="text-xs opacity-70 truncate">{client.email}</div>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {!selectedClient ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="py-12">
                  <EmptyState
                    icon={ClipboardList}
                    title="Selecione um paciente"
                    description="Escolha um paciente na lista ao lado para ver seus recordatórios"
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-100">
                    Recordatórios de {clients.find(c => c.id === selectedClient)?.name}
                  </h2>
                  <Button
                    onClick={() => handleCreateRecord(selectedClient)}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Recordatório
                  </Button>
                </div>

                {records.length === 0 ? (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="py-12">
                      <EmptyState
                        icon={Calendar}
                        title="Nenhum recordatório"
                        description="Crie o primeiro recordatório para este paciente"
                        action={
                          <Button
                            onClick={() => handleCreateRecord(selectedClient)}
                            className="bg-primary hover:bg-primary/90 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Recordatório
                          </Button>
                        }
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {records.map((record) => {
                      const totals = calculateTotals(record);
                      return (
                        <Card
                          key={record.id}
                          className="cursor-pointer bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all"
                          onClick={() => navigate(`/platform/${tenantId}/recordatorio/${record.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="font-semibold text-gray-100">
                                    {format(parseISO(record.record_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                  </span>
                                </div>
                                {record.notes && (
                                  <p className="text-sm text-gray-400 line-clamp-2">
                                    {record.notes}
                                  </p>
                                )}
                                <div className="flex gap-4 mt-3 text-sm text-gray-100">
                                  <span>
                                    <span className="font-medium">{Math.round(totals.kcal)}</span> kcal
                                  </span>
                                  <span className="text-gray-500">•</span>
                                  <span>
                                    <span className="font-medium">{Math.round(totals.protein)}</span>g prot
                                  </span>
                                  <span className="text-gray-500">•</span>
                                  <span>
                                    <span className="font-medium">{Math.round(totals.carb)}</span>g carb
                                  </span>
                                  <span className="text-gray-500">•</span>
                                  <span>
                                    <span className="font-medium">{Math.round(totals.fat)}</span>g gord
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-400">
                                  {record.record_meals?.length || 0} refeições
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
