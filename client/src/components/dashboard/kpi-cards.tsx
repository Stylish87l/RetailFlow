import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Receipt, AlertTriangle, Users } from "lucide-react";

interface KPICardsProps {
  kpis?: {
    todaySales: number;
    todayTransactions: number;
    lowStockItems: number;
    activeStaff: number;
  };
}

export default function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    {
      title: "Today's Sales",
      value: kpis ? `₵ ${kpis.todaySales.toFixed(2)}` : "₵ 0.00",
      change: "+12.5% from yesterday",
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: "text-green-600",
    },
    {
      title: "Transactions",
      value: kpis?.todayTransactions?.toString() || "0",
      change: "+8.2% from yesterday",
      icon: Receipt,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: "text-green-600",
    },
    {
      title: "Low Stock Items",
      value: kpis?.lowStockItems?.toString() || "0",
      change: "Requires attention",
      icon: AlertTriangle,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      changeColor: "text-orange-600",
    },
    {
      title: "Active Staff",
      value: kpis?.activeStaff?.toString() || "0",
      change: "Currently online",
      icon: Users,
      bgColor: "bg-gray-100",
      iconColor: "text-gray-600",
      changeColor: "text-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className={`text-sm ${card.changeColor}`}>{card.change}</p>
              </div>
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <card.icon className={`${card.iconColor} h-6 w-6`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
