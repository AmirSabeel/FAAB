import { db } from '@/lib/db'

const priceMap: Record<string, { price: number; originalPrice: number | null }> = {
  'Oversized Coat': { price: 48887, originalPrice: null },
  'Silk Scarf': { price: 12367, originalPrice: null },
  'Wool Trousers': { price: 22327, originalPrice: null },
  'Canvas Sneakers': { price: 16517, originalPrice: null },
}

async function fixPrices() {
  for (const [name, prices] of Object.entries(priceMap)) {
    const product = await db.product.findFirst({ where: { name } })
    if (product) {
      await db.product.update({
        where: { id: product.id },
        data: { price: prices.price, originalPrice: prices.originalPrice },
      })
      console.log(`  ✓ ${name}: ₹${product.price} → ₹${prices.price}`)
    }
  }
  console.log('Done!')
}

fixPrices()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => process.exit(0))