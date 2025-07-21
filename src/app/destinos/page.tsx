"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MapPinIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type Province = { id: string; name: string };
type Place = { id: string; name: string; description: string; type: string };

export default function DestinosPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [placesMap, setPlacesMap] = useState<Record<string, Place[]>>({});

  useEffect(() => {
    supabase
      .from("provinces")
      .select("id, name")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setProvinces(data);
        else console.error("Error loading provinces", error);
      });
  }, []);

  const toggleExpand = async (prov: Province) => {
    if (expanded === prov.id) return setExpanded(null);
    setExpanded(prov.id);

    if (!placesMap[prov.id]) {
      const { data, error } = await supabase
        .from("places")
        .select("id, name, description, type, districts!inner(province_id)")
        .eq("is_active", true)
        .eq("districts.province_id", prov.id)
        .order("updated_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        setPlacesMap((m) => ({ ...m, [prov.id]: data }));
      } else {
        console.error("Error loading places for", prov.name, error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Explora por Provincia
        </h1>

        <div className="space-y-4">
          {provinces.map((prov) => (
            <div key={prov.id} className="border rounded-lg bg-white shadow">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left text-lg font-medium text-gray-800 hover:bg-gray-100"
                onClick={() => toggleExpand(prov)}
              >
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-cyan-600" />
                  {prov.name}
                </div>
                <span>{expanded === prov.id ? "▲" : "▼"}</span>
              </button>

              {expanded === prov.id && (
                <div className="px-4 py-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {placesMap[prov.id]?.map((pl) => (
                      <div
                        key={pl.id}
                        className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {pl.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {pl.description}
                        </p>
                        <p className="text-xs text-cyan-600 font-medium mb-3">
                          {pl.type}
                        </p>
                        <Link
                          href={`/destinos/${pl.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Ver más →
                        </Link>
                      </div>
                    ))}
                  </div>
                  {placesMap[prov.id]?.length === 6 && (
                    <button
                      onClick={() => toggleExpand(prov)}
                      className="mt-4 text-sm text-blue-600 hover:underline"
                    >
                      Ver menos
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
