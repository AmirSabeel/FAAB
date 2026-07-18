import { db } from '@/lib/db'

async function seedTrending() {
  console.log('Seeding trending products...')

  // Find the 8 products that match the trending list
  const trendingNames = [
    'Silk Blend Blazer',
    'Cashmere Sweater',
    'Leather Tote Bag',
    'Minimal Watch',
    'Linen Shirt',
    'Designer Sunglasses',
    'Suede Ankle Boots',
    'Gold Chain Necklace',
  ]

  for (let i = 0; i < trendingNames.length; i++) {
    const name = trendingNames[i]
    const product = await db.product.findFirst({ where: { name } })
    if (product) {
      await db.product.update({
        where: { id: product.id },
        data: {
          isTrending: true,
          trendingOrder: i,
          // Also update prices to INR values
          price: product.name === 'Silk Blend Blazer' ? 40587 :
                 product.name === 'Cashmere Sweater' ? 27307 :
                 product.name === 'Leather Tote Bag' ? 49717 :
                 product.name === 'Minimal Watch' ? 20667 :
                 product.name === 'Linen Shirt' ? 15687 :
                 product.name === 'Designer Sunglasses' ? 23157 :
                 product.name === 'Suede Ankle Boots' ? 37267 :
                 product.name === 'Gold Chain Necklace' ? 16517 : product.price,
          originalPrice: product.name === 'Silk Blend Blazer' ? 58017 :
                         product.name === 'Minimal Watch' ? 28967 : product.originalPrice,
        },
      })
      console.log(`  ✓ ${name} → trending #${i + 1}`)
    } else {
      console.log(`  ✗ ${name} — not found in DB`)
    }
  }

  const trending = await db.product.findMany({
    where: { isTrending: true },
    orderBy: { trendingOrder: 'asc' },
  })
  console.log(`\nTrending products in DB: ${trending.length}`)
  trending.forEach((p) => console.log(`  #${p.trendingOrder} ${p.name} — ₹${p.price}`))
  console.log('Done!')
}

seedTrending()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => process.exit(0))