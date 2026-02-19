import { getAllCategories, getAllMenuItems } from "@/lib/dynamodb";
import HeroSection from "@/components/home/HeroSection";
import CategoryBar from "@/components/home/CategoryBar";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ProductGrid from "@/components/home/ProductGrid";
import PromoBanner from "@/components/home/PromoBanner";
import StorySection from "@/components/StorySection";
import LocationHours from "@/components/LocationHours";
import Marquee from "@/components/ui/Marquee";

export default async function Home() {
  const [categories, menuItems] = await Promise.all([
    getAllCategories(),
    getAllMenuItems(),
  ]);
  const availableItems = menuItems.filter((item) => item.isAvailable);

  return (
    <main>
      <HeroSection />
      <CategoryBar categories={categories} />
      <FeaturedProducts items={availableItems} />
      <Marquee>Coffee &middot; Soups &middot; Food &middot; Bakery &middot; Desserts</Marquee>
      <ProductGrid items={availableItems} categories={categories} />
      <PromoBanner />
      <Marquee reverse>Taste the Tradition &middot; Made with Love &middot; East African Inspired</Marquee>
      <StorySection />
      <LocationHours />
    </main>
  );
}
