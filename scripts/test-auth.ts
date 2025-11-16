import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const cpf = "00000000000"
  const senha = "admin123"

  console.log("=== TESTE DE AUTENTICAÇÃO ===\n")
  console.log(`Buscando usuário com CPF: ${cpf}`)

  const user = await prisma.usuario.findUnique({
    where: { cpf }
  })

  if (!user) {
    console.log("❌ Usuário não encontrado!")
    return
  }

  console.log("✅ Usuário encontrado:")
  console.log(`   Nome: ${user.nome}`)
  console.log(`   CPF: ${user.cpf}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Nível: ${user.nivel}`)
  console.log(`   Hash armazenado: ${user.senhaHash.substring(0, 30)}...`)

  console.log(`\nTestando senha: "${senha}"`)
  const isValid = await bcrypt.compare(senha, user.senhaHash)

  if (isValid) {
    console.log("✅ Senha correta! Autenticação bem-sucedida.")
  } else {
    console.log("❌ Senha incorreta!")

    // Testa criar um novo hash
    console.log("\nCriando novo hash para comparação...")
    const newHash = await bcrypt.hash(senha, 10)
    console.log(`   Novo hash: ${newHash.substring(0, 30)}...`)

    const testNewHash = await bcrypt.compare(senha, newHash)
    console.log(`   Teste do novo hash: ${testNewHash ? "✅" : "❌"}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
