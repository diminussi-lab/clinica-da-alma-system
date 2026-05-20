import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    sessionType: string;
    clientName: string;
    notes: string;
    price: string;
  };
}

const SESSION_COLORS = {
  individual: { bg: "#FCD34D", border: "#F59E0B", label: "Individual" },
  couple: { bg: "#C4B5FD", border: "#A78BFA", label: "Casal" },
  group: { bg: "#86EFAC", border: "#65A30D", label: "Grupo" },
  online: { bg: "#93C5FD", border: "#3B82F6", label: "Online" },
};

export default function FullCalendarPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Sessão Individual - João",
      start: new Date(2026, 4, 20, 10, 0),
      end: new Date(2026, 4, 20, 11, 0),
      backgroundColor: SESSION_COLORS.individual.bg,
      borderColor: SESSION_COLORS.individual.border,
      extendedProps: {
        sessionType: "individual",
        clientName: "João Silva",
        notes: "Acompanhamento regular",
        price: "150",
      },
    },
    {
      id: "2",
      title: "Sessão de Casal - Maria & Pedro",
      start: new Date(2026, 4, 21, 14, 0),
      end: new Date(2026, 4, 21, 15, 30),
      backgroundColor: SESSION_COLORS.couple.bg,
      borderColor: SESSION_COLORS.couple.border,
      extendedProps: {
        sessionType: "couple",
        clientName: "Maria & Pedro",
        notes: "Terapia de casal",
        price: "200",
      },
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    clientName: "",
    sessionType: "individual",
    notes: "",
    time: "10:00",
    price: "150",
  });

  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  const handleAddEvent = async () => {
    if (!formData.clientName || !formData.sessionType) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const [hours, minutes] = formData.time.split(":").map(Number);
    const eventStart = new Date(selectedDate);
    eventStart.setHours(hours, minutes, 0, 0);
    const eventEnd = new Date(eventStart);
    eventEnd.setHours(eventEnd.getHours() + 1);

    const color = SESSION_COLORS[formData.sessionType as keyof typeof SESSION_COLORS];
    const newEvent: CalendarEvent = {
      id: String(Date.now()),
      title: `Sessão ${color.label} - ${formData.clientName}`,
      start: eventStart,
      end: eventEnd,
      backgroundColor: color.bg,
      borderColor: color.border,
      extendedProps: {
        sessionType: formData.sessionType,
        clientName: formData.clientName,
        notes: formData.notes,
        price: formData.price,
      },
    };

    setEvents([...events, newEvent]);
    toast.success("Sessão adicionada com sucesso!");
    setIsDialogOpen(false);
    setFormData({ clientName: "", sessionType: "individual", notes: "", time: "10:00", price: "150" });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
    toast.success("Sessão removida");
  };

  const handleDragStart = (event: CalendarEvent) => {
    setDraggedEvent(event);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (date: Date) => {
    if (!draggedEvent) return;

    const updatedEvent = { ...draggedEvent };
    const timeDiff = draggedEvent.end.getTime() - draggedEvent.start.getTime();
    updatedEvent.start = new Date(date);
    updatedEvent.end = new Date(date.getTime() + timeDiff);

    setEvents(events.map((e) => (e.id === draggedEvent.id ? updatedEvent : e)));
    setDraggedEvent(null);
    toast.success("Sessão movida com sucesso!");
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
            <Calendar className="w-6 h-6 text-yellow-500" />
            <h1 className="text-4xl font-bold text-slate-900">Calendário Interativo</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-50 border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </h2>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-yellow-400 to-purple-300 text-slate-900 hover:shadow-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nova Sessão
                </Button>
              </div>

              {/* Weekdays Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                  <div key={day} className="text-center font-bold text-slate-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const dayEvents = day
                    ? events.filter(
                        (e) =>
                          e.start.getDate() === day.getDate() &&
                          e.start.getMonth() === day.getMonth() &&
                          e.start.getFullYear() === day.getFullYear()
                      )
                    : [];

                  return (
                    <div
                      key={index}
                      className={`min-h-24 p-2 border rounded-lg ${
                        day
                          ? "bg-white border-slate-200 hover:border-yellow-400 cursor-pointer"
                          : "bg-slate-100 border-slate-200"
                      }`}
                      onClick={() => day && setSelectedDate(day)}
                      onDragOver={handleDragOver}
                      onDrop={() => day && handleDrop(day)}
                    >
                      {day && (
                        <>
                          <div className="font-bold text-slate-900 mb-1">{day.getDate()}</div>
                          <div className="space-y-1">
                            {dayEvents.map((event) => (
                              <div
                                key={event.id}
                                draggable
                                onDragStart={() => handleDragStart(event)}
                                className="text-xs p-1 rounded cursor-move text-white truncate"
                                style={{
                                  backgroundColor: event.backgroundColor,
                                  borderLeft: `3px solid ${event.borderColor}`,
                                }}
                                title={event.title}
                              >
                                {event.extendedProps.clientName}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Events Sidebar */}
          <div>
            <Card className="bg-slate-50 border border-slate-200 p-6 sticky top-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Próximas Sessões</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg"
                      style={{ borderLeftColor: event.borderColor, borderLeftWidth: "4px" }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {event.extendedProps.clientName}
                          </p>
                          <p className="text-xs text-slate-600">
                            {event.start.toLocaleDateString("pt-BR")} às{" "}
                            {event.start.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="text-xs text-slate-600 mb-2">{event.extendedProps.notes}</div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-900">
                          R$ {event.extendedProps.price}
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded text-white"
                          style={{ backgroundColor: event.backgroundColor }}
                        >
                          {SESSION_COLORS[event.extendedProps.sessionType as keyof typeof SESSION_COLORS]?.label}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Add Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Agendar Nova Sessão</DialogTitle>
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
                  Tipo de Sessão *
                </label>
                <select
                  value={formData.sessionType}
                  onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="individual">Individual</option>
                  <option value="couple">Casal</option>
                  <option value="group">Grupo</option>
                  <option value="online">Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Horário</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Preço (R$)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Notas</label>
                <Textarea
                  placeholder="Observações sobre a sessão"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddEvent}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-purple-300 text-slate-900 hover:shadow-lg"
                >
                  Agendar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Info Card */}
        <Card className="mt-8 bg-purple-50 border border-purple-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">💡 Dica de Uso</h3>
          <p className="text-sm text-slate-700 mb-2">
            Arraste as sessões entre as datas para reorganizá-las. Cada cor representa um tipo de sessão:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(SESSION_COLORS).map(([key, color]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color.bg, border: `2px solid ${color.border}` }}
                />
                <span className="text-slate-700">{color.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
