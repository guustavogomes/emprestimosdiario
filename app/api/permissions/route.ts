import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissionMiddleware";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/permissions - Listar todas as permissões
 * Usado para popular checkboxes ao criar/editar perfis
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "perfis", "read");
  if (auth instanceof NextResponse) return auth;

  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
    });

    // Agrupa por recurso para facilitar exibição
    const grouped = permissions.reduce((acc: any, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    }, {});

    return NextResponse.json({
      permissions,
      grouped,
    });
  } catch (error) {
    console.error("[API Permissions GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao listar permissões" },
      { status: 500 }
    );
  }
}
