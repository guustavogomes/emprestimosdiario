import { prisma } from "../../../lib/prisma"
import { UserRepository, UserRecord } from "../../domain/repositories/UserRepository"
export class PrismaUserRepository implements UserRepository {
  async findByCpf(cpf: string): Promise<UserRecord | null> {
    const r = await prisma.usuario.findUnique({ where: { cpf } })
    if (!r) return null
    return { id: r.id, nome: r.nome, email: r.email, cpf: r.cpf, senhaHash: r.senhaHash, nivel: r.nivel }
  }
}