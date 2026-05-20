import { useForm } from "react-hook-form";
import { useAuth } from "@/_core/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

const recordFormSchema = z.object({
  mainComplaint: z.string().optional().or(z.literal("")),
  medicalHistory: z.string().optional().or(z.literal("")),
  emotionalBlockages: z.string().optional().or(z.literal("")),
  personalGoals: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type RecordFormData = z.infer<typeof recordFormSchema>;

interface TherapeuticRecordFormProps {
  clientId: number;
}

export default function TherapeuticRecordForm({ clientId }: TherapeuticRecordFormProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [recordId, setRecordId] = useState<number | null>(null);

  const getRecordQuery = trpc.therapeuticRecords.get.useQuery({ clientId });
  const createRecordMutation = trpc.therapeuticRecords.create.useMutation();
  const updateRecordMutation = trpc.therapeuticRecords.update.useMutation();

  const form = useForm<RecordFormData>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      mainComplaint: "",
      medicalHistory: "",
      emotionalBlockages: "",
      personalGoals: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (getRecordQuery.data) {
      setRecordId(getRecordQuery.data.id);
      form.reset({
        mainComplaint: getRecordQuery.data.mainComplaint || "",
        medicalHistory: getRecordQuery.data.medicalHistory || "",
        emotionalBlockages: getRecordQuery.data.emotionalBlockages || "",
        personalGoals: getRecordQuery.data.personalGoals || "",
        notes: getRecordQuery.data.notes || "",
      });
    }
  }, [getRecordQuery.data, form]);

  const isLoading = createRecordMutation.isPending || updateRecordMutation.isPending;

  async function onSubmit(data: RecordFormData) {
    try {
      if (recordId) {
        await updateRecordMutation.mutateAsync({
          recordId,
          ...data,
        });
        toast.success("Prontuário atualizado com sucesso!");
      } else {
        await createRecordMutation.mutateAsync({
          clientId,
          ...data,
        });
        toast.success("Prontuário criado com sucesso!");
      }

      navigate(`/clients/${clientId}`);
    } catch (error) {
      toast.error("Erro ao salvar prontuário. Tente novamente.");
      console.error(error);
    }
  }

  if (getRecordQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/clients/${clientId}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-4xl font-bold text-slate-900">
            Prontuário Terapêutico
          </h1>
        </div>

        {/* Form Card */}
        <Card className="max-w-3xl bg-slate-50 border border-slate-200">
          <div className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Main Complaint */}
                <FormField
                  control={form.control}
                  name="mainComplaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Queixa Principal</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva a queixa principal do cliente"
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Medical History */}
                <FormField
                  control={form.control}
                  name="medicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Histórico Médico</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Histórico de saúde, medicações, cirurgias, etc."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Emotional Blockages */}
                <FormField
                  control={form.control}
                  name="emotionalBlockages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bloqueios Emocionais</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Identifique bloqueios emocionais, traumas, padrões comportamentais"
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personal Goals */}
                <FormField
                  control={form.control}
                  name="personalGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivos Pessoais</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Objetivos terapêuticos e metas do cliente"
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Additional Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações Adicionais</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notas adicionais sobre o cliente"
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
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
                        Salvando...
                      </>
                    ) : (
                      recordId ? "Atualizar Prontuário" : "Criar Prontuário"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/clients/${clientId}`)}
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
