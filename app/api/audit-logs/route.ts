import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissionMiddleware";
import { getAuditLogs } from "@/lib/auditLog";

/**
 * GET /api/audit-logs - Listar logs de auditoria
 * Requer permissão: auditoria:read
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "auditoria", "read");
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);

    const filters: any = {
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    if (searchParams.get("userId")) {
      filters.userId = searchParams.get("userId")!;
    }

    if (searchParams.get("resource")) {
      filters.resource = searchParams.get("resource")!;
    }

    if (searchParams.get("action")) {
      filters.action = searchParams.get("action") as any;
    }

    if (searchParams.get("startDate")) {
      filters.startDate = new Date(searchParams.get("startDate")!);
    }

    if (searchParams.get("endDate")) {
      filters.endDate = new Date(searchParams.get("endDate")!);
    }

    const { logs, total } = await getAuditLogs(filters);

    return NextResponse.json({ logs, total, filters });
  } catch (error) {
    console.error("[API Audit Logs GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar logs de auditoria" },
      { status: 500 }
    );
  }
}
