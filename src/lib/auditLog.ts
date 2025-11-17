import { prisma } from "@/lib/prisma";
import type { AuditAction } from "@prisma/client";
import type { NextRequest } from "next/server";

/**
 * Serviço de Auditoria (Audit Log)
 * Registra todas as ações importantes do sistema
 */

interface AuditLogData {
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  descricao?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Cria um registro de auditoria
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        descricao: data.descricao,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error("Erro ao criar audit log:", error);
    // Não deve falhar a operação principal se audit log falhar
  }
}

/**
 * Extrai informações da requisição para audit log
 */
export function getRequestInfo(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = request.headers.get("user-agent") || "unknown";

  return { ipAddress, userAgent };
}

/**
 * Helper para registrar ação de CREATE
 */
export async function logCreate(
  userId: string,
  resource: string,
  resourceId: string,
  metadata?: any,
  request?: NextRequest
) {
  const requestInfo = request ? getRequestInfo(request) : {};

  await createAuditLog({
    userId,
    action: "CREATE",
    resource,
    resourceId,
    descricao: `Criou ${resource} ${resourceId}`,
    metadata,
    ...requestInfo,
  });
}

/**
 * Helper para registrar ação de UPDATE
 */
export async function logUpdate(
  userId: string,
  resource: string,
  resourceId: string,
  metadata?: any,
  request?: NextRequest
) {
  const requestInfo = request ? getRequestInfo(request) : {};

  await createAuditLog({
    userId,
    action: "UPDATE",
    resource,
    resourceId,
    descricao: `Atualizou ${resource} ${resourceId}`,
    metadata,
    ...requestInfo,
  });
}

/**
 * Helper para registrar ação de DELETE
 */
export async function logDelete(
  userId: string,
  resource: string,
  resourceId: string,
  metadata?: any,
  request?: NextRequest
) {
  const requestInfo = request ? getRequestInfo(request) : {};

  await createAuditLog({
    userId,
    action: "DELETE",
    resource,
    resourceId,
    descricao: `Deletou ${resource} ${resourceId}`,
    metadata,
    ...requestInfo,
  });
}

/**
 * Helper para registrar ação de READ
 */
export async function logRead(
  userId: string,
  resource: string,
  resourceId?: string,
  metadata?: any,
  request?: NextRequest
) {
  const requestInfo = request ? getRequestInfo(request) : {};

  await createAuditLog({
    userId,
    action: "READ",
    resource,
    resourceId,
    descricao: `Leu ${resource}${resourceId ? ` ${resourceId}` : ""}`,
    metadata,
    ...requestInfo,
  });
}

/**
 * Helper para registrar LOGIN
 */
export async function logLogin(
  userId: string,
  metadata?: any,
  request?: NextRequest
) {
  const requestInfo = request ? getRequestInfo(request) : {};

  await createAuditLog({
    userId,
    action: "LOGIN",
    resource: "auth",
    descricao: "Realizou login",
    metadata,
    ...requestInfo,
  });
}

/**
 * Helper para registrar LOGOUT
 */
export async function logLogout(
  userId: string,
  metadata?: any,
  request?: NextRequest
) {
  const requestInfo = request ? getRequestInfo(request) : {};

  await createAuditLog({
    userId,
    action: "LOGOUT",
    resource: "auth",
    descricao: "Realizou logout",
    metadata,
    ...requestInfo,
  });
}

/**
 * Helper para registrar UPLOAD
 */
export async function logUpload(
  userId: string,
  resourceId: string,
  metadata?: any,
  request?: NextRequest
) {
  const requestInfo = request ? getRequestInfo(request) : {};

  await createAuditLog({
    userId,
    action: "UPLOAD",
    resource: "files",
    resourceId,
    descricao: `Fez upload de arquivo ${resourceId}`,
    metadata,
    ...requestInfo,
  });
}

/**
 * Helper para registrar DOWNLOAD
 */
export async function logDownload(
  userId: string,
  resourceId: string,
  metadata?: any,
  request?: NextRequest
) {
  const requestInfo = request ? getRequestInfo(request) : {};

  await createAuditLog({
    userId,
    action: "DOWNLOAD",
    resource: "files",
    resourceId,
    descricao: `Fez download de arquivo ${resourceId}`,
    metadata,
    ...requestInfo,
  });
}

/**
 * Consultar logs de auditoria com filtros
 */
export async function getAuditLogs(filters: {
  userId?: string;
  resource?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.resource) where.resource = filters.resource;
  if (filters.action) where.action = filters.action;

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            cpf: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}
