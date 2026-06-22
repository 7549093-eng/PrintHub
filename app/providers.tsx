"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/contexts/StoreContext";
import ClientLayout from "@/components/ClientLayout";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>
        <ClientLayout>{children}</ClientLayout>
      </StoreProvider>
    </AuthProvider>
  );
}
