import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authMiddleware";
import { uploadToR2 } from "@/lib/r2";

/**
 * API de Upload de Arquivos para Cloudflare R2
 *
 * POST /api/upload
 *
 * Body (multipart/form-data):
 * - file: arquivo a ser enviado
 * - folder: (opcional) pasta de destino no R2
 * - clienteId: (opcional) ID do cliente relacionado
 */

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) {
      return auth;
    }

    // Verifica se há arquivo
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string | null;
    const clienteId = formData.get("clienteId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo fornecido" },
        { status: 400 }
      );
    }

    // Valida tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Tamanho máximo: 10MB" },
        { status: 400 }
      );
    }

    // Valida tipo de arquivo (apenas imagens e PDFs)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Tipo de arquivo não permitido. Apenas imagens (JPEG, PNG, WebP) e PDFs são aceitos",
        },
        { status: 400 }
      );
    }

    // Converte o arquivo para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gera nome único para o arquivo
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-${originalName}`;

    // Define a pasta de destino
    let uploadFolder = folder || "uploads";
    if (clienteId) {
      uploadFolder = `clientes/${clienteId}`;
    }

    // Faz upload para o R2
    const key = await uploadToR2(buffer, fileName, file.type, uploadFolder);

    // Retorna sucesso
    return NextResponse.json({
      success: true,
      key,
      fileName,
      folder: uploadFolder,
      size: file.size,
      contentType: file.type,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Configuração do Next.js para aceitar uploads
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
