import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface CashCounterProps {
  cashCounts: Record<number, number>;
  setCashCounts: (counts: Record<number, number>) => void;
}

export default function CashCounter({ cashCounts, setCashCounts }: CashCounterProps) {
  const denominations = [
    { value: 200, name: "Two Hundred Cedis", color: "bg-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
    { value: 100, name: "One Hundred Cedis", color: "bg-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
    { value: 50, name: "Fifty Cedis", color: "bg-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    { value: 20, name: "Twenty Cedis", color: "bg-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
    { value: 10, name: "Ten Cedis", color: "bg-yellow-700", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
    { value: 5, name: "Five Cedis", color: "bg-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
    { value: 2, name: "Two Cedis Coin", color: "bg-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200", isCoin: true },
    { value: 1, name: "One Cedi Coin", color: "bg-gray-500", bgColor: "bg-gray-50", borderColor: "border-gray-200", isCoin: true },
  ];

  const updateCount = (denomination: number, newCount: number) => {
    const count = Math.max(0, newCount);
    setCashCounts({
      ...cashCounts,
      [denomination]: count,
    });
  };

  const incrementCount = (denomination: number) => {
    const currentCount = cashCounts[denomination] || 0;
    updateCount(denomination, currentCount + 1);
  };

  const decrementCount = (denomination: number) => {
    const currentCount = cashCounts[denomination] || 0;
    updateCount(denomination, currentCount - 1);
  };

  const getSubtotal = (denomination: number) => {
    const count = cashCounts[denomination] || 0;
    return denomination * count;
  };

  const getTotalCounted = () => {
    return Object.entries(cashCounts).reduce((total, [denomination, count]) => {
      return total + (Number(denomination) * count);
    }, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Count Cash by Denomination</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {denominations.map((denom) => (
            <div
              key={denom.value}
              className={`flex items-center justify-between p-4 ${denom.bgColor} border ${denom.borderColor} rounded-lg`}
            >
              <div className="flex items-center space-x-3">
                <div className={`${denom.isCoin ? 'w-10 h-10 rounded-full' : 'w-16 h-10 rounded'} ${denom.color} flex items-center justify-center text-white text-xs font-bold`}>
                  ₵{denom.value}
                </div>
                <span className="font-medium text-gray-900">{denom.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full"
                  onClick={() => decrementCount(denom.value)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={cashCounts[denom.value] || 0}
                  onChange={(e) => updateCount(denom.value, parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-16 text-center text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full"
                  onClick={() => incrementCount(denom.value)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <span className="ml-4 font-medium text-gray-900 w-20 text-right">
                  ₵ {getSubtotal(denom.value).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Cash Counted:</span>
            <span className="text-2xl font-bold text-primary-600">
              ₵ {getTotalCounted().toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
