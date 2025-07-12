"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Providers wrapper for CO2 Emission Calculator
 * 
 * Provides:
 * - NextAuth session provider for authentication
 * Note: tRPC is configured using createTRPCNext in lib/trpc.ts
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
} 