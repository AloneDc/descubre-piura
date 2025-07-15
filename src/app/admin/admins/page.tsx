// app/admin/admins/page.tsx

"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Admin } from "@/types";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchAdmins = async () => {
      const { data, error } = await supabase
        .from("admins")
        .select("id, name, email, role, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAdmins(data as Admin[]);
      }

      setLoading(false);
    };

    fetchAdmins();
  }, [supabase]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administradores</h1>
        <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
          + Nuevo Admin
        </button>
      </div>

      {loading ? (
        <div>Cargando administradores...</div>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Rol</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-t">
                <td className="p-2">{admin.name || "-"}</td>
                <td className="p-2">{admin.email}</td>
                <td className="p-2 capitalize">{admin.role}</td>
                <td className="p-2 space-x-2">
                  <button className="text-blue-600 hover:underline">
                    Editar
                  </button>
                  <button className="text-red-600 hover:underline">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
