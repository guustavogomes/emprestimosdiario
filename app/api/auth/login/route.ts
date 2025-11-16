import { NextRequest, NextResponse } from "next/server";
import { AuthenticateUser } from "@/core/application/usecases/AuthenticateUser";
import { signToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpf, senha } = body;

    // Valida campos obrigatórios
    if (!cpf || !senha) {
      return NextResponse.json(
        { error: "CPF e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Autentica o usuário
    const authenticateUser = new AuthenticateUser();
    const user = await authenticateUser.execute({ cpf, senha });

    if (!user) {
      return NextResponse.json(
        { error: "CPF ou senha incorretos" },
        { status: 401 }
      );
    }

    // Gera o token JWT
    const token = signToken({
      userId: user.id,
      cpf: user.cpf,
      nivel: user.nivel,
    });

    // Retorna o token e os dados do usuário
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cpf: user.cpf,
        nivel: user.nivel,
      },
    });
  } catch (error) {
    console.error("[API Auth Login] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao fazer login" },
      { status: 500 }
    );
  }
}
