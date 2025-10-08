import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Pause, Trash2, User, Minus, Plus, CreditCard, Smartphone, Banknote } from "lucide-react";
import type { CartItem } from "@/hooks/use-cart";

interface CartSidebarProps {
  cart: {
    items: CartItem[];
    customerName: string;
    setCustomerName: (name: string) => void;
    paymentMethod: "cash" | "card" | "mobile_money";
    setPaymentMethod: (method: "cash" | "card" | "mobile_money") => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;
    subtotal: number;
    tax: number;
    total: number;
  };
}

export default function CartSidebar({ cart }: CartSidebarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const paymentMethods = [
    { id: "cash", name: "Cash", icon: Banknote },
    { id: "card", name: "Card", icon: CreditCard },
    { id: "mobile_money", name: "MoMo", icon: Smartphone },
  ];

  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      if (cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      const transactionData = {
        customerName: cart.customerName,
        subtotal: cart.subtotal,
        tax: cart.tax,
        total: cart.total,
        paymentMethod: cart.paymentMethod,
        attendantId: user?.id,
        items: cart.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      };

      const response = await apiRequest("POST", "/api/transactions", transactionData);
      return response.json();
    },
    onSuccess: (transaction) => {
      toast({
        title: "Sale completed!",
        description: `Transaction ${transaction.receiptNumber} processed successfully`,
      });
      cart.clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const handleProcessPayment = () => {
    setIsProcessing(true);
    processPaymentMutation.mutate();
    setTimeout(() => setIsProcessing(false), 1000);
  };

  return (
    <Card className="w-96 border-l border-gray-200 flex flex-col h-full rounded-none">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Current Sale</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Pause className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={cart.clearCart}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Customer name (optional)"
            value={cart.customerName}
            onChange={(e) => cart.setCustomerName(e.target.value)}
            className="text-sm"
          />
          <div className="flex items-center text-sm text-gray-500">
            <User className="mr-2 h-4 w-4" />
            Attendant: <span className="ml-1 font-medium">
              {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {cart.items.length > 0 ? (
            cart.items.map((item) => (
              <div key={item.product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="text-xs text-gray-400">IMG</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-gray-500">₵ {item.unitPrice.toFixed(2)} each</p>
                  <div className="flex items-center mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 p-0"
                      onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="mx-2 text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 p-0"
                      onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ₵ {item.total.toFixed(2)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 h-auto p-0 text-xs"
                    onClick={() => cart.removeItem(item.product.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No items in cart</p>
            </div>
          )}
        </div>
      </CardContent>

      <div className="p-6 border-t border-gray-200 space-y-4">
        {/* Discount placeholder */}
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Discount code"
            className="flex-1 text-sm"
          />
          <Button variant="outline" size="sm">
            Apply
          </Button>
        </div>

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₵ {cart.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (12.5%):</span>
            <span className="font-medium">₵ {cart.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>₵ {cart.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((method) => (
              <Button
                key={method.id}
                variant={cart.paymentMethod === method.id ? "default" : "outline"}
                size="sm"
                className={`p-3 ${cart.paymentMethod === method.id ? "bg-primary-600" : ""}`}
                onClick={() => cart.setPaymentMethod(method.id as any)}
              >
                <div className="text-center">
                  <method.icon className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-xs">{method.name}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Checkout Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleProcessPayment}
            disabled={cart.items.length === 0 || isProcessing || processPaymentMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isProcessing || processPaymentMutation.isPending ? "Processing..." : "Complete Sale"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // Hold cart functionality - in a real app, this would save the cart
              toast({
                title: "Cart held",
                description: "Cart has been saved for later",
              });
            }}
          >
            Hold Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}
