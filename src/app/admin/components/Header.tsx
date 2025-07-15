// app/admin/components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function Header() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [adminName, setAdminName] = useState<string>("");

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data: admin } = await supabase
          .from("admins")
          .select("name")
          .eq("id", session.user.id)
          .single();
        setAdminName(admin?.name || "");
      }
    })();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        {adminName && <span className="text-gray-600">Hola, {adminName}</span>}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
