const PRODUCT_IMAGES: Record<string, string> = {
  "yazol-soup": "/Images/yazol-soup.jpg",
  "ambasha": "/Images/ambasha.jpg",
  "samosas": "/Images/samosas.jpg",
  "chicken-soup": "/Images/chicken-rice.jpg",
  "vegetable-soup": "/Images/food-2.jpg",
  "jebena-buna": "/Images/Jebena_buna.jpg",
  "chai-tea": "/Images/coffee-2.jpg",
  "falafel": "/Images/fried-rolls.jpg",
  "iced-coffee": "/Images/coffee-corner.jpg",
  "yazol-coffee": "/Images/coffee-station.jpg",
  "regular-coffee": "/Images/coffee-2.jpg",
  "yazol-dessert-cup": "/Images/dessert-1.jpg",
  "yazol-sponge-cake": "/Images/sponge-cake.jpg",
  "melewa-melt": "/Images/sandwich.jpg",
  "foul": "/Images/food-1.jpg",
  "erteb": "/Images/potato-salad.jpg",
  "chornake": "/Images/pastry.jpg",
  "yazol-bites": "/Images/cinnamon-roll.jpg",
  "croissant": "/Images/croissant.jpg",
  "bread-roll": "/Images/bread-roll.jpg",
  "pasta-salad": "/Images/pasta-salad.jpg",
};

const FALLBACK_IMAGE = "/Images/hero-spread.jpg";

export function getProductImage(slug: string): string {
  return PRODUCT_IMAGES[slug] || FALLBACK_IMAGE;
}

export const CATEGORY_IMAGES: Record<string, string> = {
  "soups": "/Images/yazol-soup.jpg",
  "food": "/Images/hero-spread.jpg",
  "bakery-snacks": "/Images/ambasha.jpg",
  "desserts": "/Images/dessert-1.jpg",
  "drinks": "/Images/coffee-1.jpg",
};
