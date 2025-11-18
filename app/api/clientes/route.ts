import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissionMiddleware";
import { logCreate, logRead } from "@/lib/auditLog";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

/**
 * GET /api/clientes - Listar todos os clientes
 * Requer permissão: clientes:read
 */
export async function GET(request: NextRequest) {
  // Verifica permissão
  const auth = await requirePermission(request, "clientes", "read");
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

    // Registra auditoria
    await logRead(
      auth.user.userId,
      "clientes",
      undefined,
      { total: clientes.length, filters: { etiqueta, search } },
      request
    );

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("[API Clientes GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao listar clientes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clientes - Criar novo cliente (com usuário se vier do app)
 * Requer permissão: clientes:create OU pode ser público (auto-cadastro)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Valida campos obrigatórios
    if (!body.nome || !body.telefone || !body.cpf) {
      return NextResponse.json(
        { error: "Nome, telefone e CPF são obrigatórios" },
        { status: 400 }
      );
    }

    // Se vier com senha, é auto-cadastro do app (precisa de whatsapp também)
    const isAutoRegister = !!body.senha;

    if (isAutoRegister && !body.whatsapp) {
      return NextResponse.json(
        { error: "WhatsApp é obrigatório para auto-cadastro" },
        { status: 400 }
      );
    }

    // Verifica permissão apenas se não for auto-cadastro
    if (!isAutoRegister) {
      const auth = await requirePermission(request, "clientes", "create");
      if (auth instanceof NextResponse) return auth;
    }

    // Verifica se o CPF já existe (tanto em Cliente quanto em Usuario)
    const [existingCliente, existingUsuario] = await Promise.all([
      prisma.cliente.findUnique({ where: { cpf: body.cpf } }),
      prisma.usuario.findUnique({ where: { cpf: body.cpf } }),
    ]);

    if (existingCliente || existingUsuario) {
      return NextResponse.json(
        { error: "CPF já cadastrado" },
        { status: 400 }
      );
    }

    // Se tiver email, verifica se já existe
    if (body.email) {
      const existingEmail = await prisma.usuario.findUnique({
        where: { email: body.email },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: "Email já cadastrado" },
          { status: 400 }
        );
      }
    }

    let cliente;
    let usuario;

    if (isAutoRegister) {
      // Auto-cadastro: Cria cliente + usuário em uma transação
      const senhaHash = await bcrypt.hash(body.senha, 10);

      const result = await prisma.$transaction(async (tx) => {
        // Cria o cliente
        const novoCliente = await tx.cliente.create({
          data: {
            nome: body.nome,
            telefone: body.telefone,
            cpf: body.cpf,
            dataNascimento: body.dataNascimento
              ? new Date(body.dataNascimento)
              : null,
            cep: body.cep,
            endereco: body.endereco,
            numero: body.numero,
            complemento: body.complemento,
            bairro: body.bairro,
            cidade: body.cidade,
            chavePix: body.chavePix,
            nomeEmergencia1: body.nomeEmergencia1,
            telefoneEmergencia1: body.telefoneEmergencia1,
            nomeEmergencia2: body.nomeEmergencia2,
            telefoneEmergencia2: body.telefoneEmergencia2,
          },
        });

        // Cria o usuário associado ao cliente
        const novoUsuario = await tx.usuario.create({
          data: {
            nome: body.nome,
            cpf: body.cpf,
            email: body.email,
            senhaHash,
            tipo: "CLIENT",
            clienteId: novoCliente.id,
            ativo: true,
          },
        });

        return { cliente: novoCliente, usuario: novoUsuario };
      });

      cliente = result.cliente;
      usuario = result.usuario;

      // Registra auditoria (auto-cadastro)
      await logCreate(
        usuario.id,
        "clientes",
        cliente.id,
        {
          nome: cliente.nome,
          cpf: cliente.cpf,
          tipo: "auto-cadastro",
          whatsapp: body.whatsapp,
        },
        request
      );
    } else {
      // Cadastro via dashboard (sem usuário)
      const auth = await requirePermission(request, "clientes", "create");

      cliente = await prisma.cliente.create({
        data: {
          nome: body.nome,
          telefone: body.telefone,
          cpf: body.cpf,
          dataNascimento: body.dataNascimento
            ? new Date(body.dataNascimento)
            : null,
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
          createdBy: (auth as any).user.userId,
        },
      });

      await logCreate(
        (auth as any).user.userId,
        "clientes",
        cliente.id,
        { nome: cliente.nome, cpf: cliente.cpf },
        request
      );
    }

    return NextResponse.json(
      {
        cliente,
        usuario: usuario ? { id: usuario.id, tipo: usuario.tipo } : null,
        message: isAutoRegister
          ? "Cadastro realizado! Faça login com seu CPF e senha."
          : "Cliente cadastrado com sucesso!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API Clientes POST] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}
