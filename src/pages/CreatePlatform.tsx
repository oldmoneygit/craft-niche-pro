import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Brain,
  Stethoscope,
  Utensils,
  Car,
  Scissors,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreatePlatform = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    businessType: '',
    businessName: '',
    ownerName: '',
    professionalId: '',
    specialties: [],
    sessionTypes: [],
    workingHours: {},
    pricing: {},
    insurances: [],
    communicationPreference: '',
    emergencyContact: '',
    description: '',
  });

  const businessTypes = [
    {
      id: 'clinica-psicologica',
      name: 'Clínica Psicológica',
      icon: Brain,
      description: 'Psicólogos, terapeutas, neuropsicólogos',
      features: ['Agendamento terapêutico', 'Prontuário básico', 'IA especializada em saúde mental'],
    },
    {
      id: 'clinica-medica',
      name: 'Clínica Médica',
      icon: Stethoscope,
      description: 'Médicos, dentistas, fisioterapeutas',
      features: ['Gestão de consultas', 'Controle de convênios', 'Lembretes automáticos'],
    },
    {
      id: 'restaurante',
      name: 'Restaurante/Delivery',
      icon: Utensils,
      description: 'Restaurantes, lanchonetes, delivery',
      features: ['Cardápio digital', 'Pedidos online', 'Integração delivery'],
    },
    {
      id: 'autopecas',
      name: 'Loja de Autopeças',
      icon: Car,
      description: 'Autopeças, acessórios automotivos',
      features: ['Catálogo por modelo', 'Compatibilidade', 'Controle de estoque'],
    },
    {
      id: 'salao',
      name: 'Salão de Beleza',
      icon: Scissors,
      description: 'Cabeleireiros, estética, manicure',
      features: ['Agendamento por profissional', 'Galeria de trabalhos', 'Programa fidelidade'],
    },
    {
      id: 'outro',
      name: 'Outro Negócio',
      icon: Briefcase,
      description: 'Consultórios, escritórios, outros serviços',
      features: ['Plataforma personalizada', 'IA adaptável', 'Funcionalidades sob medida'],
    },
  ];

  // Configurações específicas por tipo de negócio
  const businessConfigs = {
    'clinica-psicologica': {
      professionalIdLabel: 'CRP/Registro Profissional',
      professionalIdPlaceholder: 'Ex: CRP 06/123456',
      specialtiesLabel: 'Suas Especialidades',
      sessionTypesLabel: 'Tipos de Atendimento Oferecidos',
      descriptionPlaceholder: 'Descreva brevemente sua abordagem terapêutica e diferencial...',
      specialties: [
        'Terapia Cognitivo-Comportamental (TCC)',
        'Psicanálise',
        'Terapia Familiar',
        'Terapia de Casal',
        'Neuropsicologia',
        'Psicologia Infantil',
        'Ansiedade e Depressão',
        'Transtornos Alimentares',
        'Trauma e PTSD',
        'Orientação Vocacional',
      ],
      sessionTypes: [
        'Consulta Inicial (60-90 min)',
        'Terapia Individual (50 min)',
        'Terapia de Casal (60 min)',
        'Terapia Familiar (60-90 min)',
        'Avaliação Psicológica (90-120 min)',
        'Orientação Vocacional (60 min)',
      ],
      insurances: ['Unimed', 'Bradesco Saúde', 'SulAmérica', 'Amil', 'Golden Cross', 'Porto Seguro'],
      workingDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    },
    'clinica-medica': {
      professionalIdLabel: 'CRM/Registro Profissional',
      professionalIdPlaceholder: 'Ex: CRM 123456',
      specialtiesLabel: 'Especialidades Médicas',
      sessionTypesLabel: 'Tipos de Consulta Oferecidos',
      descriptionPlaceholder: 'Descreva os serviços médicos e diferencial da clínica...',
      specialties: [
        'Clínica Geral',
        'Cardiologia',
        'Dermatologia',
        'Ginecologia',
        'Pediatria',
        'Ortopedia',
        'Oftalmologia',
        'Neurologia',
        'Psiquiatria',
        'Endocrinologia',
      ],
      sessionTypes: [
        'Consulta de Retorno (30 min)',
        'Consulta Inicial (45 min)',
        'Consulta de Urgência (20 min)',
        'Exame Preventivo (30 min)',
        'Procedimento Ambulatorial (60 min)',
        'Teleconsulta (30 min)',
      ],
      insurances: ['Unimed', 'Bradesco Saúde', 'SulAmérica', 'Amil', 'Golden Cross', 'Porto Seguro'],
      workingDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    },
    'restaurante': {
      professionalIdLabel: 'CNPJ/CPF',
      professionalIdPlaceholder: 'Ex: 12.345.678/0001-90',
      specialtiesLabel: 'Tipos de Culinária',
      sessionTypesLabel: 'Modalidades de Atendimento',
      descriptionPlaceholder: 'Descreva o conceito do seu restaurante, especialidades do chef...',
      specialties: [
        'Brasileira',
        'Italiana',
        'Japonesa',
        'Árabe',
        'Vegetariana/Vegana',
        'Churrasco',
        'Pizzaria',
        'Hamburgeria',
        'Comida Caseira',
        'Fast Food',
      ],
      sessionTypes: [
        'Delivery',
        'Balcão (Retirada)',
        'Salão (Mesa)',
        'Drive-thru',
        'Eventos/Catering',
        'Encomendas',
      ],
      insurances: ['Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Dinheiro', 'Vale Refeição', 'Vale Alimentação'],
      workingDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
    },
    'autopecas': {
      professionalIdLabel: 'CNPJ/CPF',
      professionalIdPlaceholder: 'Ex: 12.345.678/0001-90',
      specialtiesLabel: 'Marcas que Trabalha',
      sessionTypesLabel: 'Tipos de Atendimento',
      descriptionPlaceholder: 'Descreva o foco da loja, especialidades em determinadas marcas...',
      specialties: [
        'Chevrolet',
        'Ford',
        'Volkswagen',
        'Fiat',
        'Honda',
        'Toyota',
        'Hyundai',
        'Renault',
        'Nissan',
        'Peugeot',
      ],
      sessionTypes: [
        'Balcão Presencial',
        'Consulta por WhatsApp',
        'Orçamento por Foto',
        'Entrega no Local',
        'Retirada na Loja',
        'Instalação/Montagem',
      ],
      insurances: ['Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Dinheiro', 'Boleto', 'Parcelamento'],
      workingDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    },
    'salao': {
      professionalIdLabel: 'CNPJ/CPF',
      professionalIdPlaceholder: 'Ex: 12.345.678/0001-90',
      specialtiesLabel: 'Serviços Oferecidos',
      sessionTypesLabel: 'Tipos de Atendimento',
      descriptionPlaceholder: 'Descreva o conceito do salão, especialidades e diferencial...',
      specialties: [
        'Corte Feminino',
        'Corte Masculino',
        'Coloração',
        'Mechas/Luzes',
        'Escova/Prancha',
        'Penteados',
        'Manicure/Pedicure',
        'Depilação',
        'Sobrancelha',
        'Maquiagem',
      ],
      sessionTypes: [
        'Agendamento Individual',
        'Agendamento por Profissional',
        'Day Beauty',
        'Pacotes de Noiva',
        'Domicílio',
        'Eventos',
      ],
      insurances: ['Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Dinheiro', 'Parcelamento'],
      workingDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    },
    'outro': {
      professionalIdLabel: 'CNPJ/CPF/Registro',
      professionalIdPlaceholder: 'Ex: CNPJ, CPF ou registro profissional',
      specialtiesLabel: 'Áreas de Atuação',
      sessionTypesLabel: 'Tipos de Atendimento',
      descriptionPlaceholder: 'Descreva seu negócio, serviços oferecidos e diferencial...',
      specialties: [
        'Consultoria',
        'Assessoria',
        'Treinamentos',
        'Palestras',
        'Coaching',
        'Mentoria',
        'Auditoria',
        'Planejamento',
        'Análise',
        'Desenvolvimento',
      ],
      sessionTypes: [
        'Presencial',
        'Online',
        'Híbrido',
        'Domicílio',
        'Corporativo',
        'Individual',
      ],
      insurances: ['Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Dinheiro', 'Boleto', 'Transferência'],
      workingDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    }
  };

  // Função para obter configuração do tipo de negócio atual
  const getCurrentConfig = () => {
    return businessConfigs[formData.businessType] || businessConfigs['outro'];
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreatePlatform = async () => {
    setIsCreating(true);
    // Simular criação da plataforma
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsCreating(false);
    
    // Redirecionar baseado no tipo de negócio
    if (formData.businessType === 'restaurante') {
      navigate('/restaurant-platform');
    } else if (formData.businessType === 'autopecas') {
      navigate('/autopeças-platform');
    } else if (formData.businessType === 'salao') {
      navigate('/salao-platform');
    } else {
      navigate('/platform/1');
    }
  };

  const renderStep1 = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Escolha seu tipo de negócio</CardTitle>
        <p className="text-muted-foreground">
          Selecione o tipo que melhor descreve seu negócio para personalizarmos sua plataforma
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {businessTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                className={`p-6 border rounded-lg cursor-pointer transition-all hover:shadow-hover ${
                  formData.businessType === type.id
                    ? 'border-primary bg-primary/5 shadow-card'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setFormData({ ...formData, businessType: type.id })}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{type.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                    <div className="space-y-1">
                      {type.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 mr-1 text-success" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => {
    const config = getCurrentConfig();
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Informações do seu negócio</CardTitle>
          <p className="text-muted-foreground">
            Conte-nos mais sobre sua {businessTypes.find(t => t.id === formData.businessType)?.name.toLowerCase()}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nome da {formData.businessType === 'clinica-psicologica' || formData.businessType === 'clinica-medica' ? 'Clínica' : 'Empresa'}</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder={formData.businessType === 'clinica-psicologica' ? "Ex: Clínica Mente Sã" : formData.businessType === 'restaurante' ? "Ex: Restaurante Sabor & Arte" : "Ex: Nome da Empresa"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerName">Seu Nome Completo</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder={formData.businessType === 'clinica-psicologica' ? "Ex: Dra. Maria Silva" : formData.businessType === 'clinica-medica' ? "Ex: Dr. João Santos" : "Ex: Maria Silva"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="professionalId">{config.professionalIdLabel}</Label>
            <Input
              id="professionalId"
              value={formData.professionalId}
              onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
              placeholder={config.professionalIdPlaceholder}
            />
          </div>

          <div className="space-y-3">
            <Label>{config.specialtiesLabel}</Label>
            <div className="grid md:grid-cols-2 gap-2">
              {config.specialties.map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialty}
                    checked={formData.specialties.includes(specialty)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          specialties: [...formData.specialties, specialty]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          specialties: formData.specialties.filter(s => s !== specialty)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={specialty} className="text-sm">{specialty}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição {formData.businessType === 'clinica-psicologica' || formData.businessType === 'clinica-medica' ? 'da Clínica' : 'do Negócio'} (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={config.descriptionPlaceholder}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStep3 = () => {
    const config = getCurrentConfig();
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Configurações operacionais</CardTitle>
          <p className="text-muted-foreground">
            Configure como sua {businessTypes.find(t => t.id === formData.businessType)?.name.toLowerCase()} funciona para personalizarmos a IA
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>{config.sessionTypesLabel}</Label>
            <div className="space-y-2">
              {config.sessionTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={formData.sessionTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          sessionTypes: [...formData.sessionTypes, type]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          sessionTypes: formData.sessionTypes.filter(s => s !== type)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={type} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Horários de Funcionamento</Label>
            <div className="grid gap-3">
              {config.workingDays.map((day) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-20 text-sm">{day}</div>
                  <Input placeholder="08:00" className="w-24" />
                  <span className="text-muted-foreground">às</span>
                  <Input placeholder="18:00" className="w-24" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>{formData.businessType === 'clinica-psicologica' || formData.businessType === 'clinica-medica' ? 'Convênios Aceitos' : 'Formas de Pagamento'} (opcional)</Label>
            <div className="flex flex-wrap gap-2">
              {config.insurances.map((insurance) => (
                <Badge
                  key={insurance}
                  variant={formData.insurances.includes(insurance) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    if (formData.insurances.includes(insurance)) {
                      setFormData({
                        ...formData,
                        insurances: formData.insurances.filter(i => i !== insurance)
                      });
                    } else {
                      setFormData({
                        ...formData,
                        insurances: [...formData.insurances, insurance]
                      });
                    }
                  }}
                >
                  {insurance}
                </Badge>
              ))}
            </div>
          </div>

          {(formData.businessType === 'clinica-psicologica' || formData.businessType === 'clinica-medica') && (
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contato de Emergência</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="(11) 99999-9999"
              />
              <p className="text-xs text-muted-foreground">
                Para casos de crise que a IA identificar
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderStep4 = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Revisão e Criação</CardTitle>
        <p className="text-muted-foreground">
          Confirme as informações e criaremos sua plataforma personalizada
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div>
            <h4 className="font-semibold">Tipo de Negócio</h4>
            <p className="text-sm text-muted-foreground">
              {businessTypes.find(t => t.id === formData.businessType)?.name}
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Nome</h4>
            <p className="text-sm text-muted-foreground">{formData.businessName}</p>
          </div>
          <div>
            <h4 className="font-semibold">Profissional</h4>
            <p className="text-sm text-muted-foreground">
              {formData.ownerName} - {formData.professionalId}
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Especialidades</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.specialties.slice(0, 3).map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {formData.specialties.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{formData.specialties.length - 3} mais
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-card p-6 rounded-lg border border-primary/20">
          <h4 className="font-semibold mb-3 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-primary" />
            O que será criado:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-success">
              <CheckCircle className="h-4 w-4 mr-2" />
              Plataforma web personalizada
            </div>
            <div className="flex items-center text-success">
              <CheckCircle className="h-4 w-4 mr-2" />
              Agente de IA treinado para sua especialidade
            </div>
            <div className="flex items-center text-success">
              <CheckCircle className="h-4 w-4 mr-2" />
              Sistema de agendamento otimizado
            </div>
            <div className="flex items-center text-success">
              <CheckCircle className="h-4 w-4 mr-2" />
              Integração WhatsApp Business
            </div>
            <div className="flex items-center text-success">
              <CheckCircle className="h-4 w-4 mr-2" />
              Dashboard administrativo completo
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-primary hover:shadow-hover"
          size="lg"
          onClick={handleCreatePlatform}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Criando sua plataforma...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5 mr-2" />
              Criar Minha Plataforma
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const steps = [
    { number: 1, title: 'Tipo de Negócio', component: renderStep1 },
    { number: 2, title: 'Informações', component: renderStep2 },
    { number: 3, title: 'Configurações', component: renderStep3 },
    { number: 4, title: 'Confirmação', component: renderStep4 },
  ];

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step.number
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.number}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className="text-sm font-medium">{step.title}</div>
                </div>
                {step.number < steps.length && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {steps[currentStep - 1].component()}
        </div>

        {/* Navigation */}
        {!isCreating && (
          <div className="flex justify-between max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            {currentStep < 4 && (
              <Button
                onClick={handleNext}
                disabled={currentStep === 1 && !formData.businessType}
                className="bg-gradient-primary hover:shadow-hover"
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePlatform;