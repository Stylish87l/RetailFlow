import { useState } from "react";
import CashCounter from "@/components/handover/cash-counter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { Printer } from "lucide-react";

export default function Handover() {
  const [cashCounts, setCashCounts] = useState<Record<number, number>>({});
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [supervisorId, setSupervisorId] = useState("");
  const [notes, setNotes] = useState("");
  const { user } = useAuth();

  const expectedAmount = 2047.25; // Mock expected amount
  const actualAmount = Object.entries(cashCounts).reduce((total, [denomination, count]) => {
    return total + (Number(denomination) * count);
  }, 0);
  const difference = actualAmount - expectedAmount;

  const handleSubmitHandover = () => {
    console.log("Submitting handover:", {
      cashCounts,
      shiftDate,
      supervisorId,
      notes,
      expectedAmount,
      actualAmount,
      difference,
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cash Handover</h1>
        <p className="text-gray-600">End-of-shift cash counting and handover process</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashCounter cashCounts={cashCounts} setCashCounts={setCashCounts} />

        <div className="space-y-6">
          {/* Shift Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Shift Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Expected Cash Sales:</span>
                  <span className="font-medium text-gray-900">₵ 1,847.25</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Opening Float:</span>
                  <span className="font-medium text-gray-900">₵ 200.00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Expected Total:</span>
                  <span className="font-medium text-gray-900">₵ {expectedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Actual Count:</span>
                  <span className="font-medium text-gray-900">₵ {actualAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-semibold text-gray-900">Difference:</span>
                  <span className={`text-lg font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₵ {difference.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Handover Details */}
          <Card>
            <CardHeader>
              <CardTitle>Handover Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift Date</label>
                  <Input
                    type="date"
                    value={shiftDate}
                    onChange={(e) => setShiftDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cashier Name</label>
                  <Input
                    value={user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={supervisorId}
                    onChange={(e) => setSupervisorId(e.target.value)}
                  >
                    <option value="">Select Supervisor</option>
                    <option value="supervisor1">Sarah Manager</option>
                    <option value="supervisor2">Mike Supervisor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <Textarea
                    rows={3}
                    placeholder="Any discrepancies or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSubmitHandover}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Submit Handover
            </Button>
            <Button variant="outline" className="w-full">
              Save as Draft
            </Button>
            <Button variant="outline" className="w-full">
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
