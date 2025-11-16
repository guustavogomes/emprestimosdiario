"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/src/lib/utils";

/**
 * Componente CPF Input
 * Single Responsibility: Renderiza input de CPF com formatação
 * Open/Closed: Aberto para extensão via props, fechado para modificação
 */

interface CPFInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CPFInput({
  value,
  onChange,
  error,
  label = "CPF",
  placeholder = "000.000.000-00",
  required = false,
  disabled = false,
  className,
}: CPFInputProps) {
  const formatCPF = (value: string): string => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, "");

    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);

    // Aplica a máscara: 000.000.000-00
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return limited.replace(/(\d{3})(\d+)/, "$1.$2");
    } else if (limited.length <= 9) {
      return limited.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
    } else {
      return limited.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1.$2.$3-$4");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    onChange(formatted);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="cpf">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </Label>
      )}
      <Input
        id="cpf"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={14}
        autoComplete="username"
        className={cn(
          error && "border-red-500 focus-visible:ring-red-500"
        )}
      />
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
