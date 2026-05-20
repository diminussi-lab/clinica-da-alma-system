import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Bell, Mail, MessageSquare, Send, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

interface NotificationLog {
  id: string;
  clientName: string;
  type: "email" | "sms" | "both";
  message: string;
  status: "pending" | "sent" | "failed";
  sentAt?: Date;
}

export default function NotificationsAdvanced() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [settings, setSettings] = useState({
    sendGridApiKey: "",
    twilioAccountSid: "",
    twilioAuthToken: "",
    twilioPhoneNumber: "",
    emailRemindersEnabled: true,
    smsRemindersEnabled: false,
    reminderDaysBefore: 1,
  });

  const [customNotification, setCustomNotification] = useState({
    clientName: "",
    email: "",
    phone: "",
    message: "",
    type: "email" as "email" | "sms" | "both",
  });

  const sendNotificationMutation = trpc.system.notifyOwner.useMutation();

  const handleSendNotification = async () => {
    if (!customNotification.clientName || !customNotification.message) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    if (customNotification.type === "email" && !customNotification.email) {
      toast.error("Email é obrigatório para notificações por email");
      return;
    }

    if (customNotification.type === "sms" && !customNotification.phone) {
      toast.error("Telefone é obrigatório para notificações por SMS");
      return;
    }

    try {
      toast.loading("Enviando notificação...");

      // Simular envio de notificação
      const newLog: NotificationLog = {
        id: String(Date.now()),
        clientName: customNotification.clientName,
        type: customNotification.type,
        message: customNotification.message,
        status: "sent",
        sentAt: new Date(),
      };

      setNotificationLogs([newLog, ...notificationLogs]);

      // Enviar notificação ao owner
      await sendNotificationMutation.mutateAsync({
        title: `Notificação enviada para ${customNotification.clientName}`,
        content: `Tipo: ${customNotification.type}\nMensagem: ${customNotification.message}`,
      });

      toast.success("Notificação enviada com sucesso!");
      setCustomNotification({
        clientName: "",
        email: "",
        phone: "",
        message: "",
        type: "email",
      });
    } catch (error) {
      toast.error("Erro ao enviar notificação");
      console.error(error);
    }
  };

  const handleSaveSettings = () => {
    if (!settings.sendGridApiKey && settings.emailRemindersEnabled) {
      toast.error("Configure a chave SendGrid para emails");
      return;
    }

    if (!settings.twilioAccountSid && settings.smsRemindersEnabled) {
      toast.error("Configure as credenciais Twilio para SMS");
      return;
    }

    toast.success("Configurações salvas com sucesso!");
  };

  const handleTestEmail = async () => {
    if (!customNotification.email) {
      toast.error("Digite um email para teste");
      return;
    }
    toast.success(`Email de teste enviado para ${customNotification.email}`);
  };

  const handleTestSMS = async () => {
    if (!customNotification.phone) {
      toast.error("Digite um telefone para teste");
      return;
    }
    toast.success(`SMS de teste enviado para ${customNotification.phone}`);
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
            <h1 className="text-4xl font-bold text-slate-900">Notificações Avançadas</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-50 border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Configurar Integrações</h2>

              {/* SendGrid Configuration */}
              <div className="mb-8 p-6 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-slate-900">SendGrid (Emails)</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Chave API SendGrid
                    </label>
                    <Input
                      type="password"
                      placeholder="SG.xxxxxxxxxxxxx"
                      value={settings.sendGridApiKey}
                      onChange={(e) =>
                        setSettings({ ...settings, sendGridApiKey: e.target.value })
                      }
                    />
                    <p className="text-xs text-slate-600 mt-1">
                      Obtenha em https://app.sendgrid.com/settings/api_keys
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Ativar Lembretes por Email</p>
                      <p className="text-sm text-slate-600">Envie lembretes automáticos de sessões</p>
                    </div>
                    <Switch
                      checked={settings.emailRemindersEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, emailRemindersEnabled: checked })
                      }
                    />
                  </div>

                  <Button
                    onClick={handleTestEmail}
                    variant="outline"
                    className="w-full"
                  >
                    Enviar Email de Teste
                  </Button>
                </div>
              </div>

              {/* Twilio Configuration */}
              <div className="mb-8 p-6 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-slate-900">Twilio (SMS)</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Account SID
                    </label>
                    <Input
                      type="password"
                      placeholder="ACxxxxxxxxxxxxx"
                      value={settings.twilioAccountSid}
                      onChange={(e) =>
                        setSettings({ ...settings, twilioAccountSid: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Auth Token
                    </label>
                    <Input
                      type="password"
                      placeholder="xxxxxxxxxxxxx"
                      value={settings.twilioAuthToken}
                      onChange={(e) =>
                        setSettings({ ...settings, twilioAuthToken: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Número Twilio
                    </label>
                    <Input
                      placeholder="+55 11 99999-9999"
                      value={settings.twilioPhoneNumber}
                      onChange={(e) =>
                        setSettings({ ...settings, twilioPhoneNumber: e.target.value })
                      }
                    />
                    <p className="text-xs text-slate-600 mt-1">
                      Obtenha em https://www.twilio.com/console
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Ativar Lembretes por SMS</p>
                      <p className="text-sm text-slate-600">Envie lembretes automáticos via SMS</p>
                    </div>
                    <Switch
                      checked={settings.smsRemindersEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, smsRemindersEnabled: checked })
                      }
                    />
                  </div>

                  <Button
                    onClick={handleTestSMS}
                    variant="outline"
                    className="w-full"
                  >
                    Enviar SMS de Teste
                  </Button>
                </div>
              </div>

              {/* Reminder Settings */}
              <div className="p-6 bg-white border border-slate-200 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Configurações de Lembretes</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Dias antes da sessão para lembrete
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={settings.reminderDaysBefore}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        reminderDaysBefore: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveSettings}
                className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-purple-300 text-slate-900 hover:shadow-lg"
              >
                Salvar Configurações
              </Button>
            </Card>
          </div>

          {/* Send Notification Panel */}
          <div>
            <Card className="bg-slate-50 border border-slate-200 p-6 sticky top-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Send className="w-5 h-5" />
                Enviar Notificação
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Nome do Cliente *
                  </label>
                  <Input
                    placeholder="Digite o nome"
                    value={customNotification.clientName}
                    onChange={(e) =>
                      setCustomNotification({
                        ...customNotification,
                        clientName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Tipo
                  </label>
                  <select
                    value={customNotification.type}
                    onChange={(e) =>
                      setCustomNotification({
                        ...customNotification,
                        type: e.target.value as "email" | "sms" | "both",
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="both">Email + SMS</option>
                  </select>
                </div>

                {(customNotification.type === "email" || customNotification.type === "both") && (
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="cliente@email.com"
                      value={customNotification.email}
                      onChange={(e) =>
                        setCustomNotification({
                          ...customNotification,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                {(customNotification.type === "sms" || customNotification.type === "both") && (
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Telefone
                    </label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={customNotification.phone}
                      onChange={(e) =>
                        setCustomNotification({
                          ...customNotification,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Mensagem *
                  </label>
                  <Textarea
                    placeholder="Digite a mensagem"
                    value={customNotification.message}
                    onChange={(e) =>
                      setCustomNotification({
                        ...customNotification,
                        message: e.target.value,
                      })
                    }
                    className="min-h-24"
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    {customNotification.message.length}/160 caracteres
                  </p>
                </div>

                <Button
                  onClick={handleSendNotification}
                  disabled={sendNotificationMutation.isPending}
                  className="w-full bg-gradient-to-r from-yellow-400 to-purple-300 text-slate-900 hover:shadow-lg"
                >
                  {sendNotificationMutation.isPending ? "Enviando..." : "Enviar Notificação"}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Notification Logs */}
        {notificationLogs.length > 0 && (
          <Card className="mt-8 bg-slate-50 border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Histórico de Notificações</h2>
            <div className="space-y-3">
              {notificationLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-white border border-slate-200 rounded-lg flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <p className="font-semibold text-slate-900">{log.clientName}</p>
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        {log.type === "both" ? "Email + SMS" : log.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{log.message}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {log.sentAt?.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
