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
    slug: "yazol-coffee",
    name: "Yazol's Coffee",
    tagline:
      "Ethiopian ceremony coffee, brewed fresh with tradition in every cup.",
    categorySlug: "bakery-snacks",
    image: "/Yazol_coffee.png",
  },
  {
    slug: "yazol-coffee-2",
    name: "Yazol's To-Go",
    tagline:
      "Premium takeaway coffee. The same rich taste, wherever you go.",
    categorySlug: "drinks",
    image: "/Yazol_coffee_2.png",
  },
  {
    slug: "yazol-icecream",
    name: "Yazol's Ice Cream",
    tagline:
      "Swedish Apple Pie — a sweet taste of East African delight.",
    categorySlug: "desserts",
    image: "/Yazol_icecream.png",
  },
];
