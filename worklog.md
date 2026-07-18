---
Task ID: 1
Agent: main
Task: Add Trending Now admin management with photo edit, reorder, add, delete

Work Log:
- Added `isTrending` (Boolean) and `trendingOrder` (Int) fields to Product model in Prisma schema
- Ran `prisma db push` to sync schema with SQLite database
- Created `/api/admin/trending` route (GET/PUT/PATCH/DELETE) for trending CRUD operations
- Created `/api/trending` public route for storefront to fetch trending products
- Built `AdminTrending` component with:
  - Drag-and-drop reorder via Framer Motion Reorder
  - Add products from catalog modal with search
  - Edit modal with image URL, preview, name, description, price, category, rating
  - Delete (remove from trending) with confirmation dialog
  - Full image preview overlay
  - Order position badges (#1, #2, etc.)
  - Stock status color coding
  - Skeleton loading states
- Added "Trending" tab with TrendingUp icon to admin sidebar (between Products and Orders)
- Added trending route in page.tsx admin section
- Updated `TrendingProducts` component in sections.tsx to fetch from `/api/trending` with fallback data
- Seeded all 8 existing trending products into DB with `isTrending: true` and correct INR prices
- All builds pass cleanly

Stage Summary:
- New files: admin-trending.tsx, /api/admin/trending/route.ts, /api/trending/route.ts, scripts/seed-trending.ts
- Modified files: schema.prisma, admin-sidebar.tsx, page.tsx, sections.tsx
- 8 trending products seeded in DB with isTrending=true and trendingOrder 0-7
- Build: ✓ passes