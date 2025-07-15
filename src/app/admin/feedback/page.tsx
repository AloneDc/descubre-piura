"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface PlaceFeedback {
  id: string;
  user_name: string;
  place_name: string;
  rating: number;
  experience: string;
  comment: string;
  created_at: string;
}

interface ItineraryFeedback {
  id: string;
  user_name: string;
  itinerary_id: string;
  rating: number;
  was_useful: boolean;
  comment: string;
  created_at: string;
}

interface PlaceFeedbackRaw {
  id: string;
  rating: number;
  experience: string;
  comment: string;
  created_at: string;
  users: { name: string | null }[];
  places: { name: string | null }[];
}

interface ItineraryFeedbackRaw {
  id: string;
  rating: number;
  was_useful: boolean;
  comment: string;
  created_at: string;
  itinerary_id: string;
  users: { name: string | null }[];
}

export default function FeedbackPage() {
  const supabase = createClientComponentClient();
  const [placeFeedback, setPlaceFeedback] = useState<PlaceFeedback[]>([]);
  const [itineraryFeedback, setItineraryFeedback] = useState<
    ItineraryFeedback[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      const [placeRes, itineraryRes] = await Promise.all([
        supabase
          .from("place_feedback")
          .select(
            `
            id,
            rating,
            experience,
            comment,
            created_at,
            users ( name ),
            places ( name )
          `
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("itinerary_feedback")
          .select(
            `
            id,
            rating,
            was_useful,
            comment,
            created_at,
            users ( name ),
            itinerary_id
          `
          )
          .order("created_at", { ascending: false }),
      ]);

      if (placeRes.error) console.error("Error lugares:", placeRes.error);
      if (itineraryRes.error)
        console.error("Error itinerarios:", itineraryRes.error);

      const formattedPlace = (placeRes.data as PlaceFeedbackRaw[]).map((f) => ({
        id: f.id,
        user_name: f.users?.[0]?.name || "Anónimo",
        place_name: f.places?.[0]?.name || "Lugar desconocido",
        rating: f.rating,
        experience: f.experience,
        comment: f.comment,
        created_at: f.created_at,
      }));

      const formattedItinerary = (
        itineraryRes.data as ItineraryFeedbackRaw[]
      ).map((f) => ({
        id: f.id,
        user_name: f.users?.[0]?.name || "Anónimo",
        itinerary_id: f.itinerary_id,
        rating: f.rating,
        was_useful: f.was_useful,
        comment: f.comment,
        created_at: f.created_at,
      }));

      setPlaceFeedback(formattedPlace);
      setItineraryFeedback(formattedItinerary);
      setLoading(false);
    };

    fetchFeedback();
  }, [supabase]);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-2xl font-bold mb-4">Comentarios sobre Lugares</h1>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2">Usuario</th>
                  <th className="p-2">Lugar</th>
                  <th className="p-2">Rating</th>
                  <th className="p-2">Experiencia</th>
                  <th className="p-2">Comentario</th>
                  <th className="p-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {placeFeedback.map((fb) => (
                  <tr key={fb.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{fb.user_name}</td>
                    <td className="p-2">{fb.place_name}</td>
                    <td className="p-2">{fb.rating}</td>
                    <td className="p-2 capitalize">{fb.experience}</td>
                    <td className="p-2">{fb.comment}</td>
                    <td className="p-2">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">
          Comentarios sobre Itinerarios
        </h2>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2">Usuario</th>
                  <th className="p-2">Itinerario</th>
                  <th className="p-2">Rating</th>
                  <th className="p-2">¿Útil?</th>
                  <th className="p-2">Comentario</th>
                  <th className="p-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {itineraryFeedback.map((fb) => (
                  <tr key={fb.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{fb.user_name}</td>
                    <td className="p-2">{fb.itinerary_id.slice(0, 8)}...</td>
                    <td className="p-2">{fb.rating}</td>
                    <td className="p-2">{fb.was_useful ? "Sí" : "No"}</td>
                    <td className="p-2">{fb.comment}</td>
                    <td className="p-2">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
