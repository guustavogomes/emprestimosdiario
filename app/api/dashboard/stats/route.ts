import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dashboard/stats - Estatísticas do dashboard
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    // Contar usuários por tipo
    const usuariosPorTipo = await prisma.usuario.groupBy({
      by: ["tipo"],
      where: { ativo: true },
      _count: true,
    });

    // Total de clientes
    const totalClientes = await prisma.cliente.count({
      where: { ativo: true },
    });

    // Total de perfis
    const totalPerfis = await prisma.profile.count({
      where: { ativo: true },
    });

    // Últimas ações (audit logs)
    const ultimasAcoes = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            nome: true,
            cpf: true,
          },
        },
      },
    });

    // Ações por tipo (últimos 30 dias)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);

    const acoesPorTipo = await prisma.auditLog.groupBy({
      by: ["action"],
      where: {
        createdAt: {
          gte: dataLimite,
        },
      },
      _count: true,
    });

    return NextResponse.json({
      usuariosPorTipo: usuariosPorTipo.map((u) => ({
        tipo: u.tipo,
        total: u._count,
      })),
      totalClientes,
      totalPerfis,
      ultimasAcoes: ultimasAcoes.map((log) => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        descricao: log.descricao,
        createdAt: log.createdAt,
        user: log.user,
      })),
      acoesPorTipo: acoesPorTipo.map((a) => ({
        action: a.action,
        total: a._count,
      })),
    });
  } catch (error) {
    console.error("[API Dashboard Stats] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
