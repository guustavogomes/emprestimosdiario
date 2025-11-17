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
import { cpfMask, removeCpfMask } from "@/src/lib/masks";

interface Profile {
  id: string;
  nome: string;
}

export default function EditUsuarioPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "novo";

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("CLIENT");
  const [profileId, setProfileId] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    loadProfiles();
    if (!isNew) {
      loadUsuario();
    }
  }, [token, isNew]);

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
    }
  };

  const loadUsuario = async () => {
    try {
      const response = await fetch(`/api/usuarios/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNome(data.nome);
        setEmail(data.email || "");
        setCpf(cpfMask(data.cpf));
        setTipo(data.tipo);
        setProfileId(data.profileId || "");
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handleSave = async () => {
    if (!nome || !cpf || !tipo) {
      toast.error("Preencha os campos obrigatórios: Nome, CPF e Tipo");
      return;
    }

    if (isNew && !senha) {
      toast.error("Senha é obrigatória para novo usuário");
      return;
    }

    setLoading(true);

    const body: any = {
      nome,
      email: email || null,
      tipo,
      profileId: profileId || null,
    };

    if (isNew) {
      body.cpf = removeCpfMask(cpf);
      body.senha = senha;
    } else if (senha) {
      body.senha = senha;
    }

    const url = isNew ? "/api/usuarios" : `/api/usuarios/${params.id}`;
    const method = isNew ? "POST" : "PUT";

    const savePromise = fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao salvar");
      }
      return response.json();
    });

    toast.promise(savePromise, {
      loading: isNew ? "Criando usuário..." : "Atualizando usuário...",
      success: () => {
        setTimeout(() => router.push("/dashboard/usuarios"), 500);
        return isNew ? "Usuário criado com sucesso!" : "Usuário atualizado com sucesso!";
      },
      error: (err) => err.message || "Erro ao salvar usuário",
      finally: () => setLoading(false),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isNew ? "Novo Usuário" : "Editar Usuário"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isNew ? "Cadastre um novo usuário" : "Atualize os dados do usuário"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(cpfMask(e.target.value))}
                placeholder="000.000.000-00"
                disabled={!isNew}
                maxLength={14}
              />
            </div>

            <div>
              <Label htmlFor="senha">
                Senha {isNew ? "*" : "(deixe em branco para manter)"}
              </Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder={isNew ? "Digite a senha" : "Nova senha"}
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Usuário *</Label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ADMIN">Administrador</option>
                <option value="MANAGER">Gerente</option>
                <option value="ANALYST">Analista</option>
                <option value="COLLECTOR">Cobrança</option>
                <option value="CLIENT">Cliente</option>
              </select>
            </div>

            <div>
              <Label htmlFor="profileId">Perfil de Acesso</Label>
              <select
                id="profileId"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Nenhum perfil</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="success"
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
