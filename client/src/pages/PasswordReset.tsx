import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PasswordReset() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor, insira seu email");
      return;
    }

    setIsLoading(true);
    try {
      // Simular envio de email de reset
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Email de recuperação enviado com sucesso!");
      setResetSent(true);
      
      // Redirecionar após 3 segundos
      setTimeout(() => setLocation("/"), 3000);
    } catch (error) {
      toast.error("Erro ao enviar email de recuperação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <Lock className="w-10 h-10 text-purple-600" />
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Recuperar Senha
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Insira seu email para receber um link de recuperação
          </p>

          {resetSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                ✓ Email enviado com sucesso! Verifique sua caixa de entrada para continuar.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2 rounded-lg transition"
              >
                {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>
            </form>
          )}

          {/* Back to login */}
          <button
            onClick={() => setLocation("/")}
            className="flex items-center justify-center w-full mt-6 text-purple-600 hover:text-purple-700 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </button>
        </div>
      </Card>

      {/* Privacy notice */}
      <div className="absolute bottom-4 left-4 right-4 text-center text-xs text-gray-500">
        Seus dados são protegidos conforme a LGPD. Veja nossa{" "}
        <a href="/privacy" className="text-purple-600 hover:underline">
          política de privacidade
        </a>
      </div>
    </div>
  );
}
