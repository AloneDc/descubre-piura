"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Place {
  id: string;
  name: string;
  type: string;
  experience_type: string;
  effort_level: string;
  price_range: string;
  is_active: boolean;
  district_id: string;
  district_name: string;
  province_name: string;
}

export default function PlacesPage() {
  const supabase = createClientComponentClient();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      const { data, error } = await supabase.rpc("get_places_with_locations"); // usamos una función SQL personalizada

      if (error) {
        console.error("Error al cargar lugares:", error);
        return;
      }

      setPlaces(data || []);
      setLoading(false);
    };

    fetchPlaces();
  }, [supabase]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Lugares turísticos</h1>

      {loading ? (
        <p>Cargando lugares...</p>
      ) : places.length === 0 ? (
        <p>No hay lugares registrados aún.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Nombre</th>
                <th className="p-2">Provincia</th>
                <th className="p-2">Distrito</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Experiencia</th>
                <th className="p-2">Esfuerzo</th>
                <th className="p-2">Precio</th>
                <th className="p-2">Activo</th>
              </tr>
            </thead>
            <tbody>
              {places.map((place) => (
                <tr key={place.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{place.name}</td>
                  <td className="p-2">{place.province_name}</td>
                  <td className="p-2">{place.district_name}</td>
                  <td className="p-2">{place.type}</td>
                  <td className="p-2">{place.experience_type}</td>
                  <td className="p-2">{place.effort_level}</td>
                  <td className="p-2">{place.price_range}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        place.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {place.is_active ? "Activo" : "Inactivo"}
                    </span>
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
