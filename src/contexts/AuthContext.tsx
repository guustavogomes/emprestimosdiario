"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  nome: string;
  email: string | null;
  cpf: string;
  nivel: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (cpf: string, senha: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Carrega o token do localStorage ao iniciar
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem("@EmprestimoDiario:token");

        if (storedToken) {
          setToken(storedToken);

          // Busca os dados do usuário
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token inválido, limpa o storage
            localStorage.removeItem("@EmprestimoDiario:token");
            setToken(null);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar autenticação:", error);
        localStorage.removeItem("@EmprestimoDiario:token");
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (cpf: string, senha: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpf, senha }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao fazer login");
      }

      const data = await response.json();

      setToken(data.token);
      setUser(data.user);

      // Salva o token no localStorage
      localStorage.setItem("@EmprestimoDiario:token", data.token);

      // Redireciona para o dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("@EmprestimoDiario:token");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
