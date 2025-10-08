import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Barcode, Search } from "lucide-react";
import type { Product } from "@shared/schema";
import type { CartItem } from "@/hooks/use-cart";

interface ProductGridProps {
  cart: {
    addItem: (product: Product, quantity?: number) => void;
  };
}

export default function ProductGrid({ cart }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const categories = [
    { id: "all", name: "All" },
    { id: "beverages", name: "Beverages" },
    { id: "snacks", name: "Snacks" },
    { id: "electronics", name: "Electronics" },
    { id: "household", name: "Household" },
  ];

  const filteredProducts = products?.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleBarcodeScanner = () => {
    // Mock barcode scanning - in a real app, this would integrate with a barcode scanner
    const mockBarcode = prompt("Enter barcode:");
    if (mockBarcode) {
      // In real implementation, this would scan for the product by barcode
      console.log("Scanning barcode:", mockBarcode);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <div className="flex items-center space-x-4">
            <Button onClick={handleBarcodeScanner} className="bg-primary-600 hover:bg-primary-700">
              <Barcode className="mr-2 h-4 w-4" />
              Scan Barcode
            </Button>
            
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id ? "bg-primary-600" : ""}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product: Product) => (
            <Card
              key={product.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => cart.addItem(product)}
            >
              <CardContent className="p-4">
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    ₵ {Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {product.stock} left
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
