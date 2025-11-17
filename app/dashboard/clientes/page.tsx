"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Tag, UserCircle } from "lucide-react";
import { toast } from "sonner";

interface Cliente {
  id: string;
  nome: string;
  telefone: string | null;
  cpf: string;
  cidade: string | null;
  etiqueta: string | null;
  ativo: boolean;
}

const etiquetaColors: Record<string, { bg: string; text: string; border: string }> = {
  orange: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  green: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  red: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
};

export default function ClientesPage() {
  const { token, hasPermission } = useAuth();
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEtiqueta, setSelectedEtiqueta] = useState("");

  const canCreate = hasPermission("clientes", "create");
  const canUpdate = hasPermission("clientes", "update");
  const canDelete = hasPermission("clientes", "delete");

  useEffect(() => {
    if (!token) return;
    loadClientes();
  }, [token]);

  const loadClientes = async () => {
    try {
      const response = await fetch("/api/clientes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja realmente deletar o cliente "${nome}"?`)) return;

    const deletePromise = fetch(`/api/clientes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao deletar cliente");
      }
      return response.json();
    });

    toast.promise(deletePromise, {
      loading: "Deletando cliente...",
      success: () => {
        loadClientes();
        return `Cliente "${nome}" deletado com sucesso!`;
      },
      error: (err) => err.message || "Erro ao deletar cliente",
    });
  };

  const filteredClientes = clientes.filter((cliente) => {
    const matchesSearch =
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cpf.includes(searchTerm) ||
      (cliente.telefone && cliente.telefone.includes(searchTerm));

    const matchesEtiqueta = selectedEtiqueta
      ? cliente.etiqueta === selectedEtiqueta
      : true;

    return matchesSearch && matchesEtiqueta && cliente.ativo;
  });

  if (loading) {
    return <div className="flex justify-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie seus clientes cadastrados</p>
        </div>

        {canCreate && (
          <Button
            variant="success"
            onClick={() => router.push("/dashboard/clientes/novo")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CPF ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedEtiqueta}
              onChange={(e) => setSelectedEtiqueta(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as Etiquetas</option>
              <option value="orange">Laranja</option>
              <option value="green">Verde</option>
              <option value="yellow">Amarelo</option>
              <option value="red">Vermelho</option>
              <option value="blue">Azul</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total de Clientes</div>
            <div className="text-2xl font-bold text-gray-900">
              {clientes.filter((c) => c.ativo).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Resultados da Busca</div>
            <div className="text-2xl font-bold text-blue-600">
              {filteredClientes.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Com Etiqueta</div>
            <div className="text-2xl font-bold text-green-600">
              {clientes.filter((c) => c.ativo && c.etiqueta).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Inativos</div>
            <div className="text-2xl font-bold text-red-600">
              {clientes.filter((c) => !c.ativo).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Etiqueta
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClientes.map((cliente) => {
                  const etiqueta = cliente.etiqueta
                    ? etiquetaColors[cliente.etiqueta]
                    : null;

                  return (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserCircle className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {cliente.nome}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {cliente.cpf}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {cliente.telefone || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {cliente.cidade || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {etiqueta ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${etiqueta.bg} ${etiqueta.text} ${etiqueta.border}`}
                          >
                            <Tag className="h-3 w-3" />
                            {cliente.etiqueta}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex gap-2 justify-end">
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/dashboard/clientes/${cliente.id}`)
                              }
                              className="hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(cliente.id, cliente.nome)}
                              className="hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredClientes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchTerm || selectedEtiqueta
            ? "Nenhum cliente encontrado com os filtros aplicados"
            : "Nenhum cliente cadastrado"}
        </div>
      )}
    </div>
  );
}
