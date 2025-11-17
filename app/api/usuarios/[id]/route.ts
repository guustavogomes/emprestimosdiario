import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissionMiddleware";
import { logRead, logUpdate, logDelete } from "@/lib/auditLog";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

/**
 * GET /api/usuarios/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "usuarios", "read");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        profile: true,
      },
      // Não retorna senhaHash
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const { senhaHash, ...usuarioSemSenha } = usuario as any;

    await logRead(auth.user.userId, "usuarios", usuario.id, { nome: usuario.nome }, request);

    return NextResponse.json(usuarioSemSenha);
  } catch (error) {
    console.error("[API Usuario GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/usuarios/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "usuarios", "update");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const body = await request.json();

    const existing = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Prepara dados para atualização
    const updateData: any = {
      nome: body.nome,
      email: body.email,
      tipo: body.tipo,
    };

    // Atualiza o perfil usando a relação
    if (body.profileId) {
      updateData.profile = { connect: { id: body.profileId } };
    } else if (body.profileId === null || body.profileId === "") {
      updateData.profile = { disconnect: true };
    }

    // Se forneceu nova senha
    if (body.senha) {
      updateData.senhaHash = await bcrypt.hash(body.senha, 10);
    }

    // Se está alterando CPF, verifica se já existe
    if (body.cpf && body.cpf !== existing.cpf) {
      const cpfExists = await prisma.usuario.findUnique({
        where: { cpf: body.cpf },
      });

      if (cpfExists) {
        return NextResponse.json(
          { error: "CPF já cadastrado" },
          { status: 400 }
        );
      }

      updateData.cpf = body.cpf;
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        tipo: true,
        profileId: true,
        ativo: true,
        updatedAt: true,
      },
    });

    await logUpdate(
      auth.user.userId,
      "usuarios",
      usuario.id,
      {
        changes: Object.keys(body),
        alterouSenha: !!body.senha,
      },
      request
    );

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("[API Usuario PUT] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/usuarios/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "usuarios", "delete");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const existing = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Não permite deletar a si mesmo
    if (existing.id === auth.user.userId) {
      return NextResponse.json(
        { error: "Você não pode deletar sua própria conta" },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.usuario.update({
      where: { id },
      data: {
        ativo: false,
        deletedAt: new Date(),
        deletedBy: auth.user.userId,
      },
    });

    await logDelete(
      auth.user.userId,
      "usuarios",
      id,
      { nome: existing.nome, cpf: existing.cpf },
      request
    );

    return NextResponse.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("[API Usuario DELETE] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao deletar usuário" },
      { status: 500 }
    );
  }
}
