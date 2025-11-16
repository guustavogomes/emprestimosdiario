import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";

// GET /api/clientes - Listar todos os clientes
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const etiqueta = searchParams.get("etiqueta");
    const search = searchParams.get("search");

    const where: any = { ativo: true };

    if (etiqueta) {
      where.etiqueta = etiqueta;
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { cpf: { contains: search } },
        { telefone: { contains: search } },
      ];
    }

    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("[API Clientes GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao listar clientes" },
      { status: 500 }
    );
  }
}

// POST /api/clientes - Criar novo cliente
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();

    // Valida campos obrigatórios
    if (!body.nome || !body.telefone || !body.cpf) {
      return NextResponse.json(
        { error: "Nome, telefone e CPF são obrigatórios" },
        { status: 400 }
      );
    }

    // Verifica se o CPF já existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { cpf: body.cpf },
    });

    if (existingCliente) {
      return NextResponse.json(
        { error: "CPF já cadastrado" },
        { status: 400 }
      );
    }

    // Cria o cliente
    const cliente = await prisma.cliente.create({
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

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error("[API Clientes POST] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}
