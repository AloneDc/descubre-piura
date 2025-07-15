"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface SupportRequest {
  id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  user_name: string;
}

interface RawSupportRequest {
  id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  users: { name: string | null }[];
}

export default function SupportPage() {
  const supabase = createClientComponentClient();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupport = async () => {
      const { data, error } = await supabase
        .from("support_requests")
        .select(
          `
          id,
          type,
          subject,
          message,
          status,
          created_at,
          users (
            name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar solicitudes:", error);
        return;
      }

      const mapped = (data as RawSupportRequest[]).map((req) => ({
        id: req.id,
        type: req.type,
        subject: req.subject,
        message: req.message,
        status: req.status,
        created_at: req.created_at,
        user_name: req.users?.[0]?.name || "Sin nombre",
      }));

      setRequests(mapped);
      setLoading(false);
    };

    fetchSupport();
  }, [supabase]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Solicitudes de soporte</h1>

      {loading ? (
        <p>Cargando solicitudes...</p>
      ) : requests.length === 0 ? (
        <p>No hay solicitudes registradas.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Usuario</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Asunto</th>
                <th className="p-2">Mensaje</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{r.user_name}</td>
                  <td className="p-2 capitalize">{r.type}</td>
                  <td className="p-2">{r.subject}</td>
                  <td className="p-2 text-gray-700 max-w-xs truncate">
                    {r.message}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        r.status === "resuelto"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {new Date(r.created_at).toLocaleDateString()}
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
