import { createContext, useContext, useEffect, useState } from "react";
import type { Tenant } from "@shared/schema";

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenantContext must be used within a TenantProvider");
  }
  return context;
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenantState] = useState<Tenant | null>(null);

 
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedTenant = window.localStorage.getItem("tenant_data");
        if (storedTenant) {
          // your logic here (e.g., setTenant(JSON.parse(storedTenant)))
        }
      } catch (error) {
        console.warn("localStorage access error:", error);
      }
    }
  }, []);


  const setTenant = (newTenant: Tenant) => {
    setTenantState(newTenant);
    localStorage.setItem("tenant_data", JSON.stringify(newTenant));
    
    // Apply theme
    if (newTenant.primaryColor) {
      document.documentElement.style.setProperty("--primary", newTenant.primaryColor);
    }
  };

  const value = {
    tenant,
    setTenant,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}
