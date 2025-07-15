// app/providers.tsx

"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}
