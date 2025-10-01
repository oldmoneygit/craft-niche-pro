import { useState, useEffect } from 'react';
import { Brain, Plus, Trash2, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const CATEGORIES = [
  { value: 'faq', label: 'Perguntas Frequentes', color: 'bg-blue-100 text-blue-700', icon: '❓' },
  { value: 'policy', label: 'Políticas e Regras', color: 'bg-purple-100 text-purple-700', icon: '📋' },
  { value: 'content', label: 'Conteúdo Educativo', color: 'bg-green-100 text-green-700', icon: '📚' },
  { value: 'service', label: 'Serviços', color: 'bg-orange-100 text-orange-700', icon: '💼' },
  { value: 'tone', label: 'Tom de Voz', color: 'bg-pink-100 text-pink-700', icon: '🎭' }
];

export default function PlatformKnowledge() {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const { clientConfig, loading: configLoading } = useClientConfig();
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    category: 'faq',
    title: '',
    content: '',
    keywords: ''
  });

  useEffect(() => {
    if (tenantId) fetchKnowledge();
  }, [tenantId]);

  const fetchKnowledge = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('usage_count', { ascending: false });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar conhecimento", variant: "destructive" });
    } else {
      setKnowledge(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!tenantId || !formData.title.trim() || !formData.content.trim()) {
      toast({ title: "Campos obrigatórios", description: "Preencha título e conteúdo", variant: "destructive" });
      return;
    }

    const keywordsArray = formData.keywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);

    const { error } = await supabase.from('knowledge_base').insert({
      tenant_id: tenantId,
      category: formData.category,
      title: formData.title,
      content: formData.content,
      keywords: keywordsArray
    });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível adicionar", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Conhecimento adicionado!" });
      setFormData({ category: 'faq', title: '', content: '', keywords: '' });
      setIsCreating(false);
      fetchKnowledge();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar?')) return;

    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível deletar", variant: "destructive" });
    } else {
      toast({ title: "Deletado", description: "Conhecimento removido" });
      fetchKnowledge();
    }
  };

  const getCategoryHelp = (category: string) => {
    switch (category) {
      case 'faq': return 'Perguntas que você recebe frequentemente';
      case 'policy': return 'Regras do seu atendimento (preços, horários, convênios)';
      case 'content': return 'Conteúdo educativo que você criou';
      case 'service': return 'Serviços que você oferece';
      case 'tone': return 'Como você gosta de se comunicar';
      default: return '';
    }
  };

  if (configLoading || loading) {
    return (
      <DashboardTemplate title="Base de Conhecimento">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardTemplate>
    );
  }

  if (!clientConfig) {
    return (
      <DashboardTemplate title="Base de Conhecimento">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Plataforma não encontrada</h1>
            <p className="text-muted-foreground">A plataforma solicitada não existe ou não está disponível.</p>
          </div>
        </div>
      </DashboardTemplate>
    );
  }

  return (
    <DashboardTemplate title="Base de Conhecimento">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-7 h-7 text-primary" />
              Base de Conhecimento da IA
            </h2>
            <p className="text-muted-foreground mt-1">
              Ensine sua assistente a responder como você responderia
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Conhecimento
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => {
            const count = knowledge.filter(k => k.category === cat.value).length;
            return (
              <Card key={cat.value}>
                <CardContent className="p-4">
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <p className="text-sm text-muted-foreground">{cat.label}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modal Criar */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Conhecimento</DialogTitle>
              <DialogDescription>
                Adicione informações que sua IA poderá usar para responder pacientes
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {getCategoryHelp(formData.category)}
                </p>
              </div>

              <div>
                <Label>Título/Pergunta</Label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Posso comer frutas à noite?"
                />
              </div>

              <div>
                <Label>Sua Resposta/Conteúdo</Label>
                <Textarea
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  placeholder="Escreva como você responderia para um paciente..."
                  rows={6}
                />
              </div>

              <div>
                <Label>Palavras-chave (opcional, separadas por vírgula)</Label>
                <Input
                  value={formData.keywords}
                  onChange={e => setFormData({...formData, keywords: e.target.value})}
                  placeholder="frutas, noite, carboidrato, banana"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ajuda a IA encontrar essa resposta quando necessário
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ category: 'faq', title: '', content: '', keywords: '' });
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleCreate} className="flex-1">
                Salvar Conhecimento
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lista */}
        <div className="space-y-3">
          {knowledge.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Nenhum conhecimento cadastrado ainda</p>
                <p className="text-sm text-muted-foreground">
                  Adicione perguntas frequentes e informações para sua IA usar nas respostas
                </p>
              </CardContent>
            </Card>
          ) : (
            knowledge.map(item => {
              const cat = CATEGORIES.find(c => c.value === item.category);
              return (
                <Card key={item.id} className="hover:shadow-md transition">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded ${cat?.color}`}>
                            {cat?.icon} {cat?.label}
                          </span>
                          {item.usage_count > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Usada {item.usage_count}× pela IA
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{item.content}</p>
                        {item.keywords?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.keywords.map((kw: string, i: number) => (
                              <span key={i} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button 
                        onClick={() => handleDelete(item.id)}
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardTemplate>
  );
}
