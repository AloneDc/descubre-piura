"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline";

type Evento = {
  id: string;
  name: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  districts: { name: string }[];
};

function formatDateRange(start: string, end: string) {
  if (!start || !end) return "Sin fecha";
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const fromDate = new Date(start).toLocaleDateString("es-PE", options);
  const toDate = new Date(end).toLocaleDateString("es-PE", options);
  return fromDate === toDate ? fromDate : `${fromDate} – ${toDate}`;
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventos = async () => {
      const today = new Date().toISOString().split("T")[0]; // formato yyyy-mm-dd

      const res = await supabase
        .from("district_events")
        .select(
          "id, name, description, type, start_date, end_date, districts(name)"
        )
        .gte("end_date", today)
        .order("start_date", { ascending: true });

      if (res.error) {
        console.error("Error loading eventos:", res.error.message);
        setErrorMsg(res.error.message);
      } else if (res.data) {
        setEventos(res.data as Evento[]);
      }
    };

    fetchEventos();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Eventos en Piura
        </h1>
        <p className="text-lg text-gray-600 mb-12">
          Conoce los eventos culturales, religiosos y festivos que se realizarán
          próximamente en la región.
        </p>

        {errorMsg && (
          <p className="text-red-600 mb-6 font-medium">
            Error al cargar eventos: {errorMsg}
          </p>
        )}

        {eventos.length === 0 && !errorMsg ? (
          <p className="text-gray-500">No hay eventos próximos por ahora.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {eventos.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-xl shadow hover:shadow-lg p-6 transition"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {ev.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {ev.description?.slice(0, 150)}...
                </p>
                <div className="flex items-center gap-2 text-sm text-cyan-600 mb-1">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDateRange(ev.start_date, ev.end_date)}
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <MapPinIcon className="h-4 w-4" />
                  {ev.districts?.[0]?.name || "Distrito desconocido"}
                </div>
                <span className="mt-3 inline-block text-xs bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full font-medium capitalize">
                  {ev.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
