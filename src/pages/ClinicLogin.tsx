import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Brain, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClinicLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular login
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapeutic-soft via-therapeutic-light to-therapeutic-muted flex items-center justify-center p-4">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-therapeutic-primary/20"></div>
        <div className="absolute top-40 right-20 w-16 h-16 rounded-lg bg-therapeutic-secondary/20 rotate-45"></div>
        <div className="absolute bottom-40 left-1/4 w-12 h-12 rounded-full bg-therapeutic-accent/20"></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 rounded-lg bg-therapeutic-primary/10 rotate-12"></div>
      </div>

      <Card className="w-full max-w-md therapy-card relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-therapeutic rounded-2xl shadow-glow">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-therapeutic bg-clip-text text-transparent">
              Clínica Sorriso
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Psicologia & Bem-estar
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso Administrativo</h2>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais para acessar o painel da clínica
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@clinicasorriso.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-therapeutic-border focus:ring-therapeutic-primary focus:border-therapeutic-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-therapeutic-border focus:ring-therapeutic-primary focus:border-therapeutic-primary"
                required
              />
            </div>

            <Button type="submit" className="w-full calm-button py-3 text-base font-medium">
              <Heart className="h-4 w-4 mr-2" />
              Entrar na Clínica
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Credenciais de demonstração:<br />
              <span className="font-mono bg-therapeutic-light px-2 py-1 rounded">
                admin@clinicasorriso.com
              </span>
            </p>
          </div>

          <div className="text-center pt-4 border-t border-therapeutic-border">
            <p className="text-xs text-muted-foreground">
              © 2024 Clínica Sorriso • Todos os direitos reservados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}