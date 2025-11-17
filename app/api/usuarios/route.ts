import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissionMiddleware";
import { logCreate, logRead } from "@/lib/auditLog";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

/**
 * GET /api/usuarios - Listar usuários
 * Requer permissão: usuarios:read
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "usuarios", "read");
  if (auth instanceof NextResponse) return auth;

  try {
    const usuarios = await prisma.usuario.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        tipo: true,
        profileId: true,
        profile: {
          select: {
            id: true,
            nome: true,
          },
        },
        ativo: true,
        createdAt: true,
        updatedAt: true,
        // Não retorna senhaHash
      },
      orderBy: { nome: "asc" },
    });

    await logRead(
      auth.user.userId,
      "usuarios",
      undefined,
      { total: usuarios.length },
      request
    );

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("[API Usuarios GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao listar usuários" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/usuarios - Criar usuário
 * Requer permissão: usuarios:create
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "usuarios", "create");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();

    // Validação
    if (!body.nome || !body.cpf || !body.senha || !body.tipo) {
      return NextResponse.json(
        { error: "Nome, CPF, senha e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    // Verifica se CPF já existe
    const existing = await prisma.usuario.findUnique({
      where: { cpf: body.cpf },
    });

    if (existing) {
      return NextResponse.json(
        { error: "CPF já cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(body.senha, 10);

    // Cria usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome: body.nome,
        email: body.email,
        cpf: body.cpf,
        senhaHash,
        tipo: body.tipo,
        profileId: body.profileId,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        tipo: true,
        profileId: true,
        ativo: true,
        createdAt: true,
      },
    });

    await logCreate(
      auth.user.userId,
      "usuarios",
      usuario.id,
      { nome: usuario.nome, cpf: usuario.cpf, tipo: usuario.tipo },
      request
    );

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    console.error("[API Usuarios POST] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
