import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center text-purple-600 hover:text-purple-700 font-medium mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Política de Privacidade
          </h1>
          <p className="text-gray-600">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <Card className="p-6 border-0 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Conformidade com LGPD
            </h2>
            <p className="text-gray-700 mb-4">
              A Clínica da Alma está em conformidade total com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018). 
              Todos os dados pessoais e sensíveis dos clientes são tratados com máxima segurança e privacidade.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Coleta apenas dados necessários para prestação de serviços</li>
              <li>Consentimento explícito para processamento de dados</li>
              <li>Direito ao acesso, correção e exclusão de dados</li>
              <li>Criptografia de dados sensíveis em trânsito e em repouso</li>
            </ul>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Dados Coletados
            </h2>
            <p className="text-gray-700 mb-4">
              Coletamos apenas os dados necessários para oferecer nossos serviços:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Informações de identificação (nome, email, telefone)</li>
              <li>Histórico terapêutico e prontuários</li>
              <li>Informações de pagamento (processadas de forma segura)</li>
              <li>Registros de sessões e evolução emocional</li>
            </ul>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Segurança de Dados
            </h2>
            <p className="text-gray-700 mb-4">
              Implementamos medidas de segurança robustas:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Criptografia AES-256 para dados sensíveis</li>
              <li>Autenticação OAuth com dois fatores</li>
              <li>Auditoria de acesso e logs de segurança</li>
              <li>Backup automático e recuperação de desastres</li>
              <li>Conformidade com ISO 27001</li>
            </ul>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Direitos do Titular de Dados
            </h2>
            <p className="text-gray-700 mb-4">
              Você tem direito a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Acesso:</strong> Solicitar cópia de seus dados</li>
              <li><strong>Correção:</strong> Atualizar informações incorretas</li>
              <li><strong>Exclusão:</strong> Solicitar apagamento de dados (direito ao esquecimento)</li>
              <li><strong>Portabilidade:</strong> Receber dados em formato estruturado</li>
              <li><strong>Revogação de Consentimento:</strong> Retirar consentimento a qualquer momento</li>
            </ul>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Retenção de Dados
            </h2>
            <p className="text-gray-700 mb-4">
              Mantemos seus dados pelo tempo necessário para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Prestar os serviços contratados</li>
              <li>Cumprir obrigações legais (mínimo 5 anos para registros médicos)</li>
              <li>Resolver disputas e questões legais</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Após o término do contrato, dados são anonimizados ou excluídos, exceto quando exigido por lei.
            </p>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Contato para Privacidade
            </h2>
            <p className="text-gray-700 mb-4">
              Para exercer seus direitos ou fazer perguntas sobre privacidade:
            </p>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> privacidade@clinicadalma.com.br
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Encarregado de Proteção de Dados (DPO):</strong> dpo@clinicadalma.com.br
              </p>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Button
            onClick={() => setLocation("/")}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium px-8 py-2 rounded-lg transition"
          >
            Aceitar e Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
