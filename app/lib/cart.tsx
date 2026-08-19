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
import { supabase } from "./supabase";

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
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;

      const signedIn = Boolean(session?.user);
      setIsSignedIn(signedIn);

      // Guest: cart hanya di memori (tidak dipersist) → hilang saat refresh.
      // Login: restore cart dari localStorage.
      if (!signedIn) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // abaikan
        }
        setItems([]);
      } else {
        let restored: CartItem[] = [];
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          restored = raw ? (JSON.parse(raw) as CartItem[]) : [];
        } catch {
          // abaikan
        }
        setItems(restored);
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const signedIn = Boolean(session?.user);
      setIsSignedIn(signedIn);
      if (!signedIn) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // abaikan
        }
        setItems([]);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage penuh / private mode — abaikan
    }
  }, [items, isSignedIn]);

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