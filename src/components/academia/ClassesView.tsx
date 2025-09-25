import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Users, User, Plus, CalendarDays } from "lucide-react";
import { academiaClasses } from "@/lib/academiaMockData";

export function ClassesView() {
  const [selectedDate, setSelectedDate] = useState("2024-01-11");

  const todayClasses = academiaClasses.filter(cls => cls.date === selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Agendada":
        return "default";
      case "Lotada":
        return "destructive";
      case "Concluída":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Aulas e Atividades</h2>
          <p className="text-muted-foreground">Gerencie as aulas e horários da academia</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Grade Semanal
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Aula
          </Button>
        </div>
      </div>

      {/* Calendar View Today */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Aulas de Hoje - {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </CardTitle>
          <CardDescription>
            {todayClasses.length} aulas programadas para hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayClasses.map((cls) => (
              <Dialog key={cls.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                        <Badge variant={getStatusColor(cls.status)}>
                          {cls.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {cls.instructor}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {cls.time} - {cls.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {cls.enrolled}/{cls.capacity} inscritos
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {cls.name}
                    </DialogTitle>
                    <DialogDescription>
                      Detalhes da aula
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Horário</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Data:</strong> {new Date(cls.date).toLocaleDateString('pt-BR')}</p>
                          <p><strong>Início:</strong> {cls.time}</p>
                          <p><strong>Duração:</strong> {cls.duration}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Instrutor</h4>
                        <div className="text-sm">
                          <p>{cls.instructor}</p>
                          <Badge variant="outline" className="mt-1">{cls.status}</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Participantes</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{cls.enrolled} de {cls.capacity} vagas</span>
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline">Ver Lista</Button>
                      <Button variant="outline">Editar</Button>
                      {cls.status === "Agendada" && (
                        <Button>Iniciar Aula</Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Grade da Semana</CardTitle>
          <CardDescription>Visão geral das aulas programadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <p>Grade semanal em desenvolvimento</p>
            <p className="text-sm">Em breve você poderá visualizar toda a programação semanal</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}