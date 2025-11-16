import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy/Middleware
 * Single Responsibility: Roteamento básico
 *
 * NOTA: A autenticação agora é feita via JWT nas APIs e no frontend via AuthContext
 * Este proxy apenas faz redirecionamentos básicos
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permite acesso livre às rotas de API de autenticação
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Permite acesso livre às rotas públicas
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Para outras rotas, permite o acesso (proteção é feita no frontend)
  return NextResponse.next();
}

/**
 * Configuração de rotas que passam pelo middleware
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
    "/login",
  ],
};
