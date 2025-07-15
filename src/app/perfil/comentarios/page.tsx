"use client";

import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";

type Feedback = {
  id: string;
  rating: number;
  was_useful: boolean;
  comment: string;
  experience: "buena" | "mala";
  created_at: string;
  place: {
    name: string;
  } | null;
};

type RawFeedback = Omit<Feedback, "place"> & {
  place: { name: string } | { name: string }[];
};

export default function ComentariosPage() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [comentarios, setComentarios] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComentarios = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("place_feedback")
        .select(
          "id, rating, was_useful, comment, experience, created_at, place(name)"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const parsed: Feedback[] = (data as RawFeedback[]).map((c) => ({
          ...c,
          place: Array.isArray(c.place) ? c.place[0] : c.place,
        }));

        setComentarios(parsed);
      }

      setLoading(false);
    };

    fetchComentarios();
  }, [user, supabase]);

  if (loading) return <p className="p-6">Cargando comentarios...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">⭐ Mis Comentarios</h1>

      {comentarios.length === 0 ? (
        <p>No has dejado comentarios aún.</p>
      ) : (
        <ul className="space-y-4">
          {comentarios.map((fb) => (
            <li key={fb.id} className="border rounded p-4 bg-gray-50">
              <p className="text-sm text-gray-600">
                <strong>Lugar:</strong> {fb.place?.name || "Desconocido"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Fecha:</strong>{" "}
                {new Date(fb.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Experiencia:</strong> {fb.experience}
              </p>
              <p className="text-sm text-yellow-500">
                {"★".repeat(fb.rating)}
                {"☆".repeat(5 - fb.rating)}
              </p>
              {fb.comment && <p className="mt-2 text-gray-800">{fb.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
