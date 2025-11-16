import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Verificando usuários no banco de dados...\n")

  const users = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      cpf: true,
      email: true,
      nivel: true,
    }
  })

  console.log(`Total de usuários: ${users.length}\n`)

  if (users.length === 0) {
    console.log("Nenhum usuário encontrado. Criando usuário de teste...")

    const senhaHash = await bcrypt.hash("123456", 10)

    const testUser = await prisma.usuario.create({
      data: {
        nome: "Admin Teste",
        cpf: "12345678900",
        email: "admin@test.com",
        senhaHash,
        nivel: "admin"
      }
    })

    console.log("\nUsuário de teste criado com sucesso!")
    console.log("CPF: 12345678900")
    console.log("Senha: 123456")
    console.log("Nome:", testUser.nome)
    console.log("Nível:", testUser.nivel)
  } else {
    console.log("Usuários cadastrados:")
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.nome}`)
      console.log(`   CPF: ${user.cpf}`)
      console.log(`   Email: ${user.email || "N/A"}`)
      console.log(`   Nível: ${user.nivel}`)
    })
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
