"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, UserCircle, Shield } from "lucide-react";
import { toast } from "sonner";

interface Usuario {
  id: string;
  nome: string;
  email: string | null;
  cpf: string;
  tipo: string;
  profile: { nome: string } | null;
  ativo: boolean;
}

export default function UsuariosPage() {
  const { token, hasPermission } = useAuth();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const canCreate = hasPermission("usuarios", "create");
  const canUpdate = hasPermission("usuarios", "update");
  const canDelete = hasPermission("usuarios", "delete");

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const response = await fetch("/api/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja realmente deletar o usuário "${nome}"?`)) return;

    const deletePromise = fetch(`/api/usuarios/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao deletar usuário");
      }
      return response.json();
    });

    toast.promise(deletePromise, {
      loading: "Deletando usuário...",
      success: () => {
        loadUsuarios();
        return `Usuário "${nome}" deletado com sucesso!`;
      },
      error: (err) => err.message || "Erro ao deletar usuário",
    });
  };

  if (loading) return <div className="flex justify-center py-12">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-gray-500 mt-1">Gerencie usuários do sistema</p>
        </div>

        {canCreate && (
          <Button
            variant="success"
            onClick={() => router.push("/dashboard/usuarios/novo")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {usuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{user.nome}</div>
                          {user.email && <div className="text-sm text-gray-500">{user.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{user.cpf}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.tipo === "ADMIN" ? "bg-purple-100 text-purple-800" :
                        user.tipo === "MANAGER" ? "bg-blue-100 text-blue-800" :
                        user.tipo === "ANALYST" ? "bg-green-100 text-green-800" :
                        user.tipo === "COLLECTOR" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {user.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.profile ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Shield className="h-4 w-4 text-gray-400" />
                          {user.profile.nome}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/usuarios/${user.id}`)}
                            className="hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id, user.nome)}
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {usuarios.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nenhum usuário encontrado
        </div>
      )}
    </div>
  );
}
