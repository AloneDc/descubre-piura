"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface AppUser {
  id: string;
  name?: string;
  phone?: string;
  country?: string;
  region?: string;
  created_at?: string;
}

export default function UsersPage() {
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");

      if (error) {
        console.error("Error cargando usuarios:", error);
        return;
      }

      setUsers(data || []);
      setLoading(false);
    };

    fetchUsers();
  }, [supabase]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Usuarios registrados</h1>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Nombre</th>
                <th className="p-2">País</th>
                <th className="p-2">Región</th>
                <th className="p-2">Teléfono</th>
                <th className="p-2">ID</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    {user.name ? (
                      user.name
                    ) : (
                      <span className="text-gray-400">Sin nombre</span>
                    )}
                  </td>
                  <td className="p-2">
                    {user.country || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="p-2">
                    {user.region || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="p-2">
                    {user.phone || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="p-2">
                    <code className="text-xs text-gray-500">{user.id}</code>
                  </td>
                  <td className="p-2 space-x-2">
                    <button className="text-blue-600 hover:underline">
                      Editar
                    </button>
                    <button className="text-red-600 hover:underline">
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
