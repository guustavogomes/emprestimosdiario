"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CPFInput } from "./CPFInput";
import { PasswordInput } from "./PasswordInput";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

/**
 * LoginForm Component
 * Single Responsibility: Gerencia formulário de login
 * Open/Closed: Extensível via callbacks, fechado para modificação
 * Dependency Inversion: Depende de abstrações (signIn do NextAuth)
 */

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

interface FormErrors {
  cpf?: string;
  password?: string;
  general?: string;
}

export function LoginForm({
  onSuccess,
  onError,
  className,
}: LoginFormProps) {
  const { login } = useAuth();
  const [cpf, setCpf] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isLoading, setIsLoading] = React.useState(false);

  // Verifica se o formulário pode ser enviado
  const isFormValid = React.useMemo(() => {
    const rawCPF = cpf.replace(/\D/g, "");
    return rawCPF.length === 11 && password.length >= 3;
  }, [cpf, password]);

  /**
   * Valida os campos do formulário
   * Single Responsibility: Apenas validação
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Remove formatação do CPF para validar
    const rawCPF = cpf.replace(/\D/g, "");

    if (!rawCPF) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (rawCPF.length !== 11) {
      newErrors.cpf = "CPF deve conter 11 dígitos";
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 3) {
      newErrors.password = "Senha deve ter no mínimo 3 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Limpa os erros de um campo específico
   */
  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Manipula o envio do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Remove formatação do CPF
      const rawCPF = cpf.replace(/\D/g, "");

      console.log("[LoginForm] Tentando login com CPF:", rawCPF);

      await login(rawCPF, password);

      onSuccess?.();
    } catch (error: any) {
      console.error("[LoginForm] Erro ao fazer login:", error);
      const errorMessage = error.message || "CPF ou senha incorretos. Verifique suas credenciais e tente novamente.";
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-5", className)}>
      {errors.general && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {errors.general}
        </div>
      )}

      <CPFInput
        value={cpf}
        onChange={(value) => {
          setCpf(value);
          clearError("cpf");
        }}
        error={errors.cpf}
        required
        disabled={isLoading}
      />

      <PasswordInput
        value={password}
        onChange={(value) => {
          setPassword(value);
          clearError("password");
        }}
        error={errors.password}
        required
        disabled={isLoading}
      />

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
        size="lg"
        disabled={isLoading || !isFormValid}
      >
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}
