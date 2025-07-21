"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { supabase as supabaseClient } from "@/lib/supabaseClient";
import {
  Province,
  District,
  FormData,
  Place,
  Offer,
  PlaceStats,
} from "@/types";

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

export default function FormPlanificador() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [form, setForm] = useState<FormData>(initialForm);
  const [days, setDays] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [extractedData, setExtractedData] = useState<{
    form: FormData;
    days: number;
    places: Place[];
    stats: PlaceStats;
    climate: string;
    offers: Offer[];
  } | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const isInvalidDateRange =
    form.dateStart &&
    form.dateEnd &&
    new Date(form.dateEnd) < new Date(form.dateStart);

  const steps = [
    "Ubicación",
    "Fechas",
    "Experiencia",
    "Prioridades",
    "Finalizar",
  ];
  const currentStep =
    !form.provinceId || !form.districtId
      ? 1
      : !form.dateStart || !form.dateEnd
      ? 2
      : !form.experience_type
      ? 3
      : !form.priority || isInvalidDateRange
      ? 4
      : 5;

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  useEffect(() => {
    (async () => {
      const { data: prov } = await supabaseClient.from("provinces").select("*");
      const { data: dist } = await supabaseClient.from("districts").select("*");
      setProvinces((prov as Province[]) ?? []);
      setDistricts((dist as District[]) ?? []);
    })();
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

  const handleChange = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const getInclusive = (level: number) =>
    ["bajo", "medio", "alto"].slice(0, level);

  const prepareData = async () => {
    const levels = getInclusive(form.effort_level);
    const prices = getInclusive(form.price_range);

    const { data: placesData } = await supabaseClient
      .from("places")
      .select("*")
      .eq("district_id", form.districtId)
      .eq("experience_type", form.experience_type)
      .in("effort_level", levels)
      .in("price_range", prices)
      .eq("is_active", true);

    const places = (placesData as Place[]) ?? [];

    const foodsSet = new Set<string>();
    const culturesSet = new Set<string>();
    places.forEach((p) => {
      const lf = Array.isArray(p.local_foods)
        ? p.local_foods
        : String(p.local_foods).split(",");
      lf.forEach((x) => foodsSet.add(x.trim()));
      const cn = Array.isArray(p.cultural_notes)
        ? p.cultural_notes
        : String(p.cultural_notes).split(",");
      cn.forEach((x) => culturesSet.add(x.trim()));
    });

    const stats: PlaceStats = {
      foods: [...foodsSet],
      cultures: [...culturesSet],
      count: places.length,
    };

    const placeIds = places.map((p) => p.id);
    const { data: offersData } = await supabaseClient
      .from("offers")
      .select("*")
      .in("place_id", placeIds)
      .eq("is_active", true);
    const offers = (offersData as Offer[]) ?? [];

    return { form, days, places, stats, climate: "Desconocido", offers };
  };

  const handlePreviewData = async () => {
    setLoading(true);
    try {
      const data = await prepareData();
      setExtractedData(data);
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      alert("Error al extraer los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateItinerary = async () => {
    setLoading(true);
    setShowLoadingModal(true);

    try {
      const data = await prepareData();

      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await response.json();

      if (!body.success) {
        alert("❌ Error generando itinerario");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session?.user) {
        alert("Por favor, inicia sesión primero.");
        router.push("/login");
        return;
      }

      const { error: insertError } = await supabase.from("itineraries").insert([
        {
          user_id: session.user.id,
          district_id: form.districtId,
          generated_text: body.result,
          input_data: {
            province: body.provinceInfo,
            district: body.districtInfo,
            places: data.places,
            offers: body.offers,
          },
        },
      ]);

      if (insertError) {
        console.error("Error guardando en Supabase:", insertError);
        alert("No se pudo guardar el itinerario");
        return;
      }

      router.push("/itinerario");
    } catch (err) {
      console.error("❌ Error generando itinerario:", err);
      alert("❌ Hubo un error inesperado");
    } finally {
      setLoading(false);
      setShowLoadingModal(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-center text-sky-800 mb-6">
            Planificador de Itinerario
          </h1>

          <div className="mb-10">
            <div className="flex justify-between text-sm mb-2 text-gray-600">
              <span>
                Paso {currentStep} de {steps.length}
              </span>
              <span>{Math.round(progressPercentage)}% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
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
            {form.dateStart && form.dateEnd && !isInvalidDateRange && (
              <ExperienceSelector form={form} onChange={handleChange} />
            )}
            {form.experience_type && !isInvalidDateRange && (
              <PrioritySelector form={form} onChange={handleChange} />
            )}

            {form.priority && !isInvalidDateRange && (
              <div className="text-center pt-4 space-y-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePreviewData}
                  className="px-6 py-3 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition"
                >
                  🔍 Ver datos previos
                </button>
                <button
                  disabled={loading}
                  onClick={handleGenerateItinerary}
                  className={`block w-full px-8 py-4 rounded-full font-semibold text-lg text-white shadow-lg transition-all ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  }`}
                >
                  {loading ? "⏳ Generando..." : "🚀 Generar Itinerario"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 shadow-xl overflow-auto max-h-[80vh]">
            <h2 className="text-xl font-bold mb-4">Datos extraídos</h2>
            <pre className="text-sm bg-gray-100 p-4 rounded whitespace-pre-wrap">
              {JSON.stringify(extractedData, null, 2)}
            </pre>
            <div className="text-right mt-4">
              <button
                onClick={() => setShowPreview(false)}
                className="text-blue-600 hover:underline font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Carga */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-blue-800 font-medium text-lg">
              Generando tu itinerario...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
