import { useForm } from "react-hook-form";
import { useAuth } from "@/_core/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

const sessionFormSchema = z.object({
  clientId: z.number(),
  sessionDate: z.string(),
  duration: z.string().optional().or(z.literal("")),
  sessionNotes: z.string().optional().or(z.literal("")),
  emotionalState: z.string().optional().or(z.literal("")),
  techniques: z.string().optional().or(z.literal("")),
  sessionType: z.enum(["individual", "group", "online"]).optional(),
  price: z.string().optional().or(z.literal("")),
  paid: z.boolean().optional(),
});

type SessionFormData = z.infer<typeof sessionFormSchema>;

interface SessionFormProps {
  clientId?: number | string;
}

export default function SessionForm({ clientId: initialClientId }: SessionFormProps = {}) {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const clientsQuery = trpc.clients.list.useQuery();
  const createSessionMutation = trpc.sessions.create.useMutation();

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      clientId: initialClientId ? (typeof initialClientId === 'string' ? parseInt(initialClientId) : initialClientId) : 0,
      sessionDate: new Date().toISOString().split("T")[0],
      duration: "60",
      sessionNotes: "",
      emotionalState: "",
      techniques: "",
      sessionType: "individual",
      price: "",
      paid: false,
    },
  });

  const isLoading = createSessionMutation.isPending;
  const clients = clientsQuery.data || [];

  async function onSubmit(data: SessionFormData) {
    try {
      if (!data.clientId) {
        toast.error("Selecione um cliente");
        return;
      }

      await createSessionMutation.mutateAsync({
        clientId: data.clientId,
        sessionDate: new Date(data.sessionDate),
        duration: data.duration ? parseInt(data.duration) : undefined,
        sessionNotes: data.sessionNotes,
        emotionalState: data.emotionalState,
        techniques: data.techniques,
        sessionType: data.sessionType,
        price: data.price,
        paid: data.paid,
      });

      toast.success("Sessão registrada com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Erro ao registrar sessão. Tente novamente.");
      console.error(error);
    }
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
          <h1 className="text-4xl font-bold text-slate-900">
            Registrar Sessão
          </h1>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl bg-slate-50 border border-slate-200">
          <div className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Client Selection */}
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente *</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          <option value="">Selecionar cliente</option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Session Date */}
                <FormField
                  control={form.control}
                  name="sessionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Sessão *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Session Type */}
                <FormField
                  control={form.control}
                  name="sessionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Sessão</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          <option value="individual">Individual</option>
                          <option value="group">Grupo</option>
                          <option value="online">Online</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Duration */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (minutos)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="60" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Emotional State */}
                <FormField
                  control={form.control}
                  name="emotionalState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado Emocional</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ansioso, Calmo, Triste" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Techniques */}
                <FormField
                  control={form.control}
                  name="techniques"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Técnicas Utilizadas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva as técnicas utilizadas na sessão"
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Session Notes */}
                <FormField
                  control={form.control}
                  name="sessionNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anotações da Sessão</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Anotações e observações da sessão"
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Sessão (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Paid Status */}
                <FormField
                  control={form.control}
                  name="paid"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 rounded border-slate-300 text-yellow-400 focus:ring-yellow-400"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Sessão paga</FormLabel>
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-[hsl(var(--spiritual-gold))] to-[hsl(var(--spiritual-lilac))] text-slate-900 hover:shadow-spiritual flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      "Registrar Sessão"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
}
