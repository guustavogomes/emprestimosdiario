"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cpfMask, phoneMask, cepMask, removeCpfMask, removePhoneMask, removeCepMask } from "@/src/lib/masks";
import { buscarCep } from "@/src/lib/viacep";

export default function EditClientePage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "novo";

  // Dados pessoais
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  // Endereço
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");

  // Contatos de emergência
  const [nomeEmergencia1, setNomeEmergencia1] = useState("");
  const [telefoneEmergencia1, setTelefoneEmergencia1] = useState("");
  const [nomeEmergencia2, setNomeEmergencia2] = useState("");
  const [telefoneEmergencia2, setTelefoneEmergencia2] = useState("");

  // Informações adicionais
  const [chavePix, setChavePix] = useState("");
  const [etiqueta, setEtiqueta] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    if (!token) return;

    if (!isNew) {
      loadCliente();
    }
  }, [token, isNew]);

  const handleCepChange = async (value: string) => {
    const cepFormatado = cepMask(value);
    setCep(cepFormatado);

    // Remove máscara para verificar se tem 8 dígitos
    const cepLimpo = value.replace(/\D/g, "");

    // Busca automaticamente quando tiver 8 dígitos
    if (cepLimpo.length === 8) {
      setLoadingCep(true);

      const dadosCep = await buscarCep(cepLimpo);

      setLoadingCep(false);

      if (dadosCep) {
        // Preenche os campos automaticamente
        setEndereco(dadosCep.logradouro);
        setBairro(dadosCep.bairro);
        setCidade(dadosCep.localidade);

        toast.success("CEP encontrado! Endereço preenchido automaticamente.");
      } else {
        toast.error("CEP não encontrado. Preencha o endereço manualmente.");
      }
    }
  };

  const loadCliente = async () => {
    try {
      const response = await fetch(`/api/clientes/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNome(data.nome || "");
        setCpf(cpfMask(data.cpf || ""));
        setTelefone(phoneMask(data.telefone || ""));
        setDataNascimento(
          data.dataNascimento ? data.dataNascimento.split("T")[0] : ""
        );
        setCep(cepMask(data.cep || ""));
        setEndereco(data.endereco || "");
        setNumero(data.numero || "");
        setComplemento(data.complemento || "");
        setBairro(data.bairro || "");
        setCidade(data.cidade || "");
        setNomeEmergencia1(data.nomeEmergencia1 || "");
        setTelefoneEmergencia1(phoneMask(data.telefoneEmergencia1 || ""));
        setNomeEmergencia2(data.nomeEmergencia2 || "");
        setTelefoneEmergencia2(phoneMask(data.telefoneEmergencia2 || ""));
        setChavePix(data.chavePix || "");
        setEtiqueta(data.etiqueta || "");
      } else {
        const error = await response.json();
        console.error("Erro ao carregar cliente:", error);
        toast.error("Erro ao carregar dados do cliente");
      }
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
      toast.error("Erro ao carregar dados do cliente");
    }
  };

  const handleSave = async () => {
    if (!nome || !cpf || !telefone) {
      toast.error("Preencha os campos obrigatórios: Nome, CPF e Telefone");
      return;
    }

    setLoading(true);

    const body = {
      nome,
      cpf: removeCpfMask(cpf),
      telefone: removePhoneMask(telefone),
      dataNascimento: dataNascimento || null,
      cep: removeCepMask(cep) || null,
      endereco: endereco || null,
      numero: numero || null,
      complemento: complemento || null,
      bairro: bairro || null,
      cidade: cidade || null,
      nomeEmergencia1: nomeEmergencia1 || null,
      telefoneEmergencia1: removePhoneMask(telefoneEmergencia1) || null,
      nomeEmergencia2: nomeEmergencia2 || null,
      telefoneEmergencia2: removePhoneMask(telefoneEmergencia2) || null,
      chavePix: chavePix || null,
      etiqueta: etiqueta || null,
    };

    const url = isNew ? "/api/clientes" : `/api/clientes/${params.id}`;
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
      loading: isNew ? "Criando cliente..." : "Atualizando cliente...",
      success: () => {
        setTimeout(() => router.push("/dashboard/clientes"), 500);
        return isNew
          ? "Cliente criado com sucesso!"
          : "Cliente atualizado com sucesso!";
      },
      error: (err) => err.message || "Erro ao salvar cliente",
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
            {isNew ? "Novo Cliente" : "Editar Cliente"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isNew
              ? "Cadastre um novo cliente"
              : "Atualize os dados do cliente"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome completo do cliente"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(phoneMask(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    disabled={loadingCep}
                  />
                  {loadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Preenche automaticamente
                </p>
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Cidade"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, Avenida, etc"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Nº"
                />
              </div>
              <div>
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Apto, Sala, Bloco"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Bairro"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contatos de Emergência */}
        <Card>
          <CardHeader>
            <CardTitle>Contatos de Emergência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nomeEmergencia1">Nome do Contato 1</Label>
              <Input
                id="nomeEmergencia1"
                value={nomeEmergencia1}
                onChange={(e) => setNomeEmergencia1(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="telefoneEmergencia1">Telefone do Contato 1</Label>
              <Input
                id="telefoneEmergencia1"
                value={telefoneEmergencia1}
                onChange={(e) => setTelefoneEmergencia1(phoneMask(e.target.value))}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>

            <div className="border-t pt-4">
              <div className="mb-4">
                <Label htmlFor="nomeEmergencia2">Nome do Contato 2</Label>
                <Input
                  id="nomeEmergencia2"
                  value={nomeEmergencia2}
                  onChange={(e) => setNomeEmergencia2(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="telefoneEmergencia2">
                  Telefone do Contato 2
                </Label>
                <Input
                  id="telefoneEmergencia2"
                  value={telefoneEmergencia2}
                  onChange={(e) => setTelefoneEmergencia2(phoneMask(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="chavePix">Chave PIX</Label>
              <Input
                id="chavePix"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="CPF, telefone, email ou chave aleatória"
              />
            </div>

            <div>
              <Label htmlFor="etiqueta">Etiqueta</Label>
              <select
                id="etiqueta"
                value={etiqueta}
                onChange={(e) => setEtiqueta(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sem etiqueta</option>
                <option value="orange">🟠 Laranja</option>
                <option value="green">🟢 Verde</option>
                <option value="yellow">🟡 Amarelo</option>
                <option value="red">🔴 Vermelho</option>
                <option value="blue">🔵 Azul</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões de Ação */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Button
              variant="success"
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Cliente"}
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
