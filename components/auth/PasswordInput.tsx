"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/src/lib/utils";

/**
 * Componente Password Input
 * Single Responsibility: Renderiza input de senha com toggle de visibilidade
 * Interface Segregation: Aceita apenas props necessárias para senha
 */

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PasswordInput({
  value,
  onChange,
  error,
  label = "Senha",
  placeholder = "Digite sua senha",
  required = false,
  disabled = false,
  className,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="password">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="current-password"
          className={cn(
            "pr-10",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-500 hover:text-gray-700"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
