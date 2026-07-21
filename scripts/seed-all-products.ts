import { db } from '@/lib/db'
import { ALL_PRODUCTS } from '@/data/products'

async function seedAll() {
  console.log(`Seeding all ${ALL_PRODUCTS.length} products into custom.db...`)
  for (let i = 0; i < ALL_PRODUCTS.length; i++) {
    const p = ALL_PRODUCTS[i]
    const existing = await db.product.findFirst({ where: { name: p.name } })
    if (!existing) {
      await db.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice || null,
          image: p.image,
          category: p.category,
          rating: p.rating || 4.8,
          reviewCount: p.reviewCount || 10,
          stock: 30,
          status: 'active',
          isFeatured: true,
          isNew: p.isNew || false,
          isTrending: p.id.startsWith('trend-'),
          trendingOrder: p.id.startsWith('trend-') ? i + 1 : 0,
          newArrivalOrder: p.id.startsWith('new-') ? i + 1 : 0,
          sizes: JSON.stringify(p.sizes || []),
          colors: JSON.stringify(p.colors || []),
        },
      })
      console.log(`+ Created product: ${p.name}`)
    } else {
      console.log(`- Product already exists: ${p.name}`)
    }
  }
  console.log('Seeding complete!')
}

seedAll()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => process.exit(0))
