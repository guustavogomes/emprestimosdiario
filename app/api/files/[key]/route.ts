import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authMiddleware";
import { getSignedDownloadUrl, deleteFromR2 } from "@/lib/r2";

/**
 * API de Download e Deleção de Arquivos do R2
 *
 * GET /api/files/[key] - Obtém URL assinada para download
 * DELETE /api/files/[key] - Deleta o arquivo
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    // Verifica autenticação
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) {
      return auth;
    }

    const key = decodeURIComponent(params.key);

    if (!key) {
      return NextResponse.json(
        { error: "Key do arquivo não fornecida" },
        { status: 400 }
      );
    }

    // Obtém URL assinada (válida por 1 hora)
    const url = await getSignedDownloadUrl(key);

    return NextResponse.json({
      success: true,
      url,
      key,
      expiresIn: 3600, // segundos
    });
  } catch (error: any) {
    console.error("Erro ao obter URL de download:", error);
    return NextResponse.json(
      { error: "Erro ao obter URL de download", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    // Verifica autenticação
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) {
      return auth;
    }

    const key = decodeURIComponent(params.key);

    if (!key) {
      return NextResponse.json(
        { error: "Key do arquivo não fornecida" },
        { status: 400 }
      );
    }

    // Deleta o arquivo
    await deleteFromR2(key);

    return NextResponse.json({
      success: true,
      message: "Arquivo deletado com sucesso",
      key,
    });
  } catch (error: any) {
    console.error("Erro ao deletar arquivo:", error);
    return NextResponse.json(
      { error: "Erro ao deletar arquivo", details: error.message },
      { status: 500 }
    );
  }
}
