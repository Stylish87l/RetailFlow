import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, TrendingUp } from "lucide-react";

export default function Reports() {
  const [dateRange, setDateRange] = useState("last_7_days");
  const [reportType, setReportType] = useState("sales_summary");

  const { data: salesReport, isLoading } = useQuery({
    queryKey: ["/api/reports/sales", dateRange],
    enabled: false, // Only load when explicitly requested
  });

  const dateRanges = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last_7_days", label: "Last 7 days" },
    { value: "last_30_days", label: "Last 30 days" },
    { value: "custom", label: "Custom Range" },
  ];

  const reportTypes = [
    { value: "sales_summary", label: "Sales Summary" },
    { value: "product_performance", label: "Product Performance" },
    { value: "staff_performance", label: "Staff Performance" },
    { value: "payment_methods", label: "Payment Methods" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sales Reports & Analytics</h1>
        <p className="text-gray-600">Track your store performance and generate detailed reports</p>
      </div>

      {/* Report Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outlet</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option>All Outlets</option>
                <option>Main Store</option>
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <Button className="flex-1 bg-primary-600 hover:bg-primary-700">
                Generate Report
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Sales Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Sales Chart Visualization</p>
                <p className="text-sm text-gray-400">Interactive chart would display here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Gross Sales</span>
                  <span className="font-semibold text-gray-900">₵ 2,847.50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Net Sales</span>
                  <span className="font-semibold text-gray-900">₵ 2,623.75</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Returns</span>
                  <span className="font-semibold text-red-600">₵ 223.75</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Transactions</span>
                  <span className="font-semibold text-gray-900">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Sale</span>
                  <span className="font-semibold text-gray-900">₵ 22.42</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Cash</span>
                  </div>
                  <span className="text-sm font-medium">67%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Card</span>
                  </div>
                  <span className="text-sm font-medium">28%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Mobile Money</span>
                  </div>
                  <span className="text-sm font-medium">5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Products Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
                      <div className="text-sm font-medium text-gray-900">Sample Product</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₵ 0.00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0%</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No sales data available for the selected period
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
