import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ScanBarcode,
  Package,
  BarChart,
  ArrowLeftRight,
  Undo,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3, roles: ["admin", "cashier", "sales_attendant", "staff"] },
  { name: "POS System", href: "/pos", icon: ScanBarcode, roles: ["admin", "cashier", "sales_attendant"] },
  { name: "Inventory", href: "/inventory", icon: Package, roles: ["admin", "cashier"] },
  { name: "Reports", href: "/reports", icon: BarChart, roles: ["admin", "cashier"] },
  { name: "Cash Handover", href: "/handover", icon: ArrowLeftRight, roles: ["admin", "cashier"] },
  { name: "Returns", href: "/returns", icon: Undo, roles: ["admin", "cashier"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const hasAccess = (roles: string[]) => {
    return user && roles.includes(user.role);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          if (!hasAccess(item.roles)) return null;

          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href}>
              <a className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50"
              )}>
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
