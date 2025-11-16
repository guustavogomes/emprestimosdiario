"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";

/**
 * Login Page
 * Single Responsibility: Renderiza a página de login
 * Open/Closed: Layout extensível via composição
 */

export default function LoginPage() {
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const handleLoginSuccess = () => {
    setLoginError(null);
  };

  const handleLoginError = (error: string) => {
    setLoginError(error);
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-xl border-gray-200 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-3 pb-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32 flex items-center justify-center rounded-2xl bg-white border-2 border-gray-200 overflow-hidden shadow-md">
              <Image
                src="/logo.png"
                alt="Empréstimo Diário"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Bem-vindo de volta
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Acesse sua conta para gerenciar seus empréstimos
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          <LoginForm
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />

          {/* Footer Links */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link
                href="/recuperar-senha"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Primeiro acesso?
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/solicitar"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Solicite seu empréstimo{" "}
                <span className="text-green-600 font-semibold">agora</span>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-600 z-10">
        <p>
          © {new Date().getFullYear()} Empréstimo Diário. Todos os direitos
          reservados.
        </p>
      </footer>
    </main>
  );
}
