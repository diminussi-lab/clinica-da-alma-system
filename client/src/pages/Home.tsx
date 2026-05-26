import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Heart, Calendar, Music, TrendingUp, FileText, Users, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const { user, isAuthenticated, login, loading } = useAuth();
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await login(password);
      toast.success("Login realizado com sucesso");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível entrar. Verifique a senha configurada.");
    }
  };

  const handleLearnMore = () => {
    document.getElementById("recursos")?.scrollIntoView({ behavior: "smooth" });
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-spiritual">
      <header className="border-b border-spiritual">
        <div className="container py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--spiritual-gold))] to-[hsl(var(--spiritual-lilac))] flex items-center justify-center">
              <Heart className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Clínica da Alma</h1>
          </div>
        </div>
      </header>

      <section className="container py-16">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="space-y-6 animate-slide-in-left">
            <h2 className="text-5xl font-bold text-slate-900 leading-tight">
              Transforme sua prática terapêutica
            </h2>
            <p className="text-lg text-slate-600">
              Clínica da Alma é um sistema completo para terapeutas que desejam oferecer acompanhamento profundo, seguro e persistente aos clientes. Organize prontuários, sessões, evolução emocional, áudios, protocolos, uploads e financeiro em um único painel.
            </p>
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handleLearnMore}
                size="lg"
                variant="outline"
                className="border-[hsl(var(--spiritual-lilac))] text-slate-900 hover:bg-[hsl(var(--spiritual-lilac)_/_0.1)]"
              >
                Conhecer recursos
              </Button>
            </div>
          </div>

          <Card className="card-spiritual p-8 animate-slide-in-right">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[hsl(var(--spiritual-gold))] to-[hsl(var(--spiritual-lilac))] flex items-center justify-center">
                <Lock className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Acesso seguro</h3>
                <p className="text-sm text-slate-600">Login local, sem Manus Auth ou OAuth externo.</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">Senha de acesso</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite a senha configurada"
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || password.length === 0}
                className="w-full bg-gradient-to-r from-[hsl(var(--spiritual-gold))] to-[hsl(var(--spiritual-lilac))] text-slate-900 hover:shadow-spiritual"
              >
                {loading ? "Entrando..." : "Entrar no sistema"}
              </Button>
            </form>

            <p className="mt-4 text-xs text-slate-500">
              Configure a senha em <strong>LOCAL_AUTH_PASSWORD</strong> na Vercel. Em desenvolvimento, existe uma senha provisória apenas para testes.
            </p>
          </Card>
        </div>
      </section>

      <section id="recursos" className="container py-20">
        <h3 className="text-4xl font-bold text-center mb-16 text-slate-900">
          Recursos Principais
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: "Clientes",
              description: "Cadastro completo com contatos, endereço, responsáveis e observações iniciais.",
            },
            {
              icon: FileText,
              title: "Prontuários",
              description: "Histórico terapêutico, bloqueios emocionais, objetivos e evolução do tratamento.",
            },
            {
              icon: Calendar,
              title: "Sessões e agenda",
              description: "Atendimentos realizados, espaços terapêuticos, duração, técnicas e status financeiro.",
            },
            {
              icon: Heart,
              title: "Histórico emocional e energético",
              description: "Registros comparáveis de ansiedade, bem-estar, energia e notas da terapeuta.",
            },
            {
              icon: Music,
              title: "Meditações, áudios e protocolos",
              description: "Materiais vinculados ao cliente, protocolos ativos e biblioteca de meditações.",
            },
            {
              icon: TrendingUp,
              title: "Financeiro e uploads",
              description: "Receitas, despesas, anexos, documentos, relatórios e arquivos protegidos por storage.",
            },
          ].map((feature) => (
            <Card
              key={feature.title}
              className="card-spiritual hover:shadow-spiritual transition-smooth group"
            >
              <div className="flex flex-col h-full">
                <feature.icon className="w-12 h-12 spiritual-accent mb-4 group-hover:scale-110 transition-smooth" />
                <h4 className="text-xl font-semibold mb-2 text-slate-900">{feature.title}</h4>
                <p className="text-slate-600 flex-grow">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-spiritual mt-20">
        <div className="container py-8 text-center text-slate-600">
          <p>© 2026 Clínica da Alma. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
