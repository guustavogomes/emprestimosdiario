"use client";

import * as React from "react";
import { Plus, Search, Edit2, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";

// Dados mockados temporários
const mockClientes = [
  {
    id: "1",
    nome: "João Silva",
    telefone: "(11) 98765-4321",
    cpf: "123.456.789-00",
    cidade: "São Paulo",
    etiqueta: "green",
    ativo: true,
  },
  {
    id: "2",
    nome: "Maria Santos",
    telefone: "(11) 97654-3210",
    cpf: "987.654.321-00",
    cidade: "São Paulo",
    etiqueta: "orange",
    ativo: true,
  },
  {
    id: "3",
    nome: "Carlos Lima",
    telefone: "(11) 96543-2109",
    cpf: "456.789.123-00",
    cidade: "Guarulhos",
    etiqueta: "red",
    ativo: true,
  },
];

const etiquetaColors = {
  orange: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  green: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  red: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
};

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedEtiqueta, setSelectedEtiqueta] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedCliente, setSelectedCliente] = React.useState(null);

  const filteredClientes = mockClientes.filter((cliente) => {
    const matchesSearch =
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cpf.includes(searchTerm) ||
      cliente.telefone.includes(searchTerm);

    const matchesEtiqueta = selectedEtiqueta
      ? cliente.etiqueta === selectedEtiqueta
      : true;

    return matchesSearch && matchesEtiqueta;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus clientes cadastrados
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedCliente(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Cliente
        </Button>
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
              className="px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as Etiquetas</option>
              <option value="orange">Laranja</option>
              <option value="green">Verde</option>
              <option value="yellow">Amarelo</option>
              <option value="red">Vermelho</option>
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
              {mockClientes.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Clientes Ativos</div>
            <div className="text-2xl font-bold text-green-600">
              {mockClientes.filter((c) => c.ativo).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Cadastros Este Mês</div>
            <div className="text-2xl font-bold text-blue-600">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Com Empréstimos</div>
            <div className="text-2xl font-bold text-orange-600">8</div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etiqueta
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClientes.map((cliente) => {
                  const etiqueta = etiquetaColors[cliente.etiqueta as keyof typeof etiquetaColors];
                  return (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {cliente.nome.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {cliente.nome}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {cliente.cpf}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {cliente.telefone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {cliente.cidade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${etiqueta.bg} ${etiqueta.text} ${etiqueta.border}`}
                        >
                          <Tag className="h-3 w-3" />
                          {cliente.etiqueta}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCliente(cliente as any);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ClienteFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cliente={selectedCliente}
      />
    </div>
  );
}
