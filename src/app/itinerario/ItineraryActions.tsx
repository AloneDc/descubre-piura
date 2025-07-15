"use client";

import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ItineraryActions() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGuardarItinerario = async () => {
    if (!user) {
      alert("Debes iniciar sesión para guardar tu itinerario.");
      router.push("/auth/login");
      return;
    }

    setSaving(true);

    try {
      const generated_text = sessionStorage.getItem("itinerary_result");
      const province = JSON.parse(
        sessionStorage.getItem("itinerary_province") || "null"
      );
      const district = JSON.parse(
        sessionStorage.getItem("itinerary_district") || "null"
      );
      const places = JSON.parse(
        sessionStorage.getItem("itinerary_places") || "[]"
      );
      const offers = JSON.parse(
        sessionStorage.getItem("itinerary_offers") || "[]"
      );
      const district_id = places?.[0]?.district_id || null;

      const { error } = await supabase.from("itineraries").insert({
        user_id: user.id,
        district_id,
        generated_text,
        input_data: { province, district, places, offers },
      });

      if (error) {
        console.error("Error al guardar itinerario:", error.message);
        alert("No se pudo guardar el itinerario. Intenta de nuevo.");
      } else {
        setSaved(true);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado al guardar el itinerario.");
    } finally {
      setSaving(false);
    }
  };

  const handleCrearNuevoItinerario = () => {
    sessionStorage.removeItem("itinerary_result");
    sessionStorage.removeItem("itinerary_id");
    sessionStorage.removeItem("itinerary_province");
    sessionStorage.removeItem("itinerary_district");
    sessionStorage.removeItem("itinerary_offers");
    sessionStorage.removeItem("itinerary_places");

    router.push("/planner"); // o "/generar" si tienes una ruta diferente
  };

  return (
    <section className="mt-10 space-y-4">
      <h2 className="text-xl font-semibold">🛠️ Acciones</h2>
      <div className="flex flex-wrap gap-4">
        <button
          className={`btn-accent ${
            saving ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleGuardarItinerario}
          disabled={saving || saved}
        >
          {saved
            ? "✅ Guardado"
            : saving
            ? "Guardando..."
            : "💾 Guardar itinerario"}
        </button>

        {/* Desactivado temporalmente PDF */}
        {/* <button className="btn-primary" onClick={downloadItineraryPdf}>
          📥 Descargar como PDF
        </button> */}

        <button className="btn-outline" onClick={handleCrearNuevoItinerario}>
          🆕 Crear nuevo itinerario
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Algunas funciones estarán disponibles próximamente.
      </p>
    </section>
  );
}
