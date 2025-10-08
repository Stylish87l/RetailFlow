import { useQuery } from "@tanstack/react-query";
import KPICards from "@/components/dashboard/kpi-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { TrendingUp, Receipt, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ["/api/dashboard/kpis"],
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions", "10"],
  });

  if (kpisLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">
          Welcome back, {user?.firstName || user?.username}. Here's what's happening at your store today.
        </p>
      </div>

      <KPICards kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Sales Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Sales Trend (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Sales Chart Visualization</p>
                <p className="text-sm text-gray-400">Chart component would render here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="mr-2 h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactionsLoading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded"></div>
                  ))}
                </div>
              ) : recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions.slice(0, 5).map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Receipt className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          #{transaction.receiptNumber || transaction.id.slice(-6)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ₵ {Number(transaction.total).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {transaction.paymentMethod.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
