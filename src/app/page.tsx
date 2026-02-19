import { getAllCategories, getAllMenuItems } from "@/lib/dynamodb";
import HeroSection from "@/components/home/HeroSection";
import CategoryBar from "@/components/home/CategoryBar";
import ScrollText from "@/components/home/ScrollText";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ProductGrid from "@/components/home/ProductGrid";
import PromoBanner from "@/components/home/PromoBanner";
import StorySection from "@/components/StorySection";
import LocationHours from "@/components/LocationHours";

export default async function Home() {
  const [categories, menuItems] = await Promise.all([
    getAllCategories(),
    getAllMenuItems(),
  ]);
  const availableItems = menuItems.filter((item) => item.isAvailable);

  return (
    <main>
      <HeroSection />
      <ScrollText />
      <CategoryBar categories={categories} />
      <FeaturedProducts items={availableItems} />
      <ProductGrid items={availableItems} categories={categories} />
      <PromoBanner />
      <StorySection />
      <LocationHours />
    </main>
  );
}
