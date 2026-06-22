"use client";

import { type ReactNode } from "react";
import { StoreProvider } from "@/contexts/StoreContext";
import ClientLayout from "@/components/ClientLayout";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <ClientLayout>{children}</ClientLayout>
    </StoreProvider>
  );
}
