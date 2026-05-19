import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Heart, Calendar, Music, TrendingUp, FileText, Users } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

/**
 * Página inicial - Dashboard principal do sistema Clínica da Alma
 */
export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-spiritual">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin spiritual-accent" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-spiritual">
      {/* Header */}
      <header className="border-b border-spiritual">
        <div className="container py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--spiritual-gold))] to-[hsl(var(--spiritual-lilac))] flex items-center justify-center">
              <Heart className="w-6 h-6 text-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Clínica da Alma</h1>
          </div>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-gradient-to-r from-[hsl(var(--spiritual-gold))] to-[hsl(var(--spiritual-lilac))] text-foreground hover:shadow-spiritual"
          >
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-in-left">
            <h2 className="text-5xl font-bold text-foreground leading-tight">
              Transforme sua prática terapêutica
            </h2>
            <p className="text-lg text-muted-foreground">
              Clínica da Alma é um sistema completo para terapeutas que desejam oferecer um acompanhamento profundo e personalizado aos seus clientes. Organize prontuários, sessões, evolução emocional e muito mais em um único lugar elegante e intuitivo.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                size="lg"
                className="bg-gradient-to-r from-[hsl(var(--spiritual-gold))] to-[hsl(var(--spiritual-lilac))] text-foreground hover:shadow-spiritual"
              >
                Começar Agora
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[hsl(var(--spiritual-lilac))] text-foreground hover:bg-[hsl(var(--spiritual-lilac)_/_0.1)]"
              >
                Saiba Mais
              </Button>
            </div>
          </div>

          <div className="animate-slide-in-right">
            <div className="bg-gradient-to-br from-[hsl(var(--spiritual-gold)_/_0.1)] to-[hsl(var(--spiritual-lilac)_/_0.1)] rounded-2xl p-8 border border-spiritual">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-lg p-4 shadow-spiritual-sm border border-border">
                  <Users className="w-8 h-8 spiritual-accent mb-2" />
                  <p className="text-sm font-semibold">Gestão de Clientes</p>
                </div>
                <div className="bg-card rounded-lg p-4 shadow-spiritual-sm border border-border">
                  <FileText className="w-8 h-8 spiritual-accent mb-2" />
                  <p className="text-sm font-semibold">Prontuários</p>
                </div>
                <div className="bg-card rounded-lg p-4 shadow-spiritual-sm border border-border">
                  <Calendar className="w-8 h-8 spiritual-accent mb-2" />
                  <p className="text-sm font-semibold">Agenda</p>
                </div>
                <div className="bg-card rounded-lg p-4 shadow-spiritual-sm border border-border">
                  <Music className="w-8 h-8 spiritual-accent mb-2" />
                  <p className="text-sm font-semibold">Meditações</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <h3 className="text-4xl font-bold text-center mb-16 text-foreground">
          Recursos Principais
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: FileText,
              title: "Prontuário Terapêutico",
              description: "Registre bloqueios emocionais, histórico médico e objetivos pessoais de cada cliente",
            },
            {
              icon: Calendar,
              title: "Agenda Inteligente",
              description: "Organize suas sessões com calendário visual e lembretes automáticos",
            },
            {
              icon: Heart,
              title: "Evolução Emocional",
              description: "Acompanhe o progresso emocional dos seus clientes com gráficos e análises",
            },
            {
              icon: Music,
              title: "Biblioteca de Meditações",
              description: "Crie e compartilhe meditações personalizadas com seus clientes",
            },
            {
              icon: TrendingUp,
              title: "Dashboard Financeiro",
              description: "Controle suas receitas e despesas com relatórios simples e claros",
            },
            {
              icon: Users,
              title: "Gestão Completa",
              description: "Protocolos personalizados, upload de áudios e histórico de sessões",
            },
          ].map((feature, idx) => (
            <Card
              key={idx}
              className="card-spiritual hover:shadow-spiritual transition-smooth group cursor-pointer"
            >
              <div className="flex flex-col h-full">
                <feature.icon className="w-12 h-12 spiritual-accent mb-4 group-hover:scale-110 transition-smooth" />
                <h4 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h4>
                <p className="text-muted-foreground flex-grow">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="bg-gradient-to-r from-[hsl(var(--spiritual-gold)_/_0.1)] to-[hsl(var(--spiritual-lilac)_/_0.1)] rounded-2xl p-12 border border-spiritual text-center">
          <h3 className="text-3xl font-bold mb-4 text-foreground">
            Pronto para transformar sua prática?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Comece a usar Clínica da Alma hoje mesmo e ofereça um acompanhamento terapêutico mais profundo e organizado aos seus clientes.
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            size="lg"
            className="bg-gradient-to-r from-[hsl(var(--spiritual-gold))] to-[hsl(var(--spiritual-lilac))] text-foreground hover:shadow-spiritual"
          >
            Acessar Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-spiritual mt-20">
        <div className="container py-8 text-center text-muted-foreground">
          <p>© 2026 Clínica da Alma. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
