import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, FileText, Music, TrendingUp, DollarSign, Plus, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch data
  const clientsQuery = trpc.clients.list.useQuery(undefined, { enabled: !!user });
  const appointmentsQuery = trpc.appointments.listByTherapist.useQuery(undefined, { enabled: !!user });
  const financialQuery = trpc.financialRecords.listByTherapist.useQuery(undefined, { enabled: !!user });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-spiritual">
        <Loader2 className="w-12 h-12 animate-spin spiritual-accent" />
      </div>
    );
  }

  const clients = clientsQuery.data || [];
  const appointments = appointmentsQuery.data || [];
  const financialRecords = financialQuery.data || [];

  // Calculate financial summary
  const totalIncome = financialRecords
    .filter(r => r.recordType === "income")
    .reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);

  const totalExpense = financialRecords
    .filter(r => r.recordType === "expense")
    .reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);

  const upcomingAppointments = appointments
    .filter(a => new Date(a.appointmentDate) > new Date())
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Bem-vindo, {user.name}!</h1>
            <p className="text-muted-foreground mt-2">Gerencie sua prática terapêutica com elegância</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="card-spiritual">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total de Clientes</p>
                <p className="text-3xl font-bold text-foreground">{clients.length}</p>
              </div>
              <Users className="w-8 h-8 spiritual-accent" />
            </div>
          </Card>

          <Card className="card-spiritual">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Próximas Sessões</p>
                <p className="text-3xl font-bold text-foreground">{upcomingAppointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 spiritual-accent" />
            </div>
          </Card>

          <Card className="card-spiritual">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Receita Total</p>
                <p className="text-3xl font-bold text-foreground">R$ {totalIncome.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 spiritual-accent" />
            </div>
          </Card>

          <Card className="card-spiritual">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Saldo</p>
                <p className="text-3xl font-bold spiritual-accent">R$ {(totalIncome - totalExpense).toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 spiritual-accent" />
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="appointments">Agenda</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Próximas Sessões */}
              <Card className="card-spiritual">
                <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 spiritual-accent" />
                  Próximas Sessões
                </h3>
                <div className="space-y-3">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map(apt => (
                      <div key={apt.id} className="p-3 bg-background rounded-lg border border-border">
                        <p className="font-semibold text-foreground">Sessão #{apt.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(apt.appointmentDate).toLocaleDateString("pt-BR", {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Nenhuma sessão agendada</p>
                  )}
                </div>
              </Card>

              {/* Resumo Financeiro */}
              <Card className="card-spiritual">
                <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                  <DollarSign className="w-5 h-5 spiritual-accent" />
                  Resumo Financeiro
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                    <span className="text-muted-foreground">Receita Total</span>
                    <span className="font-semibold text-foreground">R$ {totalIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                    <span className="text-muted-foreground">Despesas</span>
                    <span className="font-semibold text-foreground">R$ {totalExpense.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-[hsl(var(--spiritual-gold)_/_0.1)] to-[hsl(var(--spiritual-lilac)_/_0.1)] rounded-lg border border-spiritual">
                    <span className="font-semibold text-foreground">Saldo</span>
                    <span className="font-bold spiritual-accent">R$ {(totalIncome - totalExpense).toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-foreground">Meus Clientes</h3>
              <Button
                onClick={() => navigate("/clients/new")}
                className="bg-gradient-to-r from-[hsl(var(--spiritual-gold))] to-[hsl(var(--spiritual-lilac))] text-foreground hover:shadow-spiritual"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {clients.length > 0 ? (
                clients.map(client => (
                  <Card
                    key={client.id}
                    className="card-spiritual cursor-pointer hover:shadow-spiritual transition-smooth"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <h4 className="text-lg font-semibold text-foreground mb-2">{client.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{client.email || "Sem email"}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${client.isActive ? "bg-[hsl(var(--spiritual-gold)_/_0.1)] text-foreground" : "bg-muted text-muted-foreground"}`}>
                        {client.isActive ? "Ativo" : "Inativo"}
                      </span>
                      <Button variant="ghost" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-foreground">Agenda</h3>
              <Button
                onClick={() => navigate("/appointments/new")}
                className="bg-gradient-to-r from-[hsl(var(--spiritual-gold))] to-[hsl(var(--spiritual-lilac))] text-foreground hover:shadow-spiritual"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
            <Card className="card-spiritual">
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.slice(0, 10).map(apt => (
                    <div key={apt.id} className="p-4 bg-background rounded-lg border border-border hover:border-spiritual transition-smooth">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-foreground">Sessão #{apt.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(apt.appointmentDate).toLocaleDateString("pt-BR", {
                              weekday: "long",
                              day: "2-digit",
                              month: "long",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${apt.status === "scheduled" ? "bg-[hsl(var(--spiritual-lilac)_/_0.1)] text-foreground" : "bg-muted text-muted-foreground"}`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum agendamento</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-foreground">Financeiro</h3>
              <Button
                onClick={() => navigate("/financial/new")}
                className="bg-gradient-to-r from-[hsl(var(--spiritual-gold))] to-[hsl(var(--spiritual-lilac))] text-foreground hover:shadow-spiritual"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Registro
              </Button>
            </div>
            <Card className="card-spiritual">
              <div className="space-y-3">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Receita Total</p>
                    <p className="text-2xl font-bold spiritual-accent">R$ {totalIncome.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Despesas</p>
                    <p className="text-2xl font-bold text-foreground">R$ {totalExpense.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-[hsl(var(--spiritual-gold)_/_0.1)] to-[hsl(var(--spiritual-lilac)_/_0.1)] rounded-lg border border-spiritual">
                    <p className="text-sm text-muted-foreground mb-2">Saldo</p>
                    <p className="text-2xl font-bold spiritual-accent">R$ {(totalIncome - totalExpense).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
