import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

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

    // Busca os dados atualizados do usuário com perfil e permissões
    const user = await prisma.usuario.findUnique({
      where: { cpf: payload.cpf },
      include: {
        profile: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Monta array de permissões
    const permissions = user.profile
      ? user.profile.permissions.map((pp) => ({
          resource: pp.permission.resource,
          action: pp.permission.action,
        }))
      : [];

    // Retorna os dados do usuário (sem a senha)
    return NextResponse.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      cpf: user.cpf,
      tipo: user.tipo,
      permissions,
    });
  } catch (error) {
    console.error("[API Auth Me] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do usuário" },
      { status: 500 }
    );
  }
}
