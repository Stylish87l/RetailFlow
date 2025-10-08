import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { TenantProvider } from "@/contexts/tenant-context";
import { useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import POS from "@/pages/pos";
import Inventory from "@/pages/inventory";
import Reports from "@/pages/reports";
import Handover from "@/pages/handover";
import Returns from "@/pages/returns";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex pt-16">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/pos" component={POS} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/reports" component={Reports} />
            <Route path="/handover" component={Handover} />
            <Route path="/returns" component={Returns} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <TenantProvider>
            <Toaster />
            <AppContent />
          </TenantProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
