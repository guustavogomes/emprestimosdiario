import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()
async function run() {
  const senhaHash = await bcrypt.hash('admin123', 10)
  await prisma.usuario.upsert({
    where: { cpf: '00000000000' },
    update: {},
    create: { nome: 'Admin', email: 'admin@example.com', cpf: '00000000000', senhaHash, nivel: 'Administrador' },
  })
}
run().then(()=>process.exit(0)).catch((e)=>{ console.error(e); process.exit(1) })
