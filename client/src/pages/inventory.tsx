import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Product } from "@shared/schema";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "Product has been removed from inventory",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "beverages", label: "Beverages" },
    { value: "snacks", label: "Snacks" },
    { value: "electronics", label: "Electronics" },
    { value: "household", label: "Household" },
    { value: "other", label: "Other" },
  ];

  const stockStatuses = [
    { value: "all", label: "All" },
    { value: "in_stock", label: "In Stock" },
    { value: "low_stock", label: "Low Stock" },
    { value: "out_of_stock", label: "Out of Stock" },
  ];

  const filteredProducts = products?.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === "in_stock") {
      matchesStock = product.stock > product.minStock;
    } else if (stockFilter === "low_stock") {
      matchesStock = product.stock <= product.minStock && product.stock > 0;
    } else if (stockFilter === "out_of_stock") {
      matchesStock = product.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  }) || [];

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return { label: "Out of Stock", variant: "destructive" as const };
    } else if (product.stock <= product.minStock) {
      return { label: "Low Stock", variant: "secondary" as const };
    } else {
      return { label: "In Stock", variant: "default" as const };
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  const canManageProducts = user?.role === "admin";

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Inventory Management</h1>
            <p className="text-gray-600">Manage your product catalog and stock levels</p>
          </div>
          {canManageProducts && (
            <Button className="bg-primary-600 hover:bg-primary-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                type="text"
                placeholder="Product name or SKU"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                {stockStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setStockFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {canManageProducts && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product: Product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : (
                                <span className="text-xs text-gray-400">IMG</span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {product.category?.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₵ {Number(product.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                        </td>
                        {canManageProducts && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={canManageProducts ? 7 : 6} className="px-6 py-12 text-center">
                      <p className="text-gray-500">No products found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
