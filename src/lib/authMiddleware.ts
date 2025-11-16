import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader, JWTPayload } from "./jwt";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware para autenticar requisições via JWT
 * Retorna os dados do usuário autenticado ou erro 401
 */
export async function authenticate(
  request: NextRequest
): Promise<{ user: JWTPayload } | NextResponse> {
  try {
    // Extrai o token do header
    const authHeader = request.headers.get("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido. Use: Authorization: Bearer <token>" },
        { status: 401 }
      );
    }

    // Verifica o token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      );
    }

    return { user: payload };
  } catch (error) {
    console.error("[Auth Middleware] Erro:", error);
    return NextResponse.json(
      { error: "Erro na autenticação" },
      { status: 500 }
    );
  }
}

/**
 * Helper para proteger rotas de API
 * Uso:
 *
 * export async function GET(request: NextRequest) {
 *   const auth = await requireAuth(request);
 *   if (auth instanceof NextResponse) return auth;
 *
 *   const { user } = auth;
 *   // Sua lógica aqui com user.userId, user.cpf, user.nivel
 * }
 */
export async function requireAuth(request: NextRequest) {
  return authenticate(request);
}
