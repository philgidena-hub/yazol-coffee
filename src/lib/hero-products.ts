import type { ThemeKey } from "./theme-context";

export interface HeroProduct {
  slug: string;
  name: string;
  tagline: string;
  categorySlug: ThemeKey;
  image: string;
}

export const HERO_PRODUCTS: HeroProduct[] = [
  {
    slug: "jebena-buna",
    name: "Jebena Buna",
    tagline: "Ethiopian ceremony, brewed fresh for you",
    categorySlug: "drinks",
    image: "/Images/Jebena_buna.jpg",
  },
  {
    slug: "yazol-soup",
    name: "Yazol Soup",
    tagline: "Warm, hearty, and made with love",
    categorySlug: "soups",
    image: "/Images/yazol-soup.jpg",
  },
  {
    slug: "ambasha",
    name: "Ambasha",
    tagline: "Traditional bread, passed down through generations",
    categorySlug: "bakery-snacks",
    image: "/Images/ambasha.jpg",
  },
  {
    slug: "yazol-dessert-cup",
    name: "Yazol Dessert Cup",
    tagline: "A sweet taste of East African delight",
    categorySlug: "desserts",
    image: "/Images/dessert-1.jpg",
  },
  {
    slug: "foul",
    name: "Foul",
    tagline: "Rich, savory, and packed with flavor",
    categorySlug: "food",
    image: "/Images/food-1.jpg",
  },
];
