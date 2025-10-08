import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTenantContext } from "@/contexts/tenant-context";
import { Store, Moon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const { user, logout } = useAuth();
  const { tenant } = useTenantContext();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "cashier":
        return "bg-blue-100 text-blue-800";
      case "sales_attendant":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg mr-3 flex items-center justify-center">
                <Store className="text-white text-sm" />
              </div>
              <span className="font-bold text-xl text-gray-900">RetailFlow</span>
              {tenant && (
                <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                  {tenant.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                {user.role.replace("_", " ")}
              </div>
            )}

            <Button variant="ghost" size="sm">
              <Moon className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.firstName?.[0] || user?.username?.[0] || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
