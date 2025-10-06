import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';

interface BasicInfoCardProps {
  title: string;
  setTitle: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  onLoadTemplate: (templateId: string) => void;
  onOpenAI: () => void;
}

export function BasicInfoCard({
  title,
  setTitle,
  category,
  setCategory,
  description,
  setDescription,
  onLoadTemplate,
  onOpenAI
}: BasicInfoCardProps) {
  const tenantId = useTenantId();
  const [defaultTemplates, setDefaultTemplates] = useState<any[]>([]);
  const [myTemplates, setMyTemplates] = useState<any[]>([]);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [tenantId]);

  const loadTemplates = async () => {
    const { data: defaults } = await (supabase as any)
      .from('questionnaire_templates')
      .select('*')
      .eq('is_default', true)
      .order('name');

    const { data: userTemplates } = await (supabase as any)
      .from('questionnaire_templates')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_default', false)
      .order('name');

    setDefaultTemplates(defaults || []);
    setMyTemplates(userTemplates || []);
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Informações do Questionário
      </h2>

      {/* Templates Dropdown */}
      <div className="mb-4">
        <Label className="text-gray-700 dark:text-gray-300">Começar com Template</Label>
        <Select 
          onValueChange={async (value) => {
            setLoadingTemplate(true);
            await onLoadTemplate(value);
            setLoadingTemplate(false);
          }}
          disabled={loadingTemplate}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder={loadingTemplate ? "Carregando template..." : "Criar do zero"} />
          </SelectTrigger>
          <SelectContent>
            {defaultTemplates.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                  📋 Templates Padrão
                </div>
                {defaultTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </>
            )}

            {myTemplates.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                  💾 Meus Templates
                </div>
                {myTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Loading Indicator */}
      {loadingTemplate && (
        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Carregando template...
          </span>
        </div>
      )}

      {/* Botão IA */}
      <Button
        onClick={onOpenAI}
        disabled={loadingTemplate}
        className="w-full mb-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/30"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Criar com Assistente de IA
      </Button>

      {/* Título */}
      <div className="mb-4">
        <Label className="text-gray-700 dark:text-gray-300">Título *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Avaliação de Hábitos Alimentares"
          className="mt-1.5"
          disabled={loadingTemplate}
        />
      </div>

      {/* Categoria */}
      <div className="mb-4">
        <Label className="text-gray-700 dark:text-gray-300">Categoria</Label>
        <Select value={category} onValueChange={setCategory} disabled={loadingTemplate}>
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="anamnese">Anamnese</SelectItem>
            <SelectItem value="habitos">Hábitos</SelectItem>
            <SelectItem value="recordatorio">Recordatório</SelectItem>
            <SelectItem value="satisfacao">Satisfação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Descrição */}
      <div>
        <Label className="text-gray-700 dark:text-gray-300">Descrição</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o objetivo deste questionário..."
          rows={3}
          className="mt-1.5"
          disabled={loadingTemplate}
        />
      </div>
    </div>
  );
}
