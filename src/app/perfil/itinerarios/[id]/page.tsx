"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { Place, Offer, District, Province } from "@/types"; // ajusta si ya los tienes

type InputData = {
  offers: Offer[];
  places: Place[];
  district: District;
  province: Province;
};

type ItinerarioDetalle = {
  id: string;
  generated_text: string;
  created_at: string;
  district_id: string | null;
  input_data: InputData;
  district_name?: string | null;
};

export default function ItinerarioDetallePage() {
  const { id } = useParams();
  const supabase = useSupabaseClient();
  const user = useUser();

  const [itinerario, setItinerario] = useState<ItinerarioDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user || !id) return;

    const fetchDetalle = async () => {
      try {
        const { data, error } = await supabase
          .from("itineraries")
          .select("id, generated_text, created_at, district_id, input_data")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error || !data) {
          setErrorMsg("Itinerario no encontrado o no tienes permiso.");
          return;
        }

        let district_name: string | null = null;
        if (data.district_id) {
          const { data: dist, error: distErr } = await supabase
            .from("districts")
            .select("name")
            .eq("id", data.district_id)
            .single();

          if (!distErr && dist) district_name = dist.name;
        }

        setItinerario({ ...data, district_name });
      } catch (err) {
        console.error(err);
        setErrorMsg("Error al cargar el detalle del itinerario.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetalle();
  }, [user, supabase, id]);

  if (loading) return <p className="p-6">Cargando itinerario...</p>;
  if (errorMsg) return <p className="p-6 text-red-600">{errorMsg}</p>;
  if (!itinerario) return null;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg space-y-6">
      <Link
        href="/perfil/itinerarios"
        className="text-indigo-600 hover:underline"
      >
        ← Volver a mis itinerarios
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">🧭 Itinerario guardado</h1>
        <p className="text-gray-600">
          <strong>Fecha:</strong>{" "}
          {new Date(itinerario.created_at).toLocaleDateString()}
        </p>
        <p className="text-gray-600">
          <strong>Distrito:</strong>{" "}
          {itinerario.district_name || "No especificado"}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">📋 Texto completo</h2>
        <pre className="bg-gray-50 p-4 rounded border whitespace-pre-wrap text-gray-800">
          {itinerario.generated_text}
        </pre>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">📌 Datos del viaje</h2>
        <pre className="bg-gray-50 p-4 rounded border overflow-x-auto text-sm text-gray-700">
          {JSON.stringify(itinerario.input_data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
