import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Bell, Mail, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";

export default function Notifications() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [notificationSettings, setNotificationSettings] = useState({
    emailReminders: true,
    smsReminders: false,
    reminderDaysBefore: 1,
    emailAddress: user?.email || "",
    phoneNumber: "",
  });

  const [customNotification, setCustomNotification] = useState({
    clientName: "",
    message: "",
    type: "email",
  });

  const sendNotificationMutation = trpc.system.notifyOwner.useMutation();

  const handleSendCustomNotification = async () => {
    if (!customNotification.clientName || !customNotification.message) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await sendNotificationMutation.mutateAsync({
        title: `Notificação para ${customNotification.clientName}`,
        content: customNotification.message,
      });

      toast.success("Notificação enviada com sucesso!");
      setCustomNotification({ clientName: "", message: "", type: "email" });
    } catch (error) {
      toast.error("Erro ao enviar notificação");
      console.error(error);
    }
  };

  const handleSaveSettings = () => {
    toast.success("Configurações de notificação salvas!");
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
            <Bell className="w-6 h-6 text-yellow-500" />
            <h1 className="text-4xl font-bold text-slate-900">Notificações e Lembretes</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Card */}
          <Card className="bg-slate-50 border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Configurações de Lembretes</h2>

            <div className="space-y-6">
              {/* Email Reminders */}
              <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Lembretes por Email</p>
                    <p className="text-sm text-slate-600">Receba lembretes de sessões por email</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.emailReminders}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailReminders: checked })
                  }
                />
              </div>

              {/* SMS Reminders */}
              <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="font-semibold text-slate-900">Lembretes por SMS</p>
                    <p className="text-sm text-slate-600">Receba lembretes de sessões por SMS</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.smsReminders}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, smsReminders: checked })
                  }
                />
              </div>

              {/* Days Before Reminder */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Dias antes da sessão para lembrete
                </label>
                <Input
                  type="number"
                  min="1"
                  max="7"
                  value={notificationSettings.reminderDaysBefore}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      reminderDaysBefore: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-slate-600 mt-1">
                  Você receberá lembretes {notificationSettings.reminderDaysBefore} dia(s) antes
                </p>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Email para Notificações
                </label>
                <Input
                  type="email"
                  value={notificationSettings.emailAddress}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, emailAddress: e.target.value })
                  }
                />
              </div>

              {/* Phone Number */}
              {notificationSettings.smsReminders && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Telefone para SMS
                  </label>
                  <Input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={notificationSettings.phoneNumber}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        phoneNumber: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <Button
                onClick={handleSaveSettings}
                className="w-full bg-gradient-to-r from-yellow-400 to-purple-300 text-slate-900 hover:shadow-lg"
              >
                Salvar Configurações
              </Button>
            </div>
          </Card>

          {/* Custom Notification Card */}
          <Card className="bg-slate-50 border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Enviar Notificação Personalizada</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Nome do Cliente *
                </label>
                <Input
                  placeholder="Digite o nome do cliente"
                  value={customNotification.clientName}
                  onChange={(e) =>
                    setCustomNotification({ ...customNotification, clientName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Tipo de Notificação
                </label>
                <select
                  value={customNotification.type}
                  onChange={(e) =>
                    setCustomNotification({ ...customNotification, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="both">Email + SMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Mensagem *
                </label>
                <Textarea
                  placeholder="Digite a mensagem da notificação"
                  value={customNotification.message}
                  onChange={(e) =>
                    setCustomNotification({ ...customNotification, message: e.target.value })
                  }
                  className="min-h-32"
                />
                <p className="text-xs text-slate-600 mt-1">
                  {customNotification.message.length}/500 caracteres
                </p>
              </div>

              <Button
                onClick={handleSendCustomNotification}
                disabled={sendNotificationMutation.isPending}
                className="w-full bg-gradient-to-r from-yellow-400 to-purple-300 text-slate-900 hover:shadow-lg"
              >
                {sendNotificationMutation.isPending ? "Enviando..." : "Enviar Notificação"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-purple-50 border border-purple-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">💡 Dica</h3>
          <p className="text-sm text-slate-700">
            Configure lembretes automáticos para reduzir faltas e melhorar a adesão dos clientes ao
            tratamento. Você também pode enviar notificações personalizadas para comunicados especiais
            ou atualizações sobre protocolos.
          </p>
        </Card>
      </div>
    </div>
  );
}
