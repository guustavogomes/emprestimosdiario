-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3),
    "cep" TEXT,
    "endereco" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "chavePix" TEXT,
    "nomeEmergencia1" TEXT,
    "telefoneEmergencia1" TEXT,
    "nomeEmergencia2" TEXT,
    "telefoneEmergencia2" TEXT,
    "etiqueta" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_key" ON "clientes"("cpf");
