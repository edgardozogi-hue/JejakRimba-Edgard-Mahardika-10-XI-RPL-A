"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  equipmentId: string;
  name: string;
  category: string;
  pricePerDay: number;
  stock: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalPerDay: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (equipmentId: string) => void;
  setQuantity: (equipmentId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "jejak-rimba-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage penuh / private mode — abaikan
    }
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.equipmentId === item.equipmentId);
      if (existing) {
        return prev.map((i) =>
          i.equipmentId === item.equipmentId
            ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((equipmentId: string) => {
    setItems((prev) => prev.filter((i) => i.equipmentId !== equipmentId));
  }, []);

  const setQuantity = useCallback(
    (equipmentId: string, quantity: number) => {
      setItems((prev) =>
        prev.map((i) =>
          i.equipmentId === equipmentId
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
            : i
        )
      );
    },
    []
  );

  const clear = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  const totalPerDay = useMemo(
    () => items.reduce((sum, i) => sum + i.pricePerDay * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, itemCount, totalPerDay, addItem, removeItem, setQuantity, clear }),
    [items, itemCount, totalPerDay, addItem, removeItem, setQuantity, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}