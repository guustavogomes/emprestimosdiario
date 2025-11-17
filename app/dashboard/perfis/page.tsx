"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Shield, Users } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  nome: string;
  descricao: string | null;
  permissions: Array<{
    permission: {
      id: string;
      resource: string;
      action: string;
    };
  }>;
  _count: {
    usuarios: number;
  };
}

export default function PerfisPage() {
  const { token, hasPermission } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const canCreate = hasPermission("perfis", "create");
  const canUpdate = hasPermission("perfis", "update");
  const canDelete = hasPermission("perfis", "delete");

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await fetch("/api/profiles", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      }
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja realmente deletar o perfil "${nome}"?`)) return;

    const deletePromise = fetch(`/api/profiles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao deletar perfil");
      }
      return response.json();
    });

    toast.promise(deletePromise, {
      loading: "Deletando perfil...",
      success: () => {
        loadProfiles();
        return `Perfil "${nome}" deletado com sucesso!`;
      },
      error: (err) => err.message || "Erro ao deletar perfil",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Perfis de Acesso</h1>
          <p className="text-gray-500 mt-1">
            Gerencie perfis e permissões de usuários
          </p>
        </div>

        {canCreate && (
          <Button
            variant="success"
            onClick={() => router.push("/dashboard/perfis/novo")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Perfil
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{profile.nome}</CardTitle>
                </div>

                <div className="flex gap-1">
                  {canUpdate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/perfis/${profile.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(profile.id, profile.nome)}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                {profile.descricao || "Sem descrição"}
              </p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>{profile.permissions.length} permissões</span>
                </div>

                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{profile._count.usuarios} usuários</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {profiles.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Nenhum perfil cadastrado</p>
            {canCreate && (
              <Button
                variant="success"
                onClick={() => router.push("/dashboard/perfis/novo")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Perfil
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
