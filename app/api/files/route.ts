import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authMiddleware";
import { listFilesInR2 } from "@/lib/r2";

/**
 * API de Listagem de Arquivos do R2
 *
 * GET /api/files
 * Query params:
 * - folder: pasta para listar (opcional)
 */

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticação
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) {
      return auth;
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || undefined;

    const files = await listFilesInR2(folder);

    return NextResponse.json({
      success: true,
      files,
      total: files.length,
    });
  } catch (error: any) {
    console.error("Erro ao listar arquivos:", error);
    return NextResponse.json(
      { error: "Erro ao listar arquivos", details: error.message },
      { status: 500 }
    );
  }
}
