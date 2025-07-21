"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  MapPinIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

type Destino = {
  id: string;
  name: string;
  description: string;
  type: string;
};

export default function Home() {
  const [destinos, setDestinos] = useState<Destino[]>([]);

  useEffect(() => {
    const fetchDestinos = async () => {
      const { data, error } = await supabase
        .from("places")
        .select("id, name, description, type")
        .eq("is_active", true)
        .limit(8)
        .order("updated_at", { ascending: false });

      if (!error && data) setDestinos(data);
      else console.error("Error fetching destinos", error);
    };

    fetchDestinos();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[95vh] flex items-center justify-center text-center px-4 bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
        <div className="absolute inset-0 bg-[url('/piura.jpg')] bg-cover bg-center opacity-15"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium">
              <SparklesIcon className="h-4 w-4" />
              Powered by AI
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-sky-800 leading-tight">
            Descubre{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
              Piura
            </span>
          </h1>

          <p className="mt-6 text-xl md:text-2xl text-sky-700 max-w-3xl mx-auto leading-relaxed">
            Tu asistente inteligente para crear itinerarios únicos en el norte
            del Perú. Explora playas, desiertos, cultura y gastronomía con
            planes personalizados.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <SparklesIcon className="h-5 w-5" />
              Crear Itinerario IA
            </Link>

            <Link
              href="/destinos"
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur text-sky-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white transition-all border border-sky-200 hover:border-sky-300"
            >
              <MapPinIcon className="h-5 w-5" />
              Explorar Destinos
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Combinamos inteligencia artificial con conocimiento local para
              crear la experiencia perfecta
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                IA Personalizada
              </h3>
              <p className="text-gray-600">
                Nuestro algoritmo crea itinerarios únicos basados en tus
                preferencias, tiempo y presupuesto
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Destinos Únicos
              </h3>
              <p className="text-gray-600">
                Desde las playas de Máncora hasta el desierto de Sechura,
                descubre lugares increíbles
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tiempo Real
              </h3>
              <p className="text-gray-600">
                Información actualizada sobre clima, eventos y disponibilidad de
                servicios
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Destinos Populares */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-sky-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Destinos Populares en Piura
            </h2>
            <p className="text-xl text-gray-600">
              Los lugares más visitados por nuestros viajeros
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinos.map((destination) => (
              <div
                key={destination.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-br from-sky-200 to-cyan-200 flex items-center justify-center text-center text-white text-xl font-semibold">
                  {destination.name}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {destination.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {destination.description}
                  </p>
                  <p className="text-xs text-cyan-600 font-medium">
                    {destination.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para tu próxima aventura?
          </h2>
          <p className="text-xl text-cyan-100 mb-10 max-w-2xl mx-auto">
            Únete a miles de viajeros que ya han descubierto Piura con nuestros
            itinerarios inteligentes
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 bg-white text-cyan-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              <SparklesIcon className="h-5 w-5" />
              Comenzar Ahora
            </Link>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all border border-white/30"
            >
              <CalendarDaysIcon className="h-5 w-5" />
              Ver Eventos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
