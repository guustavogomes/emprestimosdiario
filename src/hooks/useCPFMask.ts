import { useState, useCallback } from "react";

/**
 * Hook para formatação de CPF
 * Single Responsibility: Apenas formata CPF
 */
export function useCPFMask() {
  const [value, setValue] = useState("");
  const [rawValue, setRawValue] = useState("");

  const formatCPF = useCallback((input: string): string => {
    // Remove tudo que não é dígito
    const numbers = input.replace(/\D/g, "");

    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);

    // Aplica a máscara: 000.000.000-00
    return limited
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }, []);

  const handleChange = useCallback(
    (input: string) => {
      const numbers = input.replace(/\D/g, "");
      setRawValue(numbers);
      setValue(formatCPF(input));
    },
    [formatCPF]
  );

  const clear = useCallback(() => {
    setValue("");
    setRawValue("");
  }, []);

  return {
    value,
    rawValue,
    handleChange,
    clear,
    isValid: rawValue.length === 11,
  };
}
