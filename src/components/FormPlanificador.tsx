"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Province, District, FormData, PlaceStats } from "@/types";

import LocationSelector from "./form/LocationSelector";
import DateRangeSelector from "./form/DateRangeSelector";
import ExperienceSelector from "./form/ExperienceSelector";
import PrioritySelector from "./form/PrioritySelector";

const initialForm: FormData = {
  provinceId: "",
  districtId: "",
  dateStart: "",
  dateEnd: "",
  experience_type: "",
  effort_level: 2,
  price_range: 2,
  priority: "",
};

const steps = [
  { id: 1, name: "Ubicación", icon: "📍" },
  { id: 2, name: "Fechas", icon: "📅" },
  { id: 3, name: "Experiencia", icon: "🎯" },
  { id: 4, name: "Prioridades", icon: "⭐" },
  { id: 5, name: "Finalizar", icon: "🚀" },
];

export default function FormPlanificador() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>(initialForm);
  const [days, setDays] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const getCurrentStep = (): number => {
    if (!form.provinceId || !form.districtId) return 1;
    if (!form.dateStart || !form.dateEnd) return 2;
    if (!form.experience_type) return 3;
    if (!form.priority) return 4;
    return 5;
  };

  const currentStep = getCurrentStep();
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  useEffect(() => {
    async function load() {
      const [provRes, distRes] = await Promise.all([
        supabase.from("provinces").select("*"),
        supabase.from("districts").select("*"),
      ]);
      setProvinces(provRes.data ?? []);
      setDistricts(distRes.data ?? []);
    }
    load();
  }, []);

  useEffect(() => {
    if (form.dateStart && form.dateEnd) {
      const diff =
        (new Date(form.dateEnd).getTime() -
          new Date(form.dateStart).getTime()) /
          (1000 * 60 * 60 * 24) +
        1;
      setDays(diff > 0 ? diff : 1);
    }
  }, [form.dateStart, form.dateEnd]);

  const handleChange = <K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const getInclusive = (level: number): string[] =>
    ["bajo", "medio", "alto"].slice(0, level);

  const handleGenerateItinerary = async (): Promise<void> => {
    setLoading(true);

    try {
      const levels = getInclusive(form.effort_level);
      const prices = getInclusive(form.price_range);

      const { data: placesData } = await supabase
        .from("places")
        .select("*")
        .eq("district_id", form.districtId)
        .eq("experience_type", form.experience_type)
        .in("effort_level", levels)
        .in("price_range", prices)
        .eq("is_active", true);

      const foodsSet = new Set<string>();
      const culturesSet = new Set<string>();
      const climateMap: Record<string, number> = {};

      placesData?.forEach((p) => {
        const foods = Array.isArray(p.local_foods)
          ? p.local_foods
          : typeof p.local_foods === "string"
          ? p.local_foods.split(",")
          : [];
        (foods as string[]).forEach((f: string) => foodsSet.add(f.trim()));

        const cultures = Array.isArray(p.cultural_notes)
          ? p.cultural_notes
          : typeof p.cultural_notes === "string"
          ? p.cultural_notes.split(",")
          : [];
        (cultures as string[]).forEach((c: string) =>
          culturesSet.add(c.trim())
        );
      });

      const stats: PlaceStats = {
        foods: Array.from(foodsSet),
        cultures: Array.from(culturesSet),
        count: placesData?.length || 0,
      };

      const climate =
        Object.entries(climateMap).sort((a, b) => b[1] - a[1])[0]?.[0] ??
        "Desconocido";

      const placeIds = placesData?.map((p) => p.id) ?? [];

      const { data: offersData } = await supabase
        .from("offers")
        .select("*")
        .in("place_id", placeIds)
        .eq("is_active", true);

      const payload = {
        form,
        days,
        places: placesData,
        stats,
        climate,
        offers: offersData ?? [],
      };

      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (body.success) {
        sessionStorage.setItem("itinerary_result", body.result || "");
        if (body.provinceInfo) {
          sessionStorage.setItem(
            "itinerary_province",
            JSON.stringify(body.provinceInfo)
          );
        }
        if (body.districtInfo) {
          sessionStorage.setItem(
            "itinerary_district",
            JSON.stringify(body.districtInfo)
          );
        }
        if (body.offers) {
          sessionStorage.setItem(
            "itinerary_offers",
            JSON.stringify(body.offers)
          );
        }
        if (placesData && placesData.length) {
          sessionStorage.setItem(
            "itinerary_places",
            JSON.stringify(placesData)
          );
        }
        router.push("/itinerario");
      } else {
        alert("❌ Error al generar el itinerario");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Hubo un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Formulario principal */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-center text-sky-800 mb-6">
            Planificador de Itinerario
          </h1>

          {/* Progreso */}
          <div className="mb-10">
            <div className="flex justify-between text-sm mb-2 text-gray-600">
              <span>
                Paso {currentStep} de {steps.length}
              </span>
              <span>{Math.round(progressPercentage)}% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-8 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <LocationSelector
              provinces={provinces}
              districts={districts}
              form={form}
              onChange={handleChange}
            />

            {form.districtId && (
              <DateRangeSelector
                form={form}
                onChange={handleChange}
                days={days}
              />
            )}

            {form.dateStart && form.dateEnd && (
              <ExperienceSelector form={form} onChange={handleChange} />
            )}

            {form.experience_type && (
              <PrioritySelector form={form} onChange={handleChange} />
            )}

            {form.priority && (
              <div className="text-center pt-4">
                <button
                  disabled={loading}
                  onClick={handleGenerateItinerary}
                  className={`px-8 py-4 rounded-full font-semibold text-lg text-white shadow-lg transition-all duration-300 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  }`}
                >
                  🚀 {loading ? "Generando..." : "Generar mi Itinerario"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de carga */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white px-8 py-6 rounded-xl shadow-xl text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">
              Generando tu itinerario...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
