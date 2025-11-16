import { useState } from "react";

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface ViaCepData {
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export function useViaCep() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarCep = async (cep: string): Promise<ViaCepData | null> => {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, "");

    // Valida se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      setError("CEP deve conter 8 dígitos");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar CEP");
      }

      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        setError("CEP não encontrado");
        return null;
      }

      return {
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
      };
    } catch (err) {
      setError("Erro ao buscar CEP. Tente novamente.");
      console.error("Erro ViaCEP:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { buscarCep, isLoading, error };
}
