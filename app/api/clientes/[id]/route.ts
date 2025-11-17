import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissionMiddleware";
import { logRead, logUpdate, logDelete } from "@/lib/auditLog";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/clientes/[id] - Buscar cliente por ID
 * Requer permissão: clientes:read
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verifica permissão
  const auth = await requirePermission(request, "clientes", "read");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Registra auditoria
    await logRead(
      auth.user.userId,
      "clientes",
      cliente.id,
      { nome: cliente.nome },
      request
    );

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("[API Cliente GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cliente" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clientes/[id] - Atualizar cliente
 * Requer permissão: clientes:update
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verifica permissão
  const auth = await requirePermission(request, "clientes", "update");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const body = await request.json();

    // Busca estado anterior para auditoria
    const existingCliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!existingCliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Se está alterando o CPF, verifica se já existe outro cliente com esse CPF
    if (body.cpf && body.cpf !== existingCliente.cpf) {
      const cpfExists = await prisma.cliente.findUnique({
        where: { cpf: body.cpf },
      });

      if (cpfExists) {
        return NextResponse.json(
          { error: "CPF já cadastrado para outro cliente" },
          { status: 400 }
        );
      }
    }

    // Atualiza o cliente
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome: body.nome,
        telefone: body.telefone,
        cpf: body.cpf,
        dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
        cep: body.cep,
        endereco: body.endereco,
        numero: body.numero,
        bairro: body.bairro,
        cidade: body.cidade,
        chavePix: body.chavePix,
        nomeEmergencia1: body.nomeEmergencia1,
        telefoneEmergencia1: body.telefoneEmergencia1,
        nomeEmergencia2: body.nomeEmergencia2,
        telefoneEmergencia2: body.telefoneEmergencia2,
        etiqueta: body.etiqueta,
        updatedBy: auth.user.userId, // Rastreabilidade
      },
    });

    // Registra auditoria com mudanças
    await logUpdate(
      auth.user.userId,
      "clientes",
      cliente.id,
      {
        before: existingCliente,
        after: cliente,
        changes: Object.keys(body),
      },
      request
    );

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("[API Cliente PUT] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clientes/[id] - Deletar cliente (soft delete)
 * Requer permissão: clientes:delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verifica permissão
  const auth = await requirePermission(request, "clientes", "delete");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    // Verifica se o cliente existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!existingCliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Soft delete (marca como inativo ao invés de deletar)
    await prisma.cliente.update({
      where: { id },
      data: {
        ativo: false,
        deletedAt: new Date(),
        deletedBy: auth.user.userId,
      },
    });

    // Registra auditoria
    await logDelete(
      auth.user.userId,
      "clientes",
      id,
      { nome: existingCliente.nome, cpf: existingCliente.cpf },
      request
    );

    return NextResponse.json({ message: "Cliente deletado com sucesso" });
  } catch (error) {
    console.error("[API Cliente DELETE] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao deletar cliente" },
      { status: 500 }
    );
  }
}
