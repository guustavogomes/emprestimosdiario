"use client";

import * as React from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonLoading } from "@/components/ui/loading";
import { useViaCep } from "@/hooks/useViaCep";

interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente?: any;
}

export function ClienteFormModal({
  isOpen,
  onClose,
  cliente,
}: ClienteFormModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { buscarCep, isLoading: isLoadingCep, error: cepError } = useViaCep();
  const [formData, setFormData] = React.useState({
    nome: "",
    telefone: "",
    cpf: "",
    dataNascimento: "",
    cep: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    chavePix: "",
    nomeEmergencia1: "",
    telefoneEmergencia1: "",
    nomeEmergencia2: "",
    telefoneEmergencia2: "",
    etiqueta: "",
  });

  // Validação de campos obrigatórios
  const isFormValid = React.useMemo(() => {
    return (
      formData.nome.trim() !== "" &&
      formData.telefone.trim() !== "" &&
      formData.cpf.trim() !== ""
    );
  }, [formData.nome, formData.telefone, formData.cpf]);

  // Função para formatar CEP
  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 8);
    if (numbers.length <= 5) {
      return numbers;
    }
    return numbers.replace(/(\d{5})(\d)/, "$1-$2");
  };

  // Função para buscar CEP
  const handleBuscarCep = async () => {
    if (formData.cep.replace(/\D/g, "").length !== 8) return;

    const dados = await buscarCep(formData.cep);

    if (dados) {
      setFormData({
        ...formData,
        endereco: dados.endereco,
        bairro: dados.bairro,
        cidade: dados.cidade,
      });
    }
  };

  React.useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || "",
        telefone: cliente.telefone || "",
        cpf: cliente.cpf || "",
        dataNascimento: cliente.dataNascimento || "",
        cep: cliente.cep || "",
        endereco: cliente.endereco || "",
        numero: cliente.numero || "",
        bairro: cliente.bairro || "",
        cidade: cliente.cidade || "",
        chavePix: cliente.chavePix || "",
        nomeEmergencia1: cliente.nomeEmergencia1 || "",
        telefoneEmergencia1: cliente.telefoneEmergencia1 || "",
        nomeEmergencia2: cliente.nomeEmergencia2 || "",
        telefoneEmergencia2: cliente.telefoneEmergencia2 || "",
        etiqueta: cliente.etiqueta || "",
      });
    } else {
      setFormData({
        nome: "",
        telefone: "",
        cpf: "",
        dataNascimento: "",
        cep: "",
        endereco: "",
        numero: "",
        bairro: "",
        cidade: "",
        chavePix: "",
        nomeEmergencia1: "",
        telefoneEmergencia1: "",
        nomeEmergencia2: "",
        telefoneEmergencia2: "",
        etiqueta: "",
      });
    }
  }, [cliente, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsLoading(true);

    try {
      // TODO: Implementar API call para salvar cliente
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simula chamada API
      console.log("Dados do cliente:", formData);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {cliente ? "Editar Cliente" : "Novo Cliente"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dados Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                  placeholder="Nome completo do cliente"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  required
                  placeholder="(11) 98765-4321"
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData({ ...formData, cpf: e.target.value })
                  }
                  required
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dataNascimento: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="chavePix">Chave Pix</Label>
                <Input
                  id="chavePix"
                  value={formData.chavePix}
                  onChange={(e) =>
                    setFormData({ ...formData, chavePix: e.target.value })
                  }
                  placeholder="CPF, telefone, email ou chave aleatória"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Endereço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <div className="flex gap-2">
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) =>
                      setFormData({ ...formData, cep: formatCep(e.target.value) })
                    }
                    onBlur={handleBuscarCep}
                    placeholder="00000-000"
                    maxLength={9}
                    disabled={isLoadingCep}
                  />
                  <Button
                    type="button"
                    onClick={handleBuscarCep}
                    disabled={isLoadingCep}
                    className="bg-blue-600 hover:bg-blue-700 px-3"
                    title="Buscar CEP"
                  >
                    {isLoadingCep ? (
                      <ButtonLoading />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {cepError && (
                  <p className="text-xs text-red-600 mt-1">{cepError}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) =>
                    setFormData({ ...formData, endereco: e.target.value })
                  }
                  placeholder="Rua, Avenida, etc"
                />
              </div>
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) =>
                    setFormData({ ...formData, numero: e.target.value })
                  }
                  placeholder="123"
                />
              </div>
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) =>
                    setFormData({ ...formData, bairro: e.target.value })
                  }
                  placeholder="Bairro"
                />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) =>
                    setFormData({ ...formData, cidade: e.target.value })
                  }
                  placeholder="Cidade"
                />
              </div>
            </div>
          </div>

          {/* Contatos de Emergência */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contatos de Emergência
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomeEmergencia1">Nome Emergência 1</Label>
                  <Input
                    id="nomeEmergencia1"
                    value={formData.nomeEmergencia1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nomeEmergencia1: e.target.value,
                      })
                    }
                    placeholder="Nome do contato"
                  />
                </div>
                <div>
                  <Label htmlFor="telefoneEmergencia1">
                    Telefone Emergência 1
                  </Label>
                  <Input
                    id="telefoneEmergencia1"
                    value={formData.telefoneEmergencia1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telefoneEmergencia1: e.target.value,
                      })
                    }
                    placeholder="(11) 98765-4321"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomeEmergencia2">Nome Emergência 2</Label>
                  <Input
                    id="nomeEmergencia2"
                    value={formData.nomeEmergencia2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nomeEmergencia2: e.target.value,
                      })
                    }
                    placeholder="Nome do contato"
                  />
                </div>
                <div>
                  <Label htmlFor="telefoneEmergencia2">
                    Telefone Emergência 2
                  </Label>
                  <Input
                    id="telefoneEmergencia2"
                    value={formData.telefoneEmergencia2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telefoneEmergencia2: e.target.value,
                      })
                    }
                    placeholder="(11) 98765-4321"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Etiqueta */}
          <div>
            <Label htmlFor="etiqueta">Etiqueta</Label>
            <select
              id="etiqueta"
              value={formData.etiqueta}
              onChange={(e) =>
                setFormData({ ...formData, etiqueta: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma etiqueta</option>
              <option value="orange">Laranja</option>
              <option value="green">Verde</option>
              <option value="yellow">Amarelo</option>
              <option value="red">Vermelho</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <ButtonLoading />
                  <span className="ml-2">Salvando...</span>
                </>
              ) : (
                cliente ? "Atualizar" : "Cadastrar"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
