/**
 * Serviço ViaCEP
 * Busca endereço por CEP
 */

export interface ViaCepResponse {
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

/**
 * Busca dados de endereço por CEP
 * @param cep - CEP com ou sem máscara
 * @returns Dados do endereço ou null se não encontrado
 */
export async function buscarCep(cep: string): Promise<ViaCepResponse | null> {
  try {
    // Remove máscara do CEP
    const cepLimpo = cep.replace(/\D/g, '');

    // Valida se tem 8 dígitos
    if (cepLimpo.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    // Faz a requisição para a API do ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }

    const data: ViaCepResponse = await response.json();

    // ViaCEP retorna { erro: true } quando o CEP não existe
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}
