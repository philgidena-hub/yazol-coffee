"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from "react";
import type { MenuItem, CartItem, CartState, CartAction } from "./types";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.menuItem.slug === action.payload.slug
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.menuItem.slug === action.payload.slug
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { menuItem: action.payload, quantity: 1, allergyNotes: "" }],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.menuItem.slug !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => i.menuItem.slug !== action.payload.slug
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.menuItem.slug === action.payload.slug
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    }
    case "UPDATE_ALLERGY_NOTES": {
      return {
        ...state,
        items: state.items.map((i) =>
          i.menuItem.slug === action.payload.slug
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
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  updateAllergyNotes: (slug: string, allergyNotes: string) => void;
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
        const items = parsed.map((item) => ({
          ...item,
          allergyNotes: item.allergyNotes || "",
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
  const removeItem = useCallback(
    (slug: string) => dispatch({ type: "REMOVE_ITEM", payload: slug }),
    []
  );
  const updateQuantity = useCallback(
    (slug: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", payload: { slug, quantity } }),
    []
  );
  const updateAllergyNotes = useCallback(
    (slug: string, allergyNotes: string) =>
      dispatch({ type: "UPDATE_ALLERGY_NOTES", payload: { slug, allergyNotes } }),
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
    (sum, i) => sum + i.menuItem.price * i.quantity,
    0
  );
  const tax = subtotal * 0.13;
  const total = subtotal + tax;

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
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
