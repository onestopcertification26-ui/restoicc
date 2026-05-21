"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MenuItem, OrderItem } from "@/types";

interface CartContextType {
  tableId: string | null;
  setTableId: (id: string | null) => void;
  cartItems: OrderItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tableId, setTableIdState] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedTable = localStorage.getItem("resto_table_id");
      const storedCart = localStorage.getItem("resto_cart_items");
      
      if (storedTable) setTableIdState(storedTable);
      if (storedCart) setCartItems(JSON.parse(storedCart));
    } catch (e) {
      console.error("Failed to load local storage session:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Persist Table ID
  const setTableId = (id: string | null) => {
    setTableIdState(id);
    if (id) {
      localStorage.setItem("resto_table_id", id);
    } else {
      localStorage.removeItem("resto_table_id");
    }
  };

  // Persist Cart Items
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("resto_cart_items", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart items to local storage:", e);
    }
  }, [cartItems, isInitialized]);

  const addToCart = (item: MenuItem) => {
    if (!item._id) return;
    // Capture as a typed const so TypeScript narrows the type inside the closure
    const itemId: string = item._id;
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.menuItemId === itemId);
      if (existingItem) {
        return prevItems.map((i) =>
          i.menuItemId === itemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prevItems,
        {
          menuItemId: itemId,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.menuItemId === itemId);
      if (!existingItem) return prevItems;
      if (existingItem.quantity === 1) {
        return prevItems.filter((i) => i.menuItemId !== itemId);
      }
      return prevItems.map((i) =>
        i.menuItemId === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("resto_cart_items");
  };

  const toggleCart = () => setCartOpen((prev) => !prev);

  // Financial Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.1);           // 10% Government Tax
  const serviceCharge = Math.round(subtotal * 0.05); // 5% Service Charge
  const total = subtotal + tax + serviceCharge;
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        tableId,
        setTableId,
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isCartOpen,
        setCartOpen,
        toggleCart,
        subtotal,
        tax,
        serviceCharge,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
