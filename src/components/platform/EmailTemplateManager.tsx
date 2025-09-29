import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Send, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCommunications } from '@/hooks/useCommunications';

interface EmailTemplateManagerProps {
  clientId: string;
}

export default function EmailTemplateManager({ clientId }: EmailTemplateManagerProps) {
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useCommunications(clientId);
  const { toast } = useToast();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom' as const,
    subject: '',
    content: '',
    variables: [] as string[]
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'custom',
      subject: '',
      content: '',
      variables: []
    });
    setEditingTemplate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.content.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome e conteúdo são obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData);
      } else {
        await createTemplate(formData);
      }
      
      resetForm();
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject || '',
      content: template.content,
      variables: template.variables || []
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (templateId: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      await deleteTemplate(templateId);
    }
  };

  const handlePreview = (template: any) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      welcome: 'bg-green-100 text-green-800',
      reminder: 'bg-yellow-100 text-yellow-800',
      follow_up: 'bg-blue-100 text-blue-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.custom;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Templates de Email</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar' : 'Criar'} Template
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do template"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="welcome">Boas-vindas</option>
                    <option value="reminder">Lembrete</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Assunto</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Assunto do email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Conteúdo</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Conteúdo do email..."
                  rows={8}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use variáveis como {'{nome}'}, {'{email}'}, {'{data}'} para personalização
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">Salvar</Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge className={getTypeColor(template.type)}>
                      {template.type}
                    </Badge>
                  </div>
                  {template.subject && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Assunto:</strong> {template.subject}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.content}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handlePreview(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {templates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Nenhum template encontrado</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              {previewTemplate.subject && (
                <div>
                  <label className="block text-sm font-medium mb-1">Assunto:</label>
                  <div className="p-3 bg-muted rounded-md">
                    {previewTemplate.subject}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Conteúdo:</label>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                  {previewTemplate.content}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}