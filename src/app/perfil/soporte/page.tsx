"use client";

import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";

type SupportRequest = {
  id: string;
  type: "reclamo" | "sugerencia" | "problema";
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

export default function SoportePage() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [form, setForm] = useState({
    type: "sugerencia",
    subject: "",
    message: "",
  });

  const [historial, setHistorial] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("support_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar historial:", error.message);
        setError("No se pudo cargar el historial.");
      } else {
        setHistorial(data || []);
      }

      setLoading(false);
    };

    fetchHistorial();
  }, [user, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    if (!user) {
      setError("Debes iniciar sesión para enviar una solicitud.");
      return;
    }

    const { error: insertError } = await supabase
      .from("support_requests")
      .insert({
        user_id: user.id,
        ...form,
      });

    if (insertError) {
      console.error("Error al enviar solicitud:", insertError.message);
      setError("No se pudo enviar la solicitud.");
    } else {
      setForm({ type: "sugerencia", subject: "", message: "" });
      setSuccess(true);

      const { data: updatedData } = await supabase
        .from("support_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setHistorial(updatedData || []);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg space-y-6">
      <h1 className="text-2xl font-bold">💬 Soporte</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {success && (
          <p className="text-green-600">
            Tu solicitud fue enviada correctamente.
          </p>
        )}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="sugerencia">Sugerencia</option>
              <option value="reclamo">Reclamo</option>
              <option value="problema">Problema</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Asunto</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Mensaje</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={4}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
        >
          Enviar solicitud
        </button>
      </form>

      <hr />

      <div>
        <h2 className="text-xl font-semibold mb-4">
          🗂️ Historial de solicitudes
        </h2>
        {loading ? (
          <p>Cargando historial...</p>
        ) : historial.length === 0 ? (
          <p>No has enviado solicitudes aún.</p>
        ) : (
          <ul className="space-y-3">
            {historial.map((req) => (
              <li key={req.id} className="bg-gray-50 p-4 rounded border">
                <p className="text-sm text-gray-600">
                  <strong>Fecha:</strong>{" "}
                  {new Date(req.created_at).toLocaleDateString()}
                </p>
                <p>
                  <strong>{req.type.toUpperCase()}:</strong> {req.subject}
                </p>
                <p className="text-gray-700 mt-1">{req.message}</p>
                <p className="text-sm mt-2">
                  <strong>Estado:</strong>{" "}
                  <span
                    className={
                      req.status === "resuelto"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }
                  >
                    {req.status}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
