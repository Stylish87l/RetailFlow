import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Search, AlertTriangle } from "lucide-react";
import type { Transaction } from "@shared/schema";

export default function Returns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnReason, setReturnReason] = useState("");
  const [returnType, setReturnType] = useState<"partial" | "full">("partial");
  const [notes, setNotes] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: returns, isLoading: returnsLoading } = useQuery({
    queryKey: ["/api/returns"],
  });

  const processReturnMutation = useMutation({
    mutationFn: async (returnData: any) => {
      const response = await apiRequest("POST", "/api/returns", returnData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Return processed",
        description: "Return has been processed successfully",
      });
      setSelectedTransaction(null);
      setSelectedItems([]);
      setReturnReason("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/returns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error) => {
      toast({
        title: "Return failed",
        description: error instanceof Error ? error.message : "Failed to process return",
        variant: "destructive",
      });
    },
  });

  const searchTransaction = () => {
    if (!searchTerm && !receiptNumber) {
      toast({
        title: "Search required",
        description: "Please enter a transaction ID or receipt number",
        variant: "destructive",
      });
      return;
    }

    const transaction = transactions?.find((t: Transaction) => 
      t.id === searchTerm || 
      t.receiptNumber === receiptNumber ||
      t.id.includes(searchTerm)
    );

    if (transaction) {
      setSelectedTransaction(transaction);
      toast({
        title: "Transaction found",
        description: `Transaction ${transaction.receiptNumber || transaction.id.slice(-6)} loaded`,
      });
    } else {
      toast({
        title: "Transaction not found",
        description: "No transaction found with the provided details",
        variant: "destructive",
      });
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const calculateReturnAmount = () => {
    if (!selectedTransaction) return 0;
    
    if (returnType === "full") {
      return Number(selectedTransaction.total);
    }
    
    // For partial returns, calculate based on selected items
    // This is a simplified calculation - in a real app, you'd need item details
    return selectedItems.length > 0 ? Number(selectedTransaction.total) * 0.3 : 0;
  };

  const handleProcessReturn = () => {
    if (!selectedTransaction) {
      toast({
        title: "No transaction selected",
        description: "Please search and select a transaction first",
        variant: "destructive",
      });
      return;
    }

    if (!returnReason) {
      toast({
        title: "Return reason required",
        description: "Please select a reason for the return",
        variant: "destructive",
      });
      return;
    }

    if (returnType === "partial" && selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to return for partial return",
        variant: "destructive",
      });
      return;
    }

    const returnData = {
      transactionId: selectedTransaction.id,
      reason: returnReason,
      refundAmount: calculateReturnAmount(),
      refundMethod: selectedTransaction.paymentMethod,
      notes,
    };

    processReturnMutation.mutate(returnData);
  };

  const returnReasons = [
    { value: "", label: "Select reason" },
    { value: "defective_product", label: "Defective product" },
    { value: "wrong_item", label: "Wrong item" },
    { value: "customer_changed_mind", label: "Customer changed mind" },
    { value: "damaged_in_transit", label: "Damaged in transit" },
    { value: "other", label: "Other" },
  ];

  // Check if user has permission to process returns
  const canProcessReturns = user?.role === "admin" || user?.role === "cashier";

  if (!canProcessReturns) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the returns module.</p>
        </div>
      </div>
    );
  }

  if (transactionsLoading || returnsLoading) {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Returns & Refunds</h1>
        <p className="text-gray-600">Process customer returns and manage refunds</p>
      </div>

      {/* Return Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
              <Input
                type="text"
                placeholder="Enter transaction ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
              <Input
                type="text"
                placeholder="Enter receipt number"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchTransaction} className="w-full bg-primary-600 hover:bg-primary-700">
                <Search className="mr-2 h-4 w-4" />
                Search Transaction
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details */}
      {selectedTransaction && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium font-mono">#{selectedTransaction.id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receipt Number:</span>
                    <span className="font-medium">{selectedTransaction.receiptNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(selectedTransaction.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{selectedTransaction.customerName || "Walk-in Customer"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize">
                      {selectedTransaction.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg">₵ {Number(selectedTransaction.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={selectedTransaction.status === "completed" ? "default" : "secondary"}>
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Mock Items List - In real app, this would come from transaction items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Items Purchased</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedItems.includes("item1")}
                        onChange={() => toggleItemSelection("item1")}
                      />
                      <span className="text-sm">Sample Product × 2</span>
                    </div>
                    <span className="text-sm font-medium">₵ {(Number(selectedTransaction.total) * 0.4).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedItems.includes("item2")}
                        onChange={() => toggleItemSelection("item2")}
                      />
                      <span className="text-sm">Another Product × 1</span>
                    </div>
                    <span className="text-sm font-medium">₵ {(Number(selectedTransaction.total) * 0.6).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Return Processing */}
      {selectedTransaction && (
        <Card>
          <CardHeader>
            <CardTitle>Process Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Return Reason</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                    >
                      {returnReasons.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Return Type</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="returnType"
                          value="partial"
                          checked={returnType === "partial"}
                          onChange={(e) => setReturnType(e.target.value as "partial")}
                          className="mr-2"
                        />
                        <span className="text-sm">Partial Return (selected items)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="returnType"
                          value="full"
                          checked={returnType === "full"}
                          onChange={(e) => setReturnType(e.target.value as "full")}
                          className="mr-2"
                        />
                        <span className="text-sm">Full Transaction Return</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <Textarea
                      rows={3}
                      placeholder="Additional notes about the return..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="font-medium text-orange-800">Return Summary</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Return type:</span>
                      <span className="font-medium capitalize">{returnType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Items to return:</span>
                      <span className="font-medium">
                        {returnType === "full" ? "All items" : `${selectedItems.length} selected`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Return amount:</span>
                      <span className="font-medium">₵ {calculateReturnAmount().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Refund method:</span>
                      <span className="font-medium capitalize">
                        {selectedTransaction.paymentMethod.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleProcessReturn}
                    disabled={processReturnMutation.isPending}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {processReturnMutation.isPending ? "Processing..." : "Process Return"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedTransaction(null);
                      setSelectedItems([]);
                      setReturnReason("");
                      setNotes("");
                      setSearchTerm("");
                      setReceiptNumber("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Returns */}
      {returns && returns.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {returns.slice(0, 5).map((returnItem: any) => (
                <div key={returnItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Return #{returnItem.id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(returnItem.createdAt).toLocaleDateString()} • {returnItem.reason.replace("_", " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">
                      -₵ {Number(returnItem.refundAmount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {returnItem.refundMethod.replace("_", " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
