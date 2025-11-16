import bcrypt from "bcryptjs"
import { PrismaUserRepository } from "../../infra/repositories/PrismaUserRepository"

type Input = { cpf: string; senha: string }
type Output = { id: string; nome: string; email: string | null; cpf: string; nivel: string }

export class AuthenticateUser {
  async execute({ cpf, senha }: Input): Promise<Output | null> {
    try {
      console.log('[AuthenticateUser] Iniciando autenticação para CPF:', cpf)
      const repo = new PrismaUserRepository()
      const user = await repo.findByCpf(cpf)

      if (!user) {
        console.log('[AuthenticateUser] Usuário não encontrado para CPF:', cpf)
        return null
      }

      console.log('[AuthenticateUser] Usuário encontrado:', user.nome)
      const ok = await bcrypt.compare(senha, user.senhaHash)

      if (!ok) {
        console.log('[AuthenticateUser] Senha incorreta para CPF:', cpf)
        return null
      }

      console.log('[AuthenticateUser] Autenticação bem-sucedida para:', user.nome)
      return { id: user.id, nome: user.nome, email: user.email, cpf: user.cpf, nivel: user.nivel }
    } catch (error) {
      console.error('[AuthenticateUser] Erro durante autenticação:', error)
      return null
    }
  }
}