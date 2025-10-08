import { useState, useCallback } from "react";
import type { Product } from "@shared/schema";

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile_money">("cash");

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total: (item.quantity + quantity) * item.unitPrice
              }
            : item
        );
      }

      const unitPrice = Number(product.price);
      return [...prevItems, {
        product,
        quantity,
        unitPrice,
        total: quantity * unitPrice
      }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              total: quantity * item.unitPrice
            }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCustomerName("");
    setPaymentMethod("cash");
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.125; // 12.5% tax rate
  const total = subtotal + tax;

  return {
    items,
    customerName,
    setCustomerName,
    paymentMethod,
    setPaymentMethod,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    tax,
    total,
    itemCount: items.length,
  };
}
