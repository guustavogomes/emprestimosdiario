import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const cpf = "00000000000"
  const novaSenha = "admin123"

  console.log(`Resetando senha para o usuário com CPF: ${cpf}...\n`)

  const user = await prisma.usuario.findUnique({
    where: { cpf }
  })

  if (!user) {
    console.log("Usuário não encontrado!")
    return
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10)

  await prisma.usuario.update({
    where: { cpf },
    data: { senhaHash }
  })

  console.log("Senha resetada com sucesso!")
  console.log("\n=== CREDENCIAIS DE LOGIN ===")
  console.log(`Nome: ${user.nome}`)
  console.log(`CPF: ${cpf}`)
  console.log(`Nova Senha: ${novaSenha}`)
  console.log("============================\n")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
