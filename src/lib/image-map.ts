const PRODUCT_IMAGES: Record<string, string> = {
  // Soups
  "yazol-soup": "/Images/yazol-soup.jpg",
  "chicken-soup": "/Images/chicken-rice.jpg",
  "vegetable-soup": "/Images/yazol-soup.jpg",
  // Bakery & Snacks
  "ambasha": "/Images/ambasha.jpg",
  "samosas": "/Images/samosas.jpg",
  "falafel": "/Images/fried-rolls.jpg",
  "croissant": "/Images/croissant.jpg",
  "bread-roll": "/Images/bread-roll.jpg",
  "yazol-bites": "/Images/cinnamon-roll.jpg",
  "chornake": "/Images/pastry.jpg",
  // Food
  "melewa-melt": "/Images/sandwich.jpg",
  "foul": "/Images/pasta-salad.jpg",
  "erteb": "/Images/potato-salad.jpg",
  "pasta-salad": "/Images/pasta-salad.jpg",
  // Desserts
  "yazol-dessert-cup": "/Images/gallery-4.jpg",
  "yazol-sponge-cake": "/Images/sponge-cake.jpg",
  // Drinks — each gets a distinct image
  "jebena-buna": "/Images/Jebena_buna.jpg",
  "yazol-coffee": "/Images/barista.jpg",
  "regular-coffee": "/Images/coffee-station.jpg",
  "iced-coffee": "/Images/coffee-corner.jpg",
  "chai-tea": "/Images/hero-spread.jpg",
};

const FALLBACK_IMAGE = "/Images/hero-spread.jpg";

export function getProductImage(slug: string): string {
  return PRODUCT_IMAGES[slug] || FALLBACK_IMAGE;
}

export const CATEGORY_IMAGES: Record<string, string> = {
  "soups": "/Images/yazol-soup.jpg",
  "food": "/Images/hero-spread.jpg",
  "bakery-snacks": "/Images/ambasha.jpg",
  "desserts": "/Images/gallery-4.jpg",
  "drinks": "/Images/Jebena_buna.jpg",
};
