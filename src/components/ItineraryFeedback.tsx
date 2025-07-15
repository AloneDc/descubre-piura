"use client";

import { useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

interface Props {
  itineraryId: string;
}

export default function ItineraryFeedback({ itineraryId }: Props) {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [rating, setRating] = useState(5);
  const [wasUseful, setWasUseful] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!user) {
      setError("Debes iniciar sesión para enviar feedback.");
      return;
    }
    if (wasUseful === null) {
      setError("Selecciona si te fue útil o no.");
      return;
    }

    const { error } = await supabase.from("itinerary_feedback").insert({
      itinerary_id: itineraryId,
      user_id: user.id,
      rating,
      was_useful: wasUseful,
      comment: comment.trim(),
    });

    if (error) {
      console.error("Error al enviar feedback:", error.message);
      setError("No se pudo enviar tu opinión. Intenta nuevamente.");
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <p className="text-green-600 font-medium">✅ ¡Gracias por tu opinión!</p>
    );
  }

  return (
    <div className="space-y-4 text-gray-800">
      <h3 className="text-lg font-semibold">Tu Opinión</h3>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1">Calificación (1‑5)</label>
          <select
            value={rating}
            onChange={(e) => setRating(+e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)}
                {"☆".repeat(5 - n)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">¿Te fue útil?</label>
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="useful"
                value="yes"
                onChange={() => setWasUseful(true)}
                className="mr-2"
              />
              Sí
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="useful"
                value="no"
                onChange={() => setWasUseful(false)}
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block mb-1">Comentario (opcional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full border px-3 py-2 rounded"
          placeholder="Escribe tus impresiones aquí..."
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-pink-600 text-white px-5 py-2 rounded hover:bg-pink-700 transition"
      >
        Enviar opinión
      </button>
    </div>
  );
}
