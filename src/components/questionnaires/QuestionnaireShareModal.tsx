import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, ExternalLink, Send } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTenantId } from '@/hooks/useTenantId';

interface QuestionnaireShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaireId: string;
  questionnaireTitle: string;
}

export function QuestionnaireShareModal({ 
  open, 
  onOpenChange, 
  questionnaireId,
  questionnaireTitle 
}: QuestionnaireShareModalProps) {
  const [publicLink, setPublicLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { tenantId } = useTenantId();

  useEffect(() => {
    if (open && questionnaireId && tenantId) {
      generatePublicLink();
    }
  }, [open, questionnaireId, tenantId]);

  const generatePublicLink = async () => {
    if (!tenantId) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar seu tenant. Por favor, faça login novamente.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Criar uma resposta pendente com token público
      const publicToken = `${questionnaireId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('questionnaire_responses')
        .insert({
          questionnaire_id: questionnaireId,
          tenant_id: tenantId,
          status: 'pending',
          public_token: publicToken,
          answers: {}
        })
        .select('public_token')
        .single();

      if (error) {
        console.error('Error creating response:', error);
        throw error;
      }

      const link = `${window.location.origin}/questionario/${data.public_token}`;
      setPublicLink(link);
    } catch (error: any) {
      console.error('Error generating link:', error);
      toast({
        title: "Erro ao gerar link",
        description: error.message || "Ocorreu um erro ao gerar o link público",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link",
        variant: "destructive"
      });
    }
  };

  const openInNewTab = () => {
    window.open(publicLink, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Compartilhar Questionário</DialogTitle>
          <DialogDescription className="text-base">
            {questionnaireTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Send className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Link Público de Resposta
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Compartilhe este link com seu paciente. As respostas serão automaticamente vinculadas ao telefone informado.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Link para compartilhar:
            </label>
            <div className="flex gap-2">
              <Input
                value={publicLink}
                readOnly
                className="flex-1 font-mono text-sm bg-gray-50 dark:bg-gray-900"
                placeholder={loading ? "Gerando link..." : ""}
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
                disabled={!publicLink || loading}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={openInNewTab}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
                disabled={!publicLink || loading}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-sm mb-2">
              ℹ️ Como funciona:
            </h4>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
              <li>O paciente precisará informar nome e telefone antes de responder</li>
              <li>As respostas serão vinculadas automaticamente ao cadastro do cliente</li>
              <li>Você poderá ver as respostas na aba de clientes e aqui em questionários</li>
              <li>Cada link gerado é único e pode ser usado apenas uma vez</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button onClick={copyToClipboard} disabled={!publicLink || loading}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
