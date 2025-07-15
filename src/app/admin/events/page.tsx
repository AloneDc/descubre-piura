"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Event {
  id: string;
  name: string;
  type: string;
  description?: string;
  date_range: string;
  district_name: string;
  province_name: string;
}

interface Province {
  name: string;
}

interface District {
  name: string;
  provinces: Province[];
}

interface RawEvent {
  id: string;
  name: string;
  type: string;
  description?: string;
  date_range: string;
  districts: District[];
}

export default function EventsPage() {
  const supabase = createClientComponentClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("district_events")
        .select(
          `
          id,
          name,
          type,
          description,
          date_range,
          districts (
            name,
            provinces (
              name
            )
          )
        `
        )
        .order("date_range", { ascending: false });

      if (error) {
        console.error("Error al cargar eventos:", error);
        return;
      }

      const formatted = (data as RawEvent[]).map((e) => {
        const district = e.districts?.[0];
        const province = district?.provinces?.[0];

        return {
          id: e.id,
          name: e.name,
          type: e.type,
          description: e.description,
          date_range: e.date_range,
          district_name: district?.name || "Sin distrito",
          province_name: province?.name || "Sin provincia",
        };
      });

      setEvents(formatted);
      setLoading(false);
    };

    fetchEvents();
  }, [supabase]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Eventos distritales</h1>

      {loading ? (
        <p>Cargando eventos...</p>
      ) : events.length === 0 ? (
        <p>No hay eventos registrados aún.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Nombre</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Provincia</th>
                <th className="p-2">Distrito</th>
                <th className="p-2">Fechas</th>
                <th className="p-2">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const range = event.date_range
                  .replace("[", "")
                  .replace(")", "")
                  .split(",");
                const from = range[0]?.trim();
                const to = range[1]?.trim();

                return (
                  <tr key={event.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{event.name}</td>
                    <td className="p-2">{event.type}</td>
                    <td className="p-2">{event.province_name}</td>
                    <td className="p-2">{event.district_name}</td>
                    <td className="p-2">
                      {from} - {to}
                    </td>
                    <td className="p-2 text-gray-600">
                      {event.description || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
