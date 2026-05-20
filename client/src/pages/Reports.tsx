import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, FileText, Download, TrendingUp, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

export default function Reports() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Usar dados mockados para o relatório
  const mockClients = [
    { id: 1, name: "Cliente 1" },
    { id: 2, name: "Cliente 2" },
    { id: 3, name: "Cliente 3" },
  ];
  const mockSessions = [
    { id: 1, sessionType: "individual", price: "150" },
    { id: 2, sessionType: "couple", price: "200" },
    { id: 3, sessionType: "group", price: "100" },
  ];

  const generatePDFReport = async () => {
    try {
      toast.loading("Gerando relatório PDF...");

      // Simular geração de PDF
      const reportData = {
        period: selectedPeriod,
        month: selectedMonth,
        totalClients: mockClients.length,
        totalSessions: mockSessions.length,
        averageEmotionalProgress: 12,
        generatedAt: new Date().toLocaleDateString("pt-BR"),
      };

      // Aqui você integraria com uma biblioteca de PDF como jsPDF ou ReportLab
      console.log("Relatório gerado:", reportData);

      toast.success("Relatório gerado com sucesso!");
      toast.success("Download iniciado");
    } catch (error) {
      toast.error("Erro ao gerar relatório");
      console.error(error);
    }
  };

  const reportTypes = [
    {
      id: "monthly",
      title: "Relatório Mensal",
      description: "Resumo de clientes, sessões e evolução do mês",
      icon: <FileText className="w-8 h-8" />,
    },
    {
      id: "annual",
      title: "Relatório Anual",
      description: "Análise completa de todo o ano",
      icon: <TrendingUp className="w-8 h-8" />,
    },
    {
      id: "financial",
      title: "Relatório Financeiro",
      description: "Faturamento, receitas e análise de ROI",
      icon: <DollarSign className="w-8 h-8" />,
    },
  ];

  const metrics = [
    {
      label: "Total de Clientes",
      value: mockClients.length,
      color: "from-yellow-400 to-yellow-500",
    },
    {
      label: "Total de Sessões",
      value: mockSessions.length,
      color: "from-purple-300 to-purple-400",
    },
    {
      label: "Taxa de Conclusão",
      value: "85%",
      color: "from-green-400 to-green-500",
    },
    {
      label: "Evolução Média",
      value: "+12%",
      color: "from-blue-400 to-blue-500",
    },
  ];

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
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-yellow-500" />
            <h1 className="text-4xl font-bold text-slate-900">Relatórios</h1>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-slate-50 border border-slate-200 p-6">
              <div className={`bg-gradient-to-r ${metric.color} rounded-lg p-4 mb-4`}>
                <div className="text-white text-2xl font-bold">{metric.value}</div>
              </div>
              <p className="text-sm text-slate-600">{metric.label}</p>
            </Card>
          ))}
        </div>

        {/* Report Types */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Tipos de Relatório</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reportTypes.map((report) => (
              <Card
                key={report.id}
                className={`bg-slate-50 border-2 p-6 cursor-pointer transition-all ${
                  selectedPeriod === report.id
                    ? "border-yellow-400 shadow-lg"
                    : "border-slate-200 hover:border-yellow-300"
                }`}
                onClick={() => setSelectedPeriod(report.id)}
              >
                <div className="text-yellow-500 mb-4">{report.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{report.title}</h3>
                <p className="text-sm text-slate-600">{report.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Period Selection */}
        <Card className="bg-slate-50 border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Selecione o Período</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Período
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="annual">Anual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Mês/Ano
              </label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              onClick={generatePDFReport}
              className="bg-gradient-to-r from-yellow-400 to-purple-300 text-slate-900 hover:shadow-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Gerar e Baixar PDF
            </Button>
            <Button variant="outline">
              Visualizar Prévia
            </Button>
          </div>
        </Card>

        {/* Report Preview */}
        <Card className="bg-white border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Prévia do Relatório</h2>

          <div className="space-y-6">
            {/* Header */}
            <div className="border-b-2 border-slate-200 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Clínica da Alma</h3>
              <p className="text-sm text-slate-600">
                Relatório de {selectedPeriod === "monthly" ? "Desempenho Mensal" : "Desempenho Anual"}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Período: {new Date(selectedMonth).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-slate-600">Clientes Ativos</p>
                <p className="text-2xl font-bold text-slate-900">{mockClients.length}</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-slate-600">Sessões Realizadas</p>
                <p className="text-2xl font-bold text-slate-900">{mockSessions.length}</p>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-3">Análise Detalhada</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ Taxa de Comparecimento: 92%</li>
                <li>✓ Satisfação Média: 4.8/5</li>
                <li>✓ Evolução Emocional Média: +12%</li>
                <li>✓ Protocolo de Conclusão: 85%</li>
                <li>✓ Faturamento Total: R$ 8.500,00</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-200">
              <p>Relatório gerado em {new Date().toLocaleDateString("pt-BR")}</p>
              <p>Clínica da Alma © 2026</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
