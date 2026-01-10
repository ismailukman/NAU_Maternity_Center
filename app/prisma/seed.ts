import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default admin user
  const hashedPassword = await bcrypt.hash('Main@super54321', 10)

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@naumaternity.com' },
    update: {},
    create: {
      email: 'admin@naumaternity.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+234 900 000 0000',
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('✅ Created admin user:', admin.email)
  console.log('📧 Email: admin@naumaternity.com')
  console.log('🔑 Password: Main@super54321')
  console.log('')
  console.log('⚠️  IMPORTANT: Please change the password after first login!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
