import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useTenantContext } from "@/contexts/tenant-context";
import { Store } from "lucide-react";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const { setTenant } = useTenantContext();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      shopId: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", data);
      const result = await response.json();
      
      login(result.token, result.user);
      setTenant(result.tenant);
      
      toast({
        title: "Welcome back!",
        description: `Logged in successfully as ${result.user.role}`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Store className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">RetailFlow POS</h1>
              <p className="text-gray-600">Multi-Tenant Point of Sale System</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="shopId" className="block text-sm font-medium text-gray-700 mb-2">
                  Shop ID / Subdomain
                </Label>
                <Input
                  id="shopId"
                  {...form.register("shopId")}
                  placeholder="Enter your shop ID"
                  className="w-full"
                />
                {form.formState.errors.shopId && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.shopId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </Label>
                <Input
                  id="username"
                  {...form.register("username")}
                  placeholder="Enter username"
                  className="w-full"
                />
                {form.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.username.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder="Enter password"
                  className="w-full"
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Demo Roles: Admin | Cashier | Sales Attendant | Staff
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
