import { getAllCategories, getAllMenuItems, getAllMainCategories } from "@/lib/dynamodb";
import LandingHero from "@/components/home/LandingHero";
import CategoryBar from "@/components/home/CategoryBar";
import ScrollText from "@/components/home/ScrollText";
import WhyChooseSection from "@/components/home/WhyChooseSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ProductGrid from "@/components/home/ProductGrid";
import PromoBanner from "@/components/home/PromoBanner";
import GalleryStrip from "@/components/home/GalleryStrip";
import StorySection from "@/components/StorySection";
import LocationHours from "@/components/LocationHours";

export default async function Home() {
  const [categories, menuItems, mainCategories] = await Promise.all([
    getAllCategories(),
    getAllMenuItems(),
    getAllMainCategories(),
  ]);
  const availableItems = menuItems.filter((item) => item.isAvailable);
  const sortedMainCategories = mainCategories.sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main>
      <LandingHero mainCategories={sortedMainCategories} />
      <ScrollText />
      <WhyChooseSection />
      <CategoryBar categories={categories} />
      <FeaturedProducts items={availableItems} />
      <ProductGrid items={availableItems} categories={categories} />
      <PromoBanner />
      <GalleryStrip />
      <StorySection />
      <LocationHours />
    </main>
  );
}
