import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, Edit, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Anamnesis {
  id: string;
  anamnesis_date: string;
  main_goal: string;
  current_weight: number;
  height: number;
  created_at: string;
}

interface AnamnesisHistoryProps {
  clientId: string;
  tenantId: string;
}

export function AnamnesisHistory({ clientId, tenantId }: AnamnesisHistoryProps) {
  const navigate = useNavigate();
  const [anamneses, setAnamneses] = useState<Anamnesis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 AnamnesisHistory montado com:', { clientId, tenantId });
    loadAnamneses();
  }, [clientId]);

  const loadAnamneses = async () => {
    console.log('🔍 Buscando anamneses para:', { clientId, tenantId });
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('anamneses' as any)
        .select('id, anamnesis_date, main_goal, current_weight, height, created_at')
        .eq('client_id', clientId)
        .eq('tenant_id', tenantId)
        .order('anamnesis_date', { ascending: false });

      console.log('📊 Resultado da query:', { data, error, count: data?.length });

      if (error) {
        console.error('❌ Erro na query:', error);
        throw error;
      }
      
      console.log('✅ Anamneses carregadas:', data?.length || 0);
      setAnamneses((data as any) || []);
    } catch (error) {
      console.error('Erro ao carregar anamneses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateIMC = (weight: number, height: number) => {
    if (!weight || !height) return '--';
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  if (loading) {
    return <div className="text-muted-foreground text-center py-4">Carregando...</div>;
  }

  if (anamneses.length === 0) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">Nenhuma anamnese registrada ainda.</p>
          <Button
            onClick={() => navigate(`/platform/${tenantId}/anamnese/nova?client=${clientId}`)}
            className="bg-green-600 hover:bg-green-700"
          >
            Criar Primeira Anamnese
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {anamneses.map((anamnesis) => (
        <Card key={anamnesis.id} className="bg-card border-border hover:border-muted-foreground/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">
                    {format(new Date(anamnesis.anamnesis_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                
                <p className="text-sm text-foreground mb-2">
                  <strong>Objetivo:</strong> {anamnesis.main_goal}
                </p>
                
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Peso: {anamnesis.current_weight || '--'} kg</span>
                  <span>Altura: {anamnesis.height || '--'} cm</span>
                  <span>IMC: {calculateIMC(anamnesis.current_weight, anamnesis.height)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/platform/${tenantId}/anamnese/${anamnesis.id}/view`)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver
                </Button>
                <Button
                  onClick={() => navigate(`/platform/${tenantId}/anamnese/${anamnesis.id}`)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button
        onClick={() => navigate(`/platform/${tenantId}/anamnese/nova?client=${clientId}`)}
        variant="outline"
        className="w-full"
      >
        + Nova Anamnese
      </Button>
    </div>
  );
}
