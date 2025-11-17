import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissionMiddleware";
import { logRead, logUpdate, logDelete } from "@/lib/auditLog";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/profiles/[id] - Buscar perfil por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "perfis", "read");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id },
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
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    await logRead(auth.user.userId, "perfis", profile.id, { nome: profile.nome }, request);

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[API Profile GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar perfil" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profiles/[id] - Atualizar perfil
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "perfis", "update");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const body = await request.json();

    const existing = await prisma.profile.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Atualiza o perfil
    const profile = await prisma.profile.update({
      where: { id },
      data: {
        nome: body.nome,
        descricao: body.descricao,
        updatedBy: auth.user.userId,
      },
    });

    // Atualiza permissões se fornecidas
    if (body.permissionIds && Array.isArray(body.permissionIds)) {
      // Remove todas as permissões antigas
      await prisma.profilePermission.deleteMany({
        where: { profileId: id },
      });

      // Adiciona novas permissões
      for (const permissionId of body.permissionIds) {
        await prisma.profilePermission.create({
          data: {
            profileId: profile.id,
            permissionId,
          },
        });
      }
    }

    // Busca o perfil atualizado
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

    await logUpdate(
      auth.user.userId,
      "perfis",
      profile.id,
      {
        before: existing,
        after: fullProfile,
        changes: Object.keys(body),
      },
      request
    );

    return NextResponse.json(fullProfile);
  } catch (error) {
    console.error("[API Profile PUT] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profiles/[id] - Deletar perfil (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "perfis", "delete");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const existing = await prisma.profile.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usuarios: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Não permite deletar se houver usuários vinculados
    if (existing._count.usuarios > 0) {
      return NextResponse.json(
        {
          error: `Não é possível deletar. Existem ${existing._count.usuarios} usuário(s) vinculado(s) a este perfil.`,
        },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.profile.update({
      where: { id },
      data: {
        ativo: false,
        deletedAt: new Date(),
        deletedBy: auth.user.userId,
      },
    });

    await logDelete(
      auth.user.userId,
      "perfis",
      id,
      { nome: existing.nome },
      request
    );

    return NextResponse.json({ message: "Perfil deletado com sucesso" });
  } catch (error) {
    console.error("[API Profile DELETE] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao deletar perfil" },
      { status: 500 }
    );
  }
}
