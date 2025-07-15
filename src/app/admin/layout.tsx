"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [adminName, setAdminName] = useState<string | null>(null);

  useEffect(() => {
    const getAdminInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: admin } = await supabase
        .from("admins")
        .select("name, email")
        .eq("id", user.id)
        .single();

      if (admin) {
        setAdminName(admin.name || admin.email);
      }
    };

    getAdminInfo();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r flex flex-col justify-between">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-teal-700 mb-8">Admin Panel</h2>
          <nav className="space-y-3 text-sm">
            <SidebarLink href="/admin" label="📊 Dashboard" />
            <SidebarLink href="/admin/admins" label="🧑‍💼 Administradores" />
            <SidebarLink href="/admin/users" label="👥 Usuarios" />
            <SidebarLink href="/admin/places" label="📍 Lugares" />
            <SidebarLink href="/admin/offers" label="🏷️ Ofertas" />
            <SidebarLink href="/admin/events" label="🎉 Eventos" />
            <SidebarLink href="/admin/support" label="📨 Soporte" />
            <SidebarLink href="/admin/feedback" label="📝 Feedback" />
          </nav>
        </div>

        <div className="p-6 border-t text-sm text-gray-600">
          <p className="mb-2">Sesión iniciada como:</p>
          <p className="font-semibold text-gray-800 mb-4">
            {adminName || "Admin"}
          </p>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-white shadow flex items-center px-6 border-b">
          <h1 className="text-lg font-semibold text-gray-800">
            Panel de Administración
          </h1>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 rounded hover:bg-teal-100 text-gray-700 transition"
    >
      {label}
    </Link>
  );
}
