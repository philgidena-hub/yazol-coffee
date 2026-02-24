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

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  allergyNotes: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: MenuItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { slug: string; quantity: number } }
  | { type: "UPDATE_ALLERGY_NOTES"; payload: { slug: string; allergyNotes: string } }
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
  }>;
  subtotal: number;
  tax: number;
  total: number;
  pickupTime: string;
  specialInstructions: string;
  status: "pending" | "approved" | "preparing" | "prepared" | "completed" | "cancelled";
  paymentMethod?: "online" | "pay_at_pickup";
  createdAt: string;
  updatedAt: string;
}

// ── User Roles ──────────────────────────────────────────────

export type UserRole = "super_admin" | "admin" | "cashier" | "chef";

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
