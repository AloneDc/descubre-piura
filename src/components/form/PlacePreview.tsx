import React from "react";
import { Place } from "@/types";

interface Stats {
  foods: string[];
  cultures: string[];
  count: number;
}

interface Props {
  places: Place[];
  climate: string;
  stats: Stats;
  error?: string;
}

const PlacePreview: React.FC<Props> = ({ places, climate, stats, error }) => {
  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded">{error}</div>
      )}

      {places.length > 0 && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold">
            📍 {places.length} lugares disponibles
          </h3>
          <ul className="list-disc pl-5 text-sm">
            {places.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong> – {p.type} / {p.experience_type}
              </li>
            ))}
          </ul>

          <h4 className="font-semibold mt-4">🍲 Comidas típicas:</h4>
          <p className="text-sm">
            {stats.foods.join(", ") || "No disponibles"}
          </p>

          <h4 className="font-semibold mt-2">🏛️ Notas culturales:</h4>
          <p className="text-sm">
            {stats.cultures.join(", ") || "No disponibles"}
          </p>

          <h4 className="font-semibold mt-2">🌤️ Clima estimado:</h4>
          <p className="text-sm">{climate}</p>
        </div>
      )}
    </div>
  );
};

export default PlacePreview;
