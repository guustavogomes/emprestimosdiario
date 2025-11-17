import { prisma } from "@/lib/prisma";
import type { UserType } from "@prisma/client";

/**
 * Sistema de Permissões (RBAC)
 * Controla acesso baseado em perfis e permissões
 */

export interface PermissionCheck {
  resource: string;
  action: string;
}

/**
 * Verifica se um usuário tem uma permissão específica
 */
export async function hasPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  try {
    // Busca o usuário com seu perfil e permissões
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!usuario) {
      return false;
    }

    // ADMIN tem acesso total
    if (usuario.tipo === "ADMIN") {
      return true;
    }

    // Verifica se tem a permissão específica no perfil
    if (usuario.profile) {
      const hasPermission = usuario.profile.permissions.some(
        (pp) =>
          pp.permission.resource === resource &&
          pp.permission.action === action
      );

      if (hasPermission) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return false;
  }
}

/**
 * Verifica múltiplas permissões de uma vez
 */
export async function hasAnyPermission(
  userId: string,
  permissions: PermissionCheck[]
): Promise<boolean> {
  for (const perm of permissions) {
    const has = await hasPermission(userId, perm.resource, perm.action);
    if (has) return true;
  }
  return false;
}

/**
 * Verifica se usuário tem TODAS as permissões
 */
export async function hasAllPermissions(
  userId: string,
  permissions: PermissionCheck[]
): Promise<boolean> {
  for (const perm of permissions) {
    const has = await hasPermission(userId, perm.resource, perm.action);
    if (!has) return false;
  }
  return true;
}

/**
 * Obtém todas as permissões de um usuário
 */
export async function getUserPermissions(userId: string): Promise<{
  resource: string;
  action: string;
}[]> {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!usuario) {
    return [];
  }

  // ADMIN tem todas as permissões
  if (usuario.tipo === "ADMIN") {
    return await prisma.permission.findMany({
      select: {
        resource: true,
        action: true,
      },
    });
  }

  if (!usuario.profile) {
    return [];
  }

  return usuario.profile.permissions.map((pp) => ({
    resource: pp.permission.resource,
    action: pp.permission.action,
  }));
}

/**
 * Verifica se usuário pode acessar um recurso específico baseado no tipo
 */
export function canAccessResource(
  userType: UserType,
  resource: string
): boolean {
  // ADMIN acessa tudo
  if (userType === "ADMIN") return true;

  // CLIENT só acessa seus próprios dados
  if (userType === "CLIENT") {
    return ["perfil", "emprestimos", "documentos"].includes(resource);
  }

  // Outros tipos precisam ter permissão explícita
  return false;
}

/**
 * Obter perfil de um usuário
 */
export async function getUserProfile(userId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  return usuario?.profile || null;
}
