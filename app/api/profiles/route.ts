import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissionMiddleware";
import { logCreate, logRead } from "@/lib/auditLog";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/profiles - Listar perfis
 * Requer permissão: perfis:read
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "perfis", "read");
  if (auth instanceof NextResponse) return auth;

  try {
    const profiles = await prisma.profile.findMany({
      where: { ativo: true },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            usuarios: true,
          },
        },
      },
      orderBy: { nome: "asc" },
    });

    // Registra auditoria
    await logRead(
      auth.user.userId,
      "perfis",
      undefined,
      { total: profiles.length },
      request
    );

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("[API Profiles GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao listar perfis" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profiles - Criar perfil
 * Requer permissão: perfis:create
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "perfis", "create");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();

    if (!body.nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica se já existe perfil com esse nome
    const existing = await prisma.profile.findUnique({
      where: { nome: body.nome },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe um perfil com esse nome" },
        { status: 400 }
      );
    }

    // Cria o perfil
    const profile = await prisma.profile.create({
      data: {
        nome: body.nome,
        descricao: body.descricao,
        createdBy: auth.user.userId,
      },
    });

    // Adiciona permissões se fornecidas
    if (body.permissionIds && Array.isArray(body.permissionIds)) {
      for (const permissionId of body.permissionIds) {
        await prisma.profilePermission.create({
          data: {
            profileId: profile.id,
            permissionId,
          },
        });
      }
    }

    // Busca o perfil completo
    const fullProfile = await prisma.profile.findUnique({
      where: { id: profile.id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    // Registra auditoria
    await logCreate(
      auth.user.userId,
      "perfis",
      profile.id,
      { nome: profile.nome, permissoes: body.permissionIds?.length || 0 },
      request
    );

    return NextResponse.json(fullProfile, { status: 201 });
  } catch (error) {
    console.error("[API Profiles POST] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao criar perfil" },
      { status: 500 }
    );
  }
}
