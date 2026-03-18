"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from "react";
import type { MenuItem, CartItem, CartState, CartAction } from "./types";

/** Generate a unique cart key for an item based on its slug + size + options */
export function generateCartKey(
  slug: string,
  sizeName?: string,
  selectedOptions?: Record<string, { name: string }[]>
): string {
  let key = slug;
  if (sizeName) key += `__${sizeName}`;
  if (selectedOptions) {
    const optStr = Object.entries(selectedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, opts]) => `${group}:${opts.map((o) => o.name).sort().join(",")}`)
      .join("|");
    if (optStr) key += `__${optStr}`;
  }
  return key;
}

/** Get the effective price for a cart item (size price + option add-ons) */
export function getCartItemPrice(item: CartItem): number {
  let price = item.selection?.selectedSize?.price ?? item.menuItem.price;
  if (item.selection?.selectedOptions) {
    for (const opts of Object.values(item.selection.selectedOptions)) {
      for (const opt of opts) {
        price += opt.priceAdd;
      }
    }
  }
  return price;
}

/** Format selection summary for display (e.g., "Medium · Oat Milk · Extra Shot") */
export function formatSelectionSummary(item: CartItem): string {
  const parts: string[] = [];
  if (item.selection?.selectedSize) {
    parts.push(item.selection.selectedSize.name);
  }
  if (item.selection?.selectedOptions) {
    for (const opts of Object.values(item.selection.selectedOptions)) {
      for (const opt of opts) {
        parts.push(opt.name);
      }
    }
  }
  return parts.join(" · ");
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      // Simple add (no customization) — use slug as cartKey
      const cartKey = action.payload.slug;
      const existing = state.items.find((i) => i.cartKey === cartKey);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { menuItem: action.payload, quantity: 1, allergyNotes: "", cartKey }],
      };
    }
    case "ADD_CUSTOM_ITEM": {
      const existing = state.items.find((i) => i.cartKey === action.payload.cartKey);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.cartKey === action.payload.cartKey
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.cartKey !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.cartKey !== action.payload.cartKey),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.cartKey === action.payload.cartKey
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    }
    case "UPDATE_ALLERGY_NOTES": {
      return {
        ...state,
        items: state.items.map((i) =>
          i.cartKey === action.payload.cartKey
            ? { ...i, allergyNotes: action.payload.allergyNotes }
            : i
        ),
      };
    }
    case "LOAD_CART":
      return { ...state, items: action.payload };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

const initialState: CartState = { items: [], isOpen: false };

interface CartContextValue {
  state: CartState;
  addItem: (item: MenuItem) => void;
  addCustomItem: (item: CartItem) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  updateAllergyNotes: (cartKey: string, allergyNotes: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const hydrated = useRef(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yazol-cart");
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        // Ensure cartKey exists on loaded items (backward compat)
        const items = parsed.map((item) => ({
          ...item,
          allergyNotes: item.allergyNotes || "",
          cartKey: item.cartKey || item.menuItem.slug,
        }));
        dispatch({ type: "LOAD_CART", payload: items });
      }
    } catch {}
    hydrated.current = true;
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem("yazol-cart", JSON.stringify(state.items));
  }, [state.items]);

  const addItem = useCallback(
    (item: MenuItem) => dispatch({ type: "ADD_ITEM", payload: item }),
    []
  );
  const addCustomItem = useCallback(
    (item: CartItem) => dispatch({ type: "ADD_CUSTOM_ITEM", payload: item }),
    []
  );
  const removeItem = useCallback(
    (cartKey: string) => dispatch({ type: "REMOVE_ITEM", payload: cartKey }),
    []
  );
  const updateQuantity = useCallback(
    (cartKey: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", payload: { cartKey, quantity } }),
    []
  );
  const updateAllergyNotes = useCallback(
    (cartKey: string, allergyNotes: string) =>
      dispatch({ type: "UPDATE_ALLERGY_NOTES", payload: { cartKey, allergyNotes } }),
    []
  );
  const clearCart = useCallback(
    () => dispatch({ type: "CLEAR_CART" }),
    []
  );
  const toggleCart = useCallback(
    () => dispatch({ type: "TOGGLE_CART" }),
    []
  );
  const openCart = useCallback(
    () => dispatch({ type: "OPEN_CART" }),
    []
  );
  const closeCart = useCallback(
    () => dispatch({ type: "CLOSE_CART" }),
    []
  );

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + getCartItemPrice(i) * i.quantity,
    0
  );
  const tax = subtotal * 0.13;
  const total = subtotal + tax;

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        addCustomItem,
        removeItem,
        updateQuantity,
        updateAllergyNotes,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        itemCount,
        subtotal,
        tax,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
