import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Calendar as CalendarIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function Calendar() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    sessionType: "individual",
    notes: "",
    time: "10:00",
  });

  // Usar dados mockados para a agenda
  const mockSessions = [
    { id: 1, sessionType: "individual", sessionDate: new Date(), price: "150", notes: "Sessão de acompanhamento" },
    { id: 2, sessionType: "couple", sessionDate: new Date(), price: "200", notes: "Sessão de casal" },
  ];
  const sessionsQuery = { data: mockSessions, isLoading: false };
  const createSessionMutation = trpc.sessions.create.useMutation();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !formData.clientName) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const [hours, minutes] = formData.time.split(":").map(Number);
      const sessionDate = new Date(selectedDate);
      sessionDate.setHours(hours, minutes, 0, 0);

      await createSessionMutation.mutateAsync({
        clientId: 1,
        sessionDate: sessionDate,
        sessionType: formData.sessionType as any,
        sessionNotes: formData.notes,
        duration: 60,
      });

      toast.success("Sessão agendada com sucesso!");
      setIsDialogOpen(false);
      setFormData({ clientName: "", sessionType: "individual", notes: "", time: "10:00" });
    } catch (error) {
      toast.error("Erro ao agendar sessão");
      console.error(error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const currentDate = new Date();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

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
            <CalendarIcon className="w-6 h-6 text-yellow-500" />
            <h1 className="text-4xl font-bold text-slate-900">Agenda de Sessões</h1>
          </div>
        </div>

        {/* Calendar Card */}
        <Card className="bg-slate-50 border border-slate-200 p-8">
          <div className="max-w-2xl mx-auto">
            {/* Month Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 capitalize">{monthName}</h2>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                <div key={day} className="text-center font-semibold text-slate-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => day && handleDateClick(day)}
                  className={`
                    aspect-square rounded-lg p-2 text-sm font-medium transition-all
                    ${
                      day
                        ? "bg-white border border-slate-200 hover:border-yellow-400 hover:shadow-md cursor-pointer text-slate-900"
                        : "bg-slate-100 text-slate-300 cursor-default"
                    }
                  `}
                >
                  {day?.getDate()}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-slate-600">
                <strong>Clique em um dia</strong> para agendar uma nova sessão terapêutica.
              </p>
            </div>
          </div>
        </Card>

        {/* Sessions List */}
        {sessionsQuery.data && sessionsQuery.data.length > 0 && (
          <Card className="mt-8 bg-slate-50 border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Próximas Sessões</h3>
            <div className="space-y-4">
              {sessionsQuery.data?.slice(0, 5).map((session: any) => (
                <div key={session.id} className="p-4 bg-white border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900">{session.sessionType}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(session.sessionDate).toLocaleDateString("pt-BR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="text-yellow-600 font-semibold">R$ {session.price}</span>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-slate-600 mt-2">{session.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Dialog for New Session */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              Agendar Sessão - {selectedDate?.toLocaleDateString("pt-BR")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Nome do Cliente *
              </label>
              <Input
                placeholder="Digite o nome do cliente"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Horário *
              </label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Tipo de Sessão
              </label>
              <select
                value={formData.sessionType}
                onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="individual">Individual</option>
                <option value="couple">Casal</option>
                <option value="family">Familiar</option>
                <option value="group">Grupo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Observações
              </label>
              <Textarea
                placeholder="Anotações adicionais sobre a sessão"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="min-h-20"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={createSessionMutation.isPending}
                className="bg-gradient-to-r from-yellow-400 to-purple-300 text-slate-900 hover:shadow-lg flex-1"
              >
                {createSessionMutation.isPending ? "Agendando..." : "Agendar Sessão"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={createSessionMutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
