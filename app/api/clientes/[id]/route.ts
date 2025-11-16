import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";

// GET /api/clientes/[id] - Buscar cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: params.id },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("[API Cliente GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cliente" },
      { status: 500 }
    );
  }
}

// PUT /api/clientes/[id] - Atualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();

    // Verifica se o cliente existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { id: params.id },
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
      where: { id: params.id },
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
      },
    });

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("[API Cliente PUT] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}

// DELETE /api/clientes/[id] - Deletar cliente (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    // Verifica se o cliente existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { id: params.id },
    });

    if (!existingCliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Soft delete (marca como inativo ao invés de deletar)
    await prisma.cliente.update({
      where: { id: params.id },
      data: { ativo: false },
    });

    return NextResponse.json({ message: "Cliente deletado com sucesso" });
  } catch (error) {
    console.error("[API Cliente DELETE] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao deletar cliente" },
      { status: 500 }
    );
  }
}
