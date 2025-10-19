import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@c9.local' },
    update: {},
    create: { email: 'admin@c9.local', hash, role: 'ADMIN' }
  })

  await prisma.product.createMany({
    data: [
      { sku: 'ARROZ-1', name: 'Arroz 1kg', minStock: 5 },
      { sku: 'ACEITE-1', name: 'Aceite 1L', minStock: 3 }
    ],
    skipDuplicates: true
  })

  // movimientos de ejemplo
  const arroz = await prisma.product.findUnique({ where: { sku: 'ARROZ-1' } })
  const aceite = await prisma.product.findUnique({ where: { sku: 'ACEITE-1' } })

  await prisma.move.createMany({
    data: [
      { productId: arroz.id, userId: admin.id, type: 'IN', qty: 20 },
      { productId: arroz.id, userId: admin.id, type: 'OUT', qty: 3 },
      { productId: aceite.id, userId: admin.id, type: 'IN', qty: 10 },
      { productId: aceite.id, userId: admin.id, type: 'OUT', qty: 1 }
    ]
  })
  console.log('Seed listo.')
}

main().finally(()=>prisma.$disconnect())
