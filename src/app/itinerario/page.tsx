"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Province, District, Place, Offer } from "@/types";

import ItineraryMap from "./ItineraryMap";
import ItineraryActions from "./ItineraryActions";
import ItineraryFeedback from "@/components/ItineraryFeedback";

interface ItineraryData {
  id: string;
  generated_text: string;
  input_data: {
    province: Province;
    district: District;
    places: Place[];
    offers: Offer[];
  };
}

export default function ItineraryPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [userName, setUserName] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setAuthenticated(false);
        return;
      }

      setAuthenticated(true);
      const user = session.user;
      setUserName(user.user_metadata?.name || user.email);

      const { data } = await supabase
        .from("itineraries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setItinerary(data);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  if (authenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md text-center bg-white shadow-xl rounded-xl p-8 border">
          <h2 className="text-2xl font-bold text-red-600 mb-3">
            Acceso restringido
          </h2>
          <p className="text-gray-600 mb-6">
            Inicia sesión para ver tu itinerario personalizado.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Cargando tu itinerario...</p>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
        <div className="bg-white p-10 rounded-xl shadow-xl text-center border">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            📦 Sin Itinerario
          </h2>
          <p className="text-gray-600 mb-6">
            Aún no has generado un itinerario.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Crear uno ahora →
          </button>
        </div>
      </div>
    );
  }

  const { province, district, places, offers } = itinerary.input_data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white shadow border-b py-6 px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🗺️ Itinerario Personalizado
            </h1>
            <p className="text-gray-600 mt-1">
              Explora tu plan de viaje hecho a medida
            </p>
            {userName && (
              <p className="text-gray-500 mt-1 text-sm">
                👋 Hola, <span className="font-semibold">{userName}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2 text-sm text-gray-500 mt-3 lg:mt-0">
            {province && (
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                📍 {province.name}
              </span>
            )}
            {district && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                🏘️ {district.name}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="grid xl:grid-cols-3 gap-6 px-6 lg:px-12 py-8">
        <section className="xl:col-span-2 space-y-6">
          {/* Provincia & Distrito */}
          <div className="grid md:grid-cols-2 gap-6">
            {province && (
              <Card title="📍 Provincia" color="from-blue-600 to-indigo-600">
                <h3 className="text-2xl font-bold">{province.name}</h3>
                <p className="text-gray-600 mt-2">{province.description}</p>
              </Card>
            )}
            {district && (
              <Card title="🏘️ Distrito" color="from-green-600 to-emerald-600">
                <h3 className="text-2xl font-bold">{district.name}</h3>
                <p className="text-gray-600 mt-2">{district.description}</p>
              </Card>
            )}
          </div>

          {/* Itinerario */}
          <Card
            title="📋 Itinerario Detallado"
            color="from-purple-600 to-violet-600"
          >
            <div
              id="itinerary-content"
              className="prose prose-lg text-gray-700 whitespace-pre-wrap"
            >
              {itinerary.generated_text}
            </div>
          </Card>

          {/* Ofertas */}
          {offers.length > 0 && (
            <Card
              title="🎁 Ofertas Especiales"
              color="from-orange-600 to-red-600"
            >
              <div className="grid gap-4">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-orange-50 p-4 rounded-lg border hover:shadow-md transition"
                  >
                    <h4 className="font-semibold text-gray-800">
                      {offer.title}
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      {offer.description}
                    </p>
                    <a
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 text-sm mt-2 inline-block hover:underline"
                    >
                      Ver oferta →
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Acciones */}
          <Card title="⚡ Acciones" color="from-gray-800 to-slate-800">
            <ItineraryActions />
          </Card>

          {/* Feedback */}
          <Card title="📝 Opinión" color="from-pink-600 to-rose-600">
            <ItineraryFeedback itineraryId={itinerary.id} />
          </Card>
        </section>

        {/* Mapa */}
        <aside className="w-full h-full sticky top-6">
          <Card
            title="🗺️ Mapa Interactivo"
            color="from-emerald-600 to-teal-600"
          >
            <div className="h-[500px] rounded-xl overflow-hidden">
              <ItineraryMap places={places} />
            </div>
          </Card>
        </aside>
      </main>
    </div>
  );
}

// Reusable Card component
function Card({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
      <div className={`bg-gradient-to-r ${color} text-white p-4`}>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
