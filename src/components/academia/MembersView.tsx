import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, User, Calendar, Activity, Phone, Mail, UserPlus } from "lucide-react";
import { academiaMembers } from "@/lib/academiaMockData";

export function MembersView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const filteredMembers = academiaMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Membros</h2>
          <p className="text-muted-foreground">Gerencie os membros da sua academia</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Membro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar membros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Dialog key={member.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <Badge variant={member.status === "Ativo" ? "default" : "secondary"}>
                          {member.status}
                        </Badge>
                      </div>
                      <CardDescription>{member.plan}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Vence: {member.planExpiry}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Activity className="h-3 w-3" />
                          {member.checkIns} check-ins
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {member.name}
                    </DialogTitle>
                    <DialogDescription>
                      Detalhes completos do membro
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Informações Pessoais</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {member.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {member.phone}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Contato emergência:</span><br />
                            {member.emergencyContact}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Objetivos</h4>
                        <p className="text-sm text-muted-foreground">{member.goals}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Plano Atual</h4>
                        <div className="space-y-2">
                          <Badge variant={member.status === "Ativo" ? "default" : "secondary"}>
                            {member.status}
                          </Badge>
                          <div className="text-sm">
                            <p><strong>Plano:</strong> {member.plan}</p>
                            <p><strong>Vencimento:</strong> {member.planExpiry}</p>
                            <p><strong>Entrada:</strong> {member.joinDate}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Atividade</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Check-ins totais:</strong> {member.checkIns}</p>
                          <p><strong>Último check-in:</strong> {member.lastCheckIn}</p>
                          <p><strong>Professor:</strong> {member.trainer}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline">Editar</Button>
                    <Button variant="outline">Renovar Plano</Button>
                    <Button>Enviar Mensagem</Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}