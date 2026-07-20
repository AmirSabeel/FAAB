import { db } from './src/lib/db'
import { hash } from 'bcryptjs'

async function seedAdmin() {
  const email = 'admin@faab.in'
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    if (existing.role !== 'admin') {
      await db.user.update({ where: { email }, data: { role: 'admin' } })
      console.log('Updated existing user to admin role:', email)
    } else {
      console.log('Admin user already exists:', email)
    }
    return
  }
  const password = await hash('admin123', 12)
  const user = await db.user.create({
    data: { name: 'FAAB Admin', email, password, role: 'admin', phone: '+91 98765 43210', city: 'Mumbai', country: 'India' },
  })
  console.log('Admin user created:', user.email)
}

seedAdmin().catch(console.error).finally(() => db.$disconnect())

