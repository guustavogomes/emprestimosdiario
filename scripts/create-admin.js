const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

/**
 * Script para criar ou atualizar usuário Administrador
 *
 * Uso:
 * node scripts/create-admin.js
 *
 * OU com dotenv:
 * npx dotenv -e .env.local -- node scripts/create-admin.js
 */

async function main() {
  console.log("🔧 Criando/Atualizando usuário Administrador...\n");

  const cpf = "00000000000";
  const senha = "admin123";
  const nome = "Administrador";
  const email = "admin@emprestimodiario.com";

  // Busca perfil de Administrador
  const adminProfile = await prisma.profile.findUnique({
    where: { nome: "Administrador" },
  });

  if (!adminProfile) {
    console.error("❌ Perfil 'Administrador' não encontrado!");
    console.log("\nExecute o seed dos perfis primeiro:");
    console.log("npx dotenv -e .env.local -- node prisma/seed-rbac.js\n");
    process.exit(1);
  }

  // Verifica se já existe usuário com esse CPF
  const existingUser = await prisma.usuario.findUnique({
    where: { cpf },
  });

  if (existingUser) {
    console.log("⚠️  Usuário com CPF 000.000.000-00 já existe!");
    console.log("📝 Atualizando para tipo ADMIN...\n");

    const senhaHash = await bcrypt.hash(senha, 10);

    const user = await prisma.usuario.update({
      where: { id: existingUser.id },
      data: {
        nome,
        email,
        senhaHash,
        tipo: "ADMIN",
        profileId: adminProfile.id,
        ativo: true,
        deletedAt: null,
        deletedBy: null,
      },
    });

    console.log("✅ Usuário atualizado com sucesso!");
    console.log("\n📋 Dados do usuário:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.nome}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   CPF: ${user.cpf}`);
    console.log(`   Tipo: ${user.tipo}`);
    console.log(`   Perfil: Administrador`);
    console.log("\n🔑 Credenciais de acesso:");
    console.log(`   CPF: 000.000.000-00`);
    console.log(`   Senha: admin123`);
  } else {
    console.log("🆕 Criando novo usuário administrador...\n");

    const senhaHash = await bcrypt.hash(senha, 10);

    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        cpf,
        senhaHash,
        tipo: "ADMIN",
        profileId: adminProfile.id,
      },
    });

    console.log("✅ Usuário criado com sucesso!");
    console.log("\n📋 Dados do usuário:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.nome}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   CPF: ${user.cpf}`);
    console.log(`   Tipo: ${user.tipo}`);
    console.log(`   Perfil: Administrador`);
    console.log("\n🔑 Credenciais de acesso:");
    console.log(`   CPF: 000.000.000-00`);
    console.log(`   Senha: admin123`);
  }

  console.log("\n✨ Pronto! Você já pode fazer login no sistema.");
}

main()
  .catch((e) => {
    console.error("\n❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
