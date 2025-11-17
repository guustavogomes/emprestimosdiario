const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Seed do Sistema de Perfis e Permissões (RBAC)
 * Cria perfis padrão e suas permissões
 */

async function main() {
  console.log("🌱 Iniciando seed do sistema RBAC...");

  // ========================================
  // 1. CRIAR PERMISSÕES
  // ========================================
  console.log("\n📋 Criando permissões...");

  const resources = [
    "clientes",
    "emprestimos",
    "usuarios",
    "relatorios",
    "configuracoes",
    "perfis",
    "auditoria",
    "dashboard",
  ];

  const actions = ["read", "create", "update", "delete"];

  const permissions = [];

  for (const resource of resources) {
    for (const action of actions) {
      const permission = await prisma.permission.upsert({
        where: {
          resource_action: {
            resource,
            action,
          },
        },
        update: {},
        create: {
          resource,
          action,
          descricao: `Permissão para ${action} em ${resource}`,
        },
      });

      permissions.push(permission);
      console.log(`  ✅ ${resource}:${action}`);
    }
  }

  console.log(`\n✅ ${permissions.length} permissões criadas`);

  // ========================================
  // 2. CRIAR PERFIS
  // ========================================
  console.log("\n👥 Criando perfis...");

  // PERFIL: Administrador (acesso total)
  const adminProfile = await prisma.profile.upsert({
    where: { nome: "Administrador" },
    update: {},
    create: {
      nome: "Administrador",
      descricao: "Acesso total ao sistema",
    },
  });

  // Adiciona TODAS as permissões ao admin
  for (const permission of permissions) {
    await prisma.profilePermission.upsert({
      where: {
        profileId_permissionId: {
          profileId: adminProfile.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        profileId: adminProfile.id,
        permissionId: permission.id,
      },
    });
  }
  console.log(`  ✅ Administrador (${permissions.length} permissões)`);

  // PERFIL: Gerente
  const managerProfile = await prisma.profile.upsert({
    where: { nome: "Gerente" },
    update: {},
    create: {
      nome: "Gerente",
      descricao: "Gerente com acesso a relatórios e aprovações",
    },
  });

  const managerPermissions = permissions.filter(
    (p) =>
      ["clientes", "emprestimos", "relatorios", "dashboard"].includes(
        p.resource
      ) && ["read", "update"].includes(p.action)
  );

  for (const permission of managerPermissions) {
    await prisma.profilePermission.upsert({
      where: {
        profileId_permissionId: {
          profileId: managerProfile.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        profileId: managerProfile.id,
        permissionId: permission.id,
      },
    });
  }
  console.log(`  ✅ Gerente (${managerPermissions.length} permissões)`);

  // PERFIL: Analista de Crédito
  const analystProfile = await prisma.profile.upsert({
    where: { nome: "Analista" },
    update: {},
    create: {
      nome: "Analista",
      descricao: "Analista de crédito - avalia empréstimos",
    },
  });

  const analystPermissions = permissions.filter(
    (p) =>
      (p.resource === "emprestimos" &&
        ["read", "update"].includes(p.action)) ||
      (p.resource === "clientes" && p.action === "read") ||
      (p.resource === "dashboard" && p.action === "read")
  );

  for (const permission of analystPermissions) {
    await prisma.profilePermission.upsert({
      where: {
        profileId_permissionId: {
          profileId: analystProfile.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        profileId: analystProfile.id,
        permissionId: permission.id,
      },
    });
  }
  console.log(`  ✅ Analista (${analystPermissions.length} permissões)`);

  // PERFIL: Cobrança
  const collectorProfile = await prisma.profile.upsert({
    where: { nome: "Cobrança" },
    update: {},
    create: {
      nome: "Cobrança",
      descricao: "Equipe de cobrança",
    },
  });

  const collectorPermissions = permissions.filter(
    (p) =>
      ((p.resource === "emprestimos" || p.resource === "clientes") &&
        p.action === "read") ||
      (p.resource === "dashboard" && p.action === "read")
  );

  for (const permission of collectorPermissions) {
    await prisma.profilePermission.upsert({
      where: {
        profileId_permissionId: {
          profileId: collectorProfile.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        profileId: collectorProfile.id,
        permissionId: permission.id,
      },
    });
  }
  console.log(`  ✅ Cobrança (${collectorPermissions.length} permissões)`);

  console.log("\n✅ Perfis criados com sucesso!");

  // ========================================
  // 3. RESUMO
  // ========================================
  console.log("\n📊 Resumo:");
  console.log(`  • ${permissions.length} permissões`);
  console.log(`  • 4 perfis (Administrador, Gerente, Analista, Cobrança)`);
  console.log("\n✅ Seed RBAC concluído!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
