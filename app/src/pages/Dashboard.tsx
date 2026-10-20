// src/pages/Dashboard.tsx
import { useAuth } from "../hooks/useAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Painel Principal</h1>
        <p className="text-sm text-slate-500">
          Visão geral dos recursos e dados da sessão ativa.
        </p>
      </div>

      <Card className="max-w-xl shadow-sm">
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
          <CardDescription>
            Informações obtidas a partir do perfil do usuário autenticado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Identificador (ID):</strong> #{user?.id}
          </p>
          <p>
            <strong>Nome:</strong> {user?.nome}
          </p>
          <p>
            <strong>E-mail:</strong> {user?.email}
          </p>
          <p>
            <strong>Perfil:</strong>{" "}
            <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
              {user?.perfil || "usuario"}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
