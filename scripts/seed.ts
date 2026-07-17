import { db } from '@/lib/db'

const productImages = [
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
  'https://images.unsplash.com/photo-1434389677669-e08b4cda3a0a?w=400&q=80',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80',
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80',
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&q=80',
]

const products = [
  { name: 'Silk Blend Blazer', price: 489, originalPrice: 699, category: "Women's Fashion", rating: 4.8, reviewCount: 124, stock: 45, isFeatured: true, isNew: false },
  { name: 'Cashmere Sweater', price: 329, category: "Women's Fashion", rating: 4.9, reviewCount: 89, stock: 32, isFeatured: true, isNew: true },
  { name: 'Leather Tote Bag', price: 599, category: 'Accessories', rating: 4.7, reviewCount: 156, stock: 28, isFeatured: true, isNew: false },
  { name: 'Minimal Watch', price: 249, originalPrice: 349, category: 'Accessories', rating: 4.6, reviewCount: 203, stock: 67, isFeatured: false, isNew: false },
  { name: 'Linen Shirt', price: 189, category: "Men's Fashion", rating: 4.8, reviewCount: 67, stock: 89, isFeatured: false, isNew: true },
  { name: 'Designer Sunglasses', price: 279, category: 'Accessories', rating: 4.5, reviewCount: 142, stock: 54, isFeatured: false, isNew: false },
  { name: 'Suede Ankle Boots', price: 449, category: 'Footwear', rating: 4.7, reviewCount: 98, stock: 23, isFeatured: false, isNew: true },
  { name: 'Gold Chain Necklace', price: 199, category: 'Jewelry', rating: 4.9, reviewCount: 211, stock: 76, isFeatured: false, isNew: false },
  { name: 'Oversized Coat', price: 589, category: "Women's Fashion", rating: 4.8, reviewCount: 34, stock: 18, isFeatured: true, isNew: true },
  { name: 'Silk Scarf', price: 149, category: 'Accessories', rating: 4.9, reviewCount: 12, stock: 95, isFeatured: false, isNew: true },
  { name: 'Wool Trousers', price: 269, category: "Men's Fashion", rating: 4.7, reviewCount: 28, stock: 41, isFeatured: false, isNew: true },
  { name: 'Canvas Sneakers', price: 199, category: 'Footwear', rating: 4.6, reviewCount: 45, stock: 63, isFeatured: false, isNew: true },
]

const customerNames = [
  'Sarah Mitchell', 'James Chen', 'Emma Rodriguez', 'David Kim', 'Olivia Thompson',
  'Lucas Wright', 'Sophia Patel', 'Ethan Brooks', 'Isabella Garcia', 'Mason Taylor',
  'Ava Johnson', 'Liam Anderson', 'Mia Williams', 'Noah Brown', 'Charlotte Davis'
]

const cities = ['New York', 'London', 'Paris', 'Tokyo', 'Dubai', 'Milan', 'Sydney', 'Berlin', 'Toronto', 'Singapore']
const countries = ['USA', 'UK', 'France', 'Japan', 'UAE', 'Italy', 'Australia', 'Germany', 'Canada', 'Singapore']
const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

async function seed() {
  console.log('Seeding database...')

  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    await db.product.create({
      data: {
        name: p.name,
        description: `Premium quality ${p.name.toLowerCase()} crafted with the finest materials.`,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        image: productImages[i % productImages.length],
        category: p.category,
        rating: p.rating,
        reviewCount: p.reviewCount,
        stock: p.stock,
        isFeatured: p.isFeatured,
        isNew: p.isNew,
      }
    })
  }
  console.log(`Seeded ${products.length} products`)

  const customerIds: string[] = []
  for (let i = 0; i < customerNames.length; i++) {
    const c = await db.customer.create({
      data: {
        name: customerNames[i],
        email: `${customerNames[i].toLowerCase().replace(' ', '.')}@email.com`,
        phone: `+1 555-${String(1000 + i * 111).padStart(4, '0')}`,
        city: cities[i % cities.length],
        country: countries[i % countries.length],
        totalSpent: Math.round((200 + Math.random() * 3000) * 100) / 100,
        orderCount: Math.floor(1 + Math.random() * 12),
      }
    })
    customerIds.push(c.id)
  }
  console.log(`Seeded ${customerIds.length} customers`)

  const allProducts = await db.product.findMany()
  for (let i = 0; i < 25; i++) {
    const customer = customerIds[i % customerIds.length]
    const numItems = 1 + Math.floor(Math.random() * 3)
    const orderItemsData: { productId: string; productName: string; productImage: string; price: number; quantity: number; size: string; color: string }[] = []
    let subtotal = 0

    for (let j = 0; j < numItems; j++) {
      const prod = allProducts[Math.floor(Math.random() * allProducts.length)]
      const qty = 1 + Math.floor(Math.random() * 2)
      const sizes = ['XS', 'S', 'M', 'L', 'XL']
      const colors = ['Black', 'Ivory', 'Navy', 'Burgundy']
      orderItemsData.push({
        productId: prod.id,
        productName: prod.name,
        productImage: prod.image,
        price: prod.price,
        quantity: qty,
        size: sizes[Math.floor(Math.random() * sizes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
      })
      subtotal += prod.price * qty
    }

    const shipping = subtotal > 200 ? 0 : 15
    const tax = Math.round(subtotal * 0.08 * 100) / 100
    const total = subtotal + shipping + tax
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))

    await db.order.create({
      data: {
        orderNumber: `MSN-${String(10000 + i).padStart(5, '0')}`,
        customerId: customer,
        status,
        total: Math.round(total * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        shipping,
        tax,
        address: `${100 + i * 7} Luxury Avenue`,
        city: cities[i % cities.length],
        country: countries[i % countries.length],
        createdAt: date,
        items: { create: orderItemsData },
      }
    })
  }
  console.log('Seeded 25 orders')
  console.log('Seed complete!')
}

seed()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => process.exit(0))