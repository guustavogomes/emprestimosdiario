"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

interface Permission {
  id: string;
  resource: string;
  action: string;
  descricao: string | null;
}

export default function EditPerfilPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "novo";

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;

    loadPermissions();
    if (!isNew) {
      loadProfile();
    }
  }, [token, isNew]);

  const loadPermissions = async () => {
    try {
      const response = await fetch("/api/permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAllPermissions(data.permissions);
        setGroupedPermissions(data.grouped);
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/profiles/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNome(data.nome);
        setDescricao(data.descricao || "");
        setSelectedPermissions(data.permissions.map((p: any) => p.permission.id));
      } else {
        const error = await response.json();
        console.error("Erro ao carregar perfil:", error);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setSaving(true);

    const url = isNew ? "/api/profiles" : `/api/profiles/${params.id}`;
    const method = isNew ? "POST" : "PUT";

    const savePromise = fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        descricao,
        permissionIds: selectedPermissions,
      }),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao salvar");
      }
      return response.json();
    });

    toast.promise(savePromise, {
      loading: isNew ? "Criando perfil..." : "Atualizando perfil...",
      success: () => {
        setTimeout(() => router.push("/dashboard/perfis"), 500);
        return isNew ? "Perfil criado com sucesso!" : "Perfil atualizado com sucesso!";
      },
      error: (err) => err.message || "Erro ao salvar perfil",
      finally: () => setSaving(false),
    });
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  const toggleAllInResource = (resource: string) => {
    const resourcePerms = groupedPermissions[resource] || [];
    const resourceIds = resourcePerms.map((p) => p.id);
    const allSelected = resourceIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !resourceIds.includes(id)));
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...resourceIds])]);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isNew ? "Novo Perfil" : "Editar Perfil"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isNew ? "Crie um novo perfil de acesso" : "Edite as informações do perfil"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Perfil*</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Gerente"
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o perfil"
                />
              </div>

              <div className="pt-4 space-y-3">
                <p className="text-sm text-gray-600">
                  Permissões selecionadas: <strong>{selectedPermissions.length}</strong>
                </p>
                <Button
                  variant="success"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Perfil"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={saving}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Permissões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div key={resource} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold capitalize text-gray-900">{resource}</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleAllInResource(resource)}
                    >
                      {perms.every((p) => selectedPermissions.includes(p.id))
                        ? "Desmarcar Todos"
                        : "Marcar Todos"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm capitalize">{perm.action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
