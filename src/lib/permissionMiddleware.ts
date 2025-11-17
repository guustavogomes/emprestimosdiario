import { NextRequest, NextResponse } from "next/server";
import { extractTokenFromHeader, verifyToken } from "@/lib/jwt";
import { hasPermission } from "@/lib/permissions";

/**
 * Middleware para verificar permissões em rotas da API
 */

export async function requirePermission(
  request: NextRequest,
  resource: string,
  action: string
) {
  try {
    // Extrai e verifica o token
    const authHeader = request.headers.get("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      );
    }

    // Verifica se o usuário tem a permissão
    const hasAccess = await hasPermission(payload.userId, resource, action);

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: "Acesso negado",
          message: `Você não tem permissão para ${action} em ${resource}`,
        },
        { status: 403 }
      );
    }

    // Retorna os dados do usuário se tiver permissão
    return { user: payload };
  } catch (error: any) {
    console.error("Erro no middleware de permissões:", error);
    return NextResponse.json(
      { error: "Erro ao verificar permissões", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Middleware alternativo que aceita um array de permissões (OR lógico)
 * Usuário precisa ter PELO MENOS UMA das permissões listadas
 */
export async function requireAnyPermission(
  request: NextRequest,
  permissions: Array<{ resource: string; action: string }>
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      );
    }

    // Verifica cada permissão
    for (const perm of permissions) {
      const hasAccess = await hasPermission(
        payload.userId,
        perm.resource,
        perm.action
      );
      if (hasAccess) {
        return { user: payload };
      }
    }

    // Não tem nenhuma das permissões
    return NextResponse.json(
      {
        error: "Acesso negado",
        message: "Você não tem permissão para acessar este recurso",
      },
      { status: 403 }
    );
  } catch (error: any) {
    console.error("Erro no middleware de permissões:", error);
    return NextResponse.json(
      { error: "Erro ao verificar permissões", details: error.message },
      { status: 500 }
    );
  }
}
