import { CategoriesSection, FeaturedCollections, TrendingProducts, NewArrivals } from '@/components/sections';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <CategoriesSection />
      <FeaturedCollections />
      <TrendingProducts />
      <NewArrivals />
    </main>
  );
}