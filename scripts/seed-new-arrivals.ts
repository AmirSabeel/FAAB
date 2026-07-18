import { db } from '@/lib/db'

const newArrivalNames = [
  'Oversized Coat',
  'Silk Scarf',
  'Wool Trousers',
  'Canvas Sneakers',
  'Leather Belt',
]

// Products 5 & 6 (Ceramic Watch, Leather Belt) are NOT in the seed DB
// Only seed the ones that exist, and create the missing ones
const newProductsToCreate = [
  {
    name: 'Ceramic Watch',
    description: 'Elegant ceramic watch with a refined minimalist dial, perfect for modern luxury.',
    price: 32287,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&h=667&fit=crop&q=80',
    category: 'Accessories',
    rating: 4.8,
    reviewCount: 19,
    stock: 42,
    isFeatured: false,
    isNew: true,
  },
  {
    name: 'Leather Belt',
    description: 'Handcrafted Italian leather belt with a brushed gold buckle.',
    price: 10707,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=667&fit=crop&q=80',
    category: 'Accessories',
    rating: 4.5,
    reviewCount: 56,
    stock: 88,
    isFeatured: false,
    isNew: true,
  },
]

async function seedNewArrivals() {
  console.log('Seeding New Arrivals...')

  let order = 1

  // First, update existing products that are in the new arrivals list
  for (const name of newArrivalNames) {
    const product = await db.product.findFirst({ where: { name } })
    if (product) {
      await db.product.update({
        where: { id: product.id },
        data: {
          newArrivalOrder: order,
          isNew: true,
        },
      })
      console.log(`  ✓ ${name} → new arrival #${order}`)
      order++
    } else {
      console.log(`  ✗ ${name} — not found in DB`)
    }
  }

  // Create products that don't exist yet
  for (const data of newProductsToCreate) {
    const existing = await db.product.findFirst({ where: { name: data.name } })
    if (!existing) {
      const created = await db.product.create({
        data: {
          ...data,
          status: 'active',
          newArrivalOrder: order,
        },
      })
      console.log(`  + ${created.name} → new arrival #${order} (created)`)
      order++
    } else {
      await db.product.update({
        where: { id: existing.id },
        data: { newArrivalOrder: order, isNew: true },
      })
      console.log(`  ✓ ${existing.name} → new arrival #${order}`)
      order++
    }
  }

  const arrivals = await db.product.findMany({
    where: { newArrivalOrder: { gt: 0 } },
    orderBy: { newArrivalOrder: 'asc' },
  })
  console.log(`\nNew Arrivals in DB: ${arrivals.length}`)
  arrivals.forEach((p) => console.log(`  #${p.newArrivalOrder} ${p.name} — ₹${p.price}`))
  console.log('Done!')
}

seedNewArrivals()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => process.exit(0))