import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // Token expira em 7 dias

export interface JWTPayload {
  userId: string;
  cpf: string;
  nivel: string;
}

export interface JWTUser extends JWTPayload {
  nome: string;
  email: string | null;
}

/**
 * Gera um token JWT
 */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return null;
  }
}

/**
 * Extrai o token do header Authorization
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  // Formato esperado: "Bearer <token>"
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}
