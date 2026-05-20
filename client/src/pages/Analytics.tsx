import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ClientSelectProps {
  clientId: number | null;
  onClientChange: (id: number | null) => void;
}

export default function Analytics() {
  const [, navigate] = useLocation();
  const [selectedClientId, setSelectedClientId] = React.useState<number | null>(null);

  const clientsQuery = trpc.clients.list.useQuery();
  const emotionalEvolutionQuery = trpc.emotionalEvolution.listByClient.useQuery(
    { clientId: selectedClientId! },
    { enabled: !!selectedClientId }
  );
  const financialRecordsQuery = trpc.financialRecords.listByTherapist.useQuery();

  const clients = clientsQuery.data || [];
  const emotionalData = emotionalEvolutionQuery.data || [];
  const financialRecords = financialRecordsQuery.data || [];

  // Prepare emotional evolution chart data
  const emotionalChartData = useMemo(() => {
    return emotionalData
      .map((record) => ({
        date: new Date(record.recordDate).toLocaleDateString("pt-BR"),
        emotionalState: record.emotionalState || 0,
        anxiety: record.anxiety || 0,
        depression: record.depression || 0,
        wellbeing: record.wellbeing || 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [emotionalData]);

  // Prepare financial chart data (monthly)
  const financialChartData = useMemo(() => {
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    financialRecords.forEach((record) => {
      const date = new Date(record.recordDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }

      const amount = parseFloat(record.amount.toString());
      if (record.recordType === "income") {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expense += amount;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("pt-BR", {
          month: "short",
          year: "numeric",
        }),
        ...data,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [financialRecords]);

  // Calculate totals
  const totalIncome = financialRecords
    .filter((r) => r.recordType === "income")
    .reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);

  const totalExpense = financialRecords
    .filter((r) => r.recordType === "expense")
    .reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);

  const averageEmotionalState = emotionalData.length > 0
    ? (emotionalData.reduce((sum, r) => sum + (r.emotionalState || 0), 0) / emotionalData.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-4xl font-bold text-slate-900">
            Análise e Relatórios
          </h1>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Receita Total</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  R$ {totalIncome.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-300" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Despesa Total</p>
                <p className="text-3xl font-bold text-red-900 mt-2">
                  R$ {totalExpense.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-red-300" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Saldo</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  R$ {(totalIncome - totalExpense).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-300" />
            </div>
          </Card>
        </div>

        {/* Financial Chart */}
        <Card className="bg-slate-50 border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Faturamento Mensal
          </h2>
          {financialChartData.length > 0 ? (
            <ChartContainer
              config={{
                income: {
                  label: "Receita",
                  color: "hsl(var(--spiritual-gold))",
                },
                expense: {
                  label: "Despesa",
                  color: "hsl(var(--spiritual-lilac))",
                },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="income" fill="hsl(var(--spiritual-gold))" name="Receita" />
                  <Bar dataKey="expense" fill="hsl(var(--spiritual-lilac))" name="Despesa" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <p className="text-slate-600 text-center py-8">
              Nenhum registro financeiro disponível
            </p>
          )}
        </Card>

        {/* Emotional Evolution */}
        <Card className="bg-slate-50 border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Evolução Emocional
              </h2>
              {selectedClientId && (
                <p className="text-sm text-slate-600 mt-1">
                  Estado Emocional Médio: {averageEmotionalState}/10
                </p>
              )}
            </div>

            {/* Client Selector */}
            <select
              value={selectedClientId || ""}
              onChange={(e) => setSelectedClientId(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Selecionar Cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {selectedClientId ? (
            emotionalChartData.length > 0 ? (
              <ChartContainer
                config={{
                  emotionalState: {
                    label: "Estado Emocional",
                    color: "hsl(var(--spiritual-gold))",
                  },
                  anxiety: {
                    label: "Ansiedade",
                    color: "hsl(var(--spiritual-lilac))",
                  },
                  depression: {
                    label: "Depressão",
                    color: "hsl(0 84% 60%)",
                  },
                  wellbeing: {
                    label: "Bem-estar",
                    color: "hsl(120 100% 50%)",
                  },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={emotionalChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="emotionalState"
                      stroke="hsl(var(--spiritual-gold))"
                      name="Estado Emocional"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="anxiety"
                      stroke="hsl(var(--spiritual-lilac))"
                      name="Ansiedade"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="depression"
                      stroke="hsl(0 84% 60%)"
                      name="Depressão"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="wellbeing"
                      stroke="hsl(120 100% 50%)"
                      name="Bem-estar"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-slate-600 text-center py-8">
                Nenhum registro de evolução emocional para este cliente
              </p>
            )
          ) : (
            <p className="text-slate-600 text-center py-8">
              Selecione um cliente para visualizar a evolução emocional
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}


