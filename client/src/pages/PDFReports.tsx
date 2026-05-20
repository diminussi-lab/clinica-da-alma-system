import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, FileText, Download, BarChart3, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import jsPDF from "jspdf";
import type { jsPDF as jsPDFType } from "jspdf";

interface ReportData {
  clientName: string;
  period: string;
  totalSessions: number;
  averageEmotionalScore: number;
  protocolCompletion: number;
  revenue: number;
  emotionalData: Array<{ month: string; score: number }>;
  sessionData: Array<{ type: string; count: number }>;
}

export default function PDFReports() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [isGenerating, setIsGenerating] = useState(false);

  const mockClients = [
    { id: "1", name: "João Silva" },
    { id: "2", name: "Maria Santos" },
    { id: "3", name: "Pedro Oliveira" },
  ];

  const mockReportData: ReportData = {
    clientName: selectedClient === "all" ? "Todos os Clientes" : "João Silva",
    period: selectedPeriod === "monthly" ? "Maio 2026" : "Q2 2026",
    totalSessions: 12,
    averageEmotionalScore: 7.8,
    protocolCompletion: 85,
    revenue: 1800,
    emotionalData: [
      { month: "Semana 1", score: 6.5 },
      { month: "Semana 2", score: 7.0 },
      { month: "Semana 3", score: 7.5 },
      { month: "Semana 4", score: 7.8 },
    ],
    sessionData: [
      { type: "Individual", count: 8 },
      { type: "Casal", count: 3 },
      { type: "Grupo", count: 1 },
    ],
  };

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      toast.loading("Gerando relatório PDF...");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFillColor(252, 211, 77); // Dourado
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(24);
      doc.text("❤ Clínica da Alma", 20, 25);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Relatório de ${mockReportData.period}`, 20, 35);

      yPosition = 50;

      // Client Info
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Informações do Relatório", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const clientInfo = [
        ["Cliente:", mockReportData.clientName],
        ["Período:", mockReportData.period],
        ["Data de Geração:", new Date().toLocaleDateString("pt-BR")],
        ["Terapeuta:", user?.name || "Sistema"],
      ];

      clientInfo.forEach(([label, value]) => {
        doc.text(label, 20, yPosition);
        doc.text(value, 80, yPosition);
        yPosition += 7;
      });

      yPosition += 10;

      // Key Metrics
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Métricas Principais", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      const metricsData = [
        ["Total de Sessões", mockReportData.totalSessions.toString()],
        ["Evolução Emocional Média", mockReportData.averageEmotionalScore.toFixed(1)],
        ["Conclusão de Protocolo", `${mockReportData.protocolCompletion}%`],
        ["Faturamento Total", `R$ ${mockReportData.revenue.toFixed(2)}`],
      ];

      metricsData.forEach(([metric, value]) => {
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPosition - 4, 170, 8, "F");
        doc.setTextColor(0, 0, 0);
        doc.text(metric, 25, yPosition);
        doc.setTextColor(200, 100, 0); // Dourado
        doc.text(value, 180, yPosition);
        yPosition += 10;
      });

      yPosition += 10;

      // Emotional Evolution Chart (Text representation)
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Evolução Emocional", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      mockReportData.emotionalData.forEach((data) => {
        const barWidth = (data.score / 10) * 100;
        doc.setFillColor(196, 181, 253); // Lilás
        doc.rect(20, yPosition - 3, barWidth, 6, "F");
        doc.setTextColor(0, 0, 0);
        doc.text(`${data.month}: ${data.score}/10`, 130, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // Session Distribution
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Distribuição de Sessões", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(9);
      mockReportData.sessionData.forEach((data) => {
        doc.setTextColor(60, 60, 60);
        doc.text(`• ${data.type}: ${data.count} sessão(ões)`, 25, yPosition);
        yPosition += 7;
      });

      yPosition += 10;

      // Recommendations
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Recomendações", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const recommendations = [
        "• Manter frequência de sessões para consolidar ganhos emocionais",
        "• Praticar técnicas de meditação 3x por semana",
        "• Revisitar protocolos de bloqueios emocionais",
        "• Agendar avaliação de progresso no próximo mês",
      ];

      recommendations.forEach((rec) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(rec, 25, yPosition);
        yPosition += 7;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "Clínica da Alma © 2026 - Relatório Confidencial",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Download
      const fileName = `relatorio_${mockReportData.clientName.replace(/\s+/g, "_")}_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success("Relatório gerado e baixado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar relatório");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateComparisonPDF = async () => {
    try {
      setIsGenerating(true);
      toast.loading("Gerando relatório comparativo...");

      const doc = new jsPDF("l"); // Landscape
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // Header
      doc.setFillColor(252, 211, 77);
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(24);
      doc.text("❤ Clínica da Alma - Relatório Comparativo", 20, 25);

      yPosition = 50;

      // Comparison Table
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Comparação de Clientes", 20, yPosition);
      yPosition += 15;

      const tableData = mockClients.map((client) => [
        client.name,
        "12",
        "7.8",
        "85%",
        "R$ 1.800",
      ]);

      // Table header
      doc.setFillColor(200, 100, 0);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      const headers = ["Cliente", "Sessões", "Evolução Média", "Protocolo", "Faturamento"];
      const colWidth = (pageWidth - 40) / headers.length;
      
      headers.forEach((header, i) => {
        doc.text(header, 20 + i * colWidth, yPosition);
      });
      
      yPosition += 10;
      
      // Table rows
      doc.setTextColor(0, 0, 0);
      tableData.forEach((row, rowIndex) => {
        if (rowIndex % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(20, yPosition - 5, pageWidth - 40, 8, "F");
        }
        row.forEach((cell, colIndex) => {
          doc.text(cell, 20 + colIndex * colWidth, yPosition);
        });
        yPosition += 8;
      });
      
      yPosition += 10;

      // Summary
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Resumo Geral", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const summaryText = [
        `Total de Clientes Ativos: ${mockClients.length}`,
        `Total de Sessões: ${mockClients.length * 12}`,
        `Faturamento Total: R$ ${(mockClients.length * 1800).toFixed(2)}`,
        `Taxa de Satisfação Média: 4.8/5`,
      ];

      summaryText.forEach((text) => {
        doc.text(text, 25, yPosition);
        yPosition += 8;
      });

      const fileName = `relatorio_comparativo_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success("Relatório comparativo gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar relatório comparativo");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

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
            <h1 className="text-4xl font-bold text-slate-900">Relatórios em PDF</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Generator */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-50 border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Gerar Relatório Individual</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Selecione o Cliente
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="all">Todos os Clientes</option>
                    {mockClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

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

                <div className="p-6 bg-white border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-4">Prévia do Relatório</h3>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Total de Sessões:</span>
                      <span className="font-semibold text-slate-900">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Evolução Emocional Média:</span>
                      <span className="font-semibold text-slate-900">7.8/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conclusão de Protocolo:</span>
                      <span className="font-semibold text-slate-900">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Faturamento:</span>
                      <span className="font-semibold text-slate-900">R$ 1.800,00</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-yellow-400 to-purple-300 text-slate-900 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isGenerating ? "Gerando..." : "Gerar e Baixar PDF"}
                </Button>
              </div>
            </Card>

            {/* Comparison Report */}
            <Card className="bg-slate-50 border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Relatório Comparativo
              </h2>

              <div className="p-6 bg-white border border-slate-200 rounded-lg mb-6">
                <p className="text-sm text-slate-600 mb-4">
                  Compare o desempenho de todos os clientes em um único relatório com tabelas e
                  análises comparativas.
                </p>
                <div className="space-y-2 text-sm text-slate-600">
                  <div>✓ Tabela comparativa de clientes</div>
                  <div>✓ Análise de faturamento</div>
                  <div>✓ Métricas de evolução</div>
                  <div>✓ Recomendações gerais</div>
                </div>
              </div>

              <Button
                onClick={generateComparisonPDF}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-300 to-yellow-400 text-slate-900 hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? "Gerando..." : "Gerar Relatório Comparativo"}
              </Button>
            </Card>
          </div>

          {/* Info Panel */}
          <div>
            <Card className="bg-slate-50 border border-slate-200 p-6 sticky top-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                O que está incluído
              </h3>

              <div className="space-y-4">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <p className="font-semibold text-slate-900 text-sm mb-1">📊 Métricas</p>
                  <p className="text-xs text-slate-600">
                    Sessões, evolução emocional, protocolo e faturamento
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <p className="font-semibold text-slate-900 text-sm mb-1">📈 Gráficos</p>
                  <p className="text-xs text-slate-600">
                    Visualização de progresso e distribuição de sessões
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <p className="font-semibold text-slate-900 text-sm mb-1">💡 Recomendações</p>
                  <p className="text-xs text-slate-600">
                    Sugestões personalizadas para próximas ações
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <p className="font-semibold text-slate-900 text-sm mb-1">🔒 Confidencial</p>
                  <p className="text-xs text-slate-600">
                    Relatórios marcados como confidenciais
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-slate-700">
                  <strong>Dica:</strong> Gere relatórios regularmente para acompanhar o progresso
                  dos clientes e otimizar sua prática terapêutica.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
