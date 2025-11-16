export type UserRecord = {
  id: string
  nome: string
  email: string | null
  cpf: string
  senhaHash: string
  nivel: string
}
export interface UserRepository {
  findByCpf(cpf: string): Promise<UserRecord | null>
}