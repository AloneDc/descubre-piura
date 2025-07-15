"use client";

import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";

type Itinerario = {
  id: string;
  generated_text: string;
  created_at: string;
  district_id: string | null;
  district_name?: string;
};

type ItinerarioDB = {
  id: string;
  generated_text: string;
  created_at: string;
  district_id: string | null;
};

type DistrictDB = {
  id: string;
  name: string;
};

export default function MisItinerarios() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchItinerarios = async () => {
      try {
        const { data, error } = await supabase
          .from("itineraries")
          .select("id, generated_text, created_at, district_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error || !data) {
          console.error("Error al obtener itinerarios:", error?.message);
          setErrorMsg("No se pudieron cargar tus itinerarios.");
          return;
        }

        const districtIds = [
          ...new Set(
            data.map((it: ItinerarioDB) => it.district_id).filter(Boolean)
          ),
        ];

        const { data: districts } = await supabase
          .from("districts")
          .select("id, name")
          .in("id", districtIds);

        const formatted: Itinerario[] = data.map((it: ItinerarioDB) => ({
          id: it.id,
          generated_text: it.generated_text,
          created_at: it.created_at,
          district_id: it.district_id,
          district_name:
            districts?.find((d: DistrictDB) => d.id === it.district_id)?.name ??
            null,
        }));

        setItinerarios(formatted);
      } catch (err) {
        console.error("Error inesperado:", err);
        setErrorMsg("Hubo un error inesperado.");
      } finally {
        setLoading(false);
      }
    };

    fetchItinerarios();
  }, [user, supabase]);

  if (loading) {
    return <p className="p-6 text-gray-600">Cargando itinerarios...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">🗺️ Mis Itinerarios</h1>

      {errorMsg && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          {errorMsg}
        </p>
      )}

      {itinerarios.length === 0 ? (
        <p className="text-gray-700">No has generado ningún itinerario aún.</p>
      ) : (
        <ul className="space-y-4">
          {itinerarios.map((itinerario) => (
            <li
              key={itinerario.id}
              className="border rounded-md p-4 bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {new Date(itinerario.created_at).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Distrito:</strong>{" "}
                    {itinerario.district_name || "No asignado"}
                  </p>
                  <p className="mt-2 text-gray-800 line-clamp-2">
                    {itinerario.generated_text}
                  </p>
                </div>
                <div>
                  <Link
                    href={`/perfil/itinerarios/${itinerario.id}`}
                    className="text-sm text-indigo-600 hover:underline font-medium"
                  >
                    Ver detalles →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
