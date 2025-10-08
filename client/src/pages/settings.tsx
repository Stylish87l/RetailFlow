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
import { useTenantContext } from "@/contexts/tenant-context";
import { 
  Store, 
  Users, 
  Palette, 
  CreditCard, 
  Receipt, 
  Shield, 
  Plus,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react";
import type { User } from "@shared/schema";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("store");
  const [storeInfo, setStoreInfo] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: "#1976D2",
    themeMode: "light",
  });

  const { user } = useAuth();
  const { tenant } = useTenantContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: activeTab === "users",
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "New user has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const settingsTabs = [
    { id: "store", name: "Store Information", icon: Store },
    { id: "users", name: "User Management", icon: Users },
    { id: "theme", name: "Theme & Branding", icon: Palette },
    { id: "payments", name: "Payment Methods", icon: CreditCard },
    { id: "receipts", name: "Receipt Templates", icon: Receipt },
    { id: "security", name: "Backup & Security", icon: Shield },
  ];

  const userRoles = [
    { value: "staff", label: "Staff" },
    { value: "sales_attendant", label: "Sales Attendant" },
    { value: "cashier", label: "Cashier" },
    { value: "admin", label: "Admin" },
  ];

  // Check if user has admin access
  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access system settings.</p>
        </div>
      </div>
    );
  }

  const handleSaveStoreInfo = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Settings saved",
      description: "Store information has been updated successfully",
    });
  };

  const handleSaveTheme = () => {
    // Apply theme changes
    document.documentElement.style.setProperty("--primary", themeSettings.primaryColor);
    
    toast({
      title: "Theme updated",
      description: "Theme settings have been applied successfully",
    });
  };

  const handleCreateUser = (userData: any) => {
    createUserMutation.mutate(userData);
  };

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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-600">Configure your store settings and user management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-2">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${
                    activeTab === tab.id
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="mr-3 h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Store Information */}
          {activeTab === "store" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="mr-2 h-5 w-5" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                    <Input
                      value={tenant?.name || storeInfo.name}
                      onChange={(e) => setStoreInfo({...storeInfo, name: e.target.value})}
                      placeholder="Enter store name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop ID</label>
                    <Input
                      value={tenant?.subdomain || ""}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <Textarea
                      rows={2}
                      value={tenant?.address || storeInfo.address}
                      onChange={(e) => setStoreInfo({...storeInfo, address: e.target.value})}
                      placeholder="Enter store address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <Input
                      value={tenant?.phone || storeInfo.phone}
                      onChange={(e) => setStoreInfo({...storeInfo, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={tenant?.email || storeInfo.email}
                      onChange={(e) => setStoreInfo({...storeInfo, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={handleSaveStoreInfo} className="bg-primary-600 hover:bg-primary-700">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Management */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      User Management
                    </CardTitle>
                    <Button className="bg-primary-600 hover:bg-primary-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : users && users.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {users.map((user: User) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-sm font-medium text-gray-700">
                                      {user.firstName?.[0] || user.username[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.username}
                                    </div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge className={getRoleBadgeColor(user.role)}>
                                  {user.role.replace("_", " ")}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={user.isActive ? "default" : "secondary"}>
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No users found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Theme & Branding */}
          {activeTab === "theme" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Theme & Branding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
                        <Store className="text-white text-xl" />
                      </div>
                      <Button variant="outline">Upload Logo</Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={themeSettings.primaryColor}
                        onChange={(e) => setThemeSettings({...themeSettings, primaryColor: e.target.value})}
                        className="w-12 h-10 border border-gray-300 rounded"
                      />
                      <Input
                        value={themeSettings.primaryColor}
                        onChange={(e) => setThemeSettings({...themeSettings, primaryColor: e.target.value})}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme Mode</label>
                    <div className="flex space-x-4">
                      {["light", "dark", "auto"].map((mode) => (
                        <label key={mode} className="flex items-center">
                          <input
                            type="radio"
                            name="theme"
                            value={mode}
                            checked={themeSettings.themeMode === mode}
                            onChange={(e) => setThemeSettings({...themeSettings, themeMode: e.target.value})}
                            className="mr-2"
                          />
                          <span className="text-sm capitalize">{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={handleSaveTheme} className="bg-primary-600 hover:bg-primary-700">
                    Apply Theme
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other Settings Placeholders */}
          {activeTab === "payments" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Payment method configuration coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "receipts" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="mr-2 h-5 w-5" />
                  Receipt Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Receipt template customization coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Backup & Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Security and backup options coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
