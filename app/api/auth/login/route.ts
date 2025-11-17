import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { logLogin } from "@/lib/auditLog";
import bcrypt from "bcrypt";

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

    // Busca o usuário com perfil e permissões
    const user = await prisma.usuario.findUnique({
      where: { cpf },
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
        { error: "CPF ou senha incorretos" },
        { status: 401 }
      );
    }

    // Verifica se o usuário está ativo
    if (!user.ativo) {
      return NextResponse.json(
        { error: "Usuário inativo" },
        { status: 401 }
      );
    }

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, user.senhaHash);

    if (!senhaValida) {
      return NextResponse.json(
        { error: "CPF ou senha incorretos" },
        { status: 401 }
      );
    }

    // Monta array de permissões
    const permissions = user.profile
      ? user.profile.permissions.map((pp) => ({
          resource: pp.permission.resource,
          action: pp.permission.action,
        }))
      : [];

    // Gera o token JWT
    const token = signToken({
      userId: user.id,
      cpf: user.cpf,
      nivel: user.tipo, // Agora usa 'tipo' ao invés de 'nivel'
    });

    // Registra auditoria
    await logLogin(user.id, { cpf: user.cpf }, request);

    // Retorna o token e os dados do usuário
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cpf: user.cpf,
        tipo: user.tipo,
        permissions,
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
