import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/jwt";
import { PrismaUserRepository } from "@/core/infra/repositories/PrismaUserRepository";

export async function GET(request: NextRequest) {
  try {
    // Extrai o token do header
    const authHeader = request.headers.get("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    // Verifica o token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      );
    }

    // Busca os dados atualizados do usuário
    const userRepository = new PrismaUserRepository();
    const user = await userRepository.findByCpf(payload.cpf);

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Retorna os dados do usuário (sem a senha)
    return NextResponse.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      cpf: user.cpf,
      nivel: user.nivel,
    });
  } catch (error) {
    console.error("[API Auth Me] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do usuário" },
      { status: 500 }
    );
  }
}
