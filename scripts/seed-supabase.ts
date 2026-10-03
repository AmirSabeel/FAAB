import { db } from '@/lib/db'
import { ALL_PRODUCTS } from '@/data/products'

const DEFAULT_SLIDES = [
  {
    title: 'The New\nSeason Arrives',
    subtitle: 'Discover the latest collection of timeless pieces crafted with meticulous attention to detail and refined elegance.',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
    sortOrder: 0,
    isActive: true,
  },
  {
    title: 'Curated\nLuxury',
    subtitle: "Explore handpicked selections from the world's most coveted fashion houses and emerging designers.",
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80',
    sortOrder: 1,
    isActive: true,
  },
  {
    title: 'Define\nYour Style',
    subtitle: 'From runway to everyday — express your individuality with pieces that speak louder than words.',
    ctaText: 'Discover More',
    ctaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80',
    sortOrder: 2,
    isActive: true,
  },
]

const DEFAULT_CATEGORIES = [
  { name: "Women's Fashion", image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&q=80', link: "/shop?category=Women's Fashion", sortOrder: 0 },
  { name: "Men's Fashion", image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=400&fit=crop&q=80', link: "/shop?category=Men's Fashion", sortOrder: 1 },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80', link: '/shop?category=Accessories', sortOrder: 2 },
  { name: 'Footwear', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&q=80', link: '/shop?category=Footwear', sortOrder: 3 },
  { name: 'Bags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&q=80', link: '/shop?category=Accessories', sortOrder: 4 },
  { name: 'Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&q=80', link: '/shop?category=Watches', sortOrder: 5 },
]

const DEFAULT_COLLECTIONS = [
  { name: 'Summer Essentials', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=400&fit=crop&q=80', itemCount: 24, link: '/shop?category=Women\'s Fashion', sortOrder: 0 },
  { name: 'Urban Minimalism', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=400&fit=crop&q=80', itemCount: 18, link: '/shop?category=Men\'s Fashion', sortOrder: 1 },
  { name: 'Evening Luxury', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop&q=80', itemCount: 12, link: '/shop?category=Jewelry', sortOrder: 2 },
]

async function seedDatabase() {
  console.log('🚀 Starting Supabase Database Seed...')

  // 1. Seed Products
  console.log(`\n📦 Seeding ${ALL_PRODUCTS.length} products...`)
  for (let i = 0; i < ALL_PRODUCTS.length; i++) {
    const p = ALL_PRODUCTS[i]
    const existing = await db.product.findFirst({ where: { name: p.name } })
    const isTrending = p.id.startsWith('trend-')
    const isNew = p.id.startsWith('new-') || Boolean(p.isNew)

    if (existing) {
      await db.product.update({
        where: { id: existing.id },
        data: {
          price: p.price,
          originalPrice: p.originalPrice || null,
          image: p.image,
          category: p.category,
          isTrending,
          trendingOrder: isTrending ? i + 1 : 0,
          isNew,
          newArrivalOrder: isNew ? i + 1 : 0,
          status: 'active',
          sizes: JSON.stringify(p.sizes || []),
          colors: JSON.stringify(p.colors || []),
        },
      })
      console.log(`  ✓ Updated product: ${p.name} (₹${p.price})`)
    } else {
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
          stock: 25,
          status: 'active',
          isFeatured: true,
          isNew,
          isTrending,
          trendingOrder: isTrending ? i + 1 : 0,
          newArrivalOrder: isNew ? i + 1 : 0,
          sizes: JSON.stringify(p.sizes || []),
          colors: JSON.stringify(p.colors || []),
        },
      })
      console.log(`  + Created product: ${p.name} (₹${p.price})`)
    }
  }

  // 2. Seed Hero Slides
  console.log('\n🖼️ Seeding Hero Slides...')
  const slideCount = await db.heroSlide.count()
  if (slideCount === 0) {
    for (const slide of DEFAULT_SLIDES) {
      await db.heroSlide.create({ data: slide })
      console.log(`  + Created slide: ${slide.title.replace('\n', ' ')}`)
    }
  } else {
    console.log(`  - Slides already exist (${slideCount} slides)`)
  }

  // 3. Seed Homepage Categories
  console.log('\n🏷️ Seeding Homepage Categories...')
  const catCount = await db.homepageCategory.count()
  if (catCount === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await db.homepageCategory.create({ data: cat })
      console.log(`  + Created category: ${cat.name}`)
    }
  } else {
    console.log(`  - Categories already exist (${catCount} categories)`)
  }

  // 4. Seed Homepage Collections
  console.log('\n✨ Seeding Homepage Collections...')
  const colCount = await db.homepageCollection.count()
  if (colCount === 0) {
    for (const col of DEFAULT_COLLECTIONS) {
      await db.homepageCollection.create({ data: col })
      console.log(`  + Created collection: ${col.name}`)
    }
  } else {
    console.log(`  - Collections already exist (${colCount} collections)`)
  }

  console.log('\n🎉 Supabase Database Seeding Completed Successfully!')
}

seedDatabase()
  .catch((err) => {
    console.error('❌ Seeding failed:', err)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
