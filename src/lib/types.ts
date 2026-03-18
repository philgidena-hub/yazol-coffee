export interface MenuItemSize {
  name: string;       // "Small", "Medium", "Large"
  price: number;      // Price for this size (replaces base price)
}

export interface MenuItemOption {
  name: string;       // "Almond", "Oat Milk"
  priceAdd: number;   // Additional cost (0 if free)
}

export interface MenuItemOptionGroup {
  name: string;       // "Milk Option", "Iced", "Hot"
  required: boolean;  // Must choose at least one?
  maxChoices: number; // 1 = radio, >1 = checkboxes
  options: MenuItemOption[];
}

export interface MenuItem {
  PK: string;
  SK: string;
  entityType: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  isAvailable: boolean;
  imageKey: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  // Sizes & customization (optional — not all items have them)
  sizes?: MenuItemSize[];
  optionGroups?: MenuItemOptionGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  PK: string;
  SK: string;
  entityType: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemSelection {
  selectedSize?: MenuItemSize;
  selectedOptions?: Record<string, MenuItemOption[]>; // groupName → selected options
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  allergyNotes: string;
  selection?: CartItemSelection;
  /** Unique key for cart (slug + size + options hash) */
  cartKey: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: MenuItem }
  | { type: "ADD_CUSTOM_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { cartKey: string; quantity: number } }
  | { type: "UPDATE_ALLERGY_NOTES"; payload: { cartKey: string; allergyNotes: string } }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

export interface Order {
  PK: string;
  SK: string;
  entityType: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: Array<{
    slug: string;
    name: string;
    price: number;
    quantity: number;
    allergyNotes: string;
    size?: string;
    options?: string[];
  }>;
  subtotal: number;
  tax: number;
  total: number;
  pickupTime: string;
  specialInstructions: string;
  status: "pending" | "approved" | "preparing" | "prepared" | "completed" | "cancelled";
  paymentMethod?: "online" | "pay_at_pickup";
  paymentStatus?: "unpaid" | "paid";
  stripeSessionId?: string;
  createdAt: string;
  updatedAt: string;
}

// ── User Roles ──────────────────────────────────────────────

export type UserRole = "super_admin" | "admin" | "cashier" | "barista" | "chef" | "customer";

export interface User {
  PK: string;
  SK: string;
  entityType: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<User, "passwordHash" | "PK" | "SK" | "entityType">;

export interface Customer {
  PK: string;
  SK: string;
  entityType: string;
  customerId: string;
  email: string;
  name: string;
  phoneNumber: string;
  favoriteCoffee?: string;
  role: "customer";
  image?: string;
  provider: "google" | "email" | "guest";
  onboardingComplete: boolean;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  PK: string; // "SETTINGS#site"
  SK: string; // "METADATA"
  entityType: string;
  // Company Profile
  companyName: string;
  tagline: string;
  description: string;
  // Contact
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  // Social
  instagram: string;
  tiktok: string;
  facebook: string;
  // Hours — keyed by day number (0=Sunday, 6=Saturday)
  shopHours: Record<string, { open: number; close: number; closed: boolean }>;
  // Branding
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  // Meta
  updatedAt: string;
  updatedBy: string;
}
