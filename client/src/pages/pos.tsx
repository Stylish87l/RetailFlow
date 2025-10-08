import { useState } from "react";
import ProductGrid from "@/components/pos/product-grid";
import CartSidebar from "@/components/pos/cart-sidebar";
import { useCart } from "@/hooks/use-cart";

export default function POS() {
  const cart = useCart();

  return (
    <div className="flex h-screen bg-gray-50">
      <ProductGrid cart={cart} />
      <CartSidebar cart={cart} />
    </div>
  );
}
