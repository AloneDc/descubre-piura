"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import dynamic from "next/dynamic";

const FormPlanificador = dynamic(
  () => import("@/components/FormPlanificador"),
  { ssr: false }
);

export default function PlanificarPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar sesión inicial
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setLoading(false);
    };
    initAuth();

    // Escuchar cambios de auth
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setIsLoggedIn(!!s);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">Verificando sesión...</p>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto mt-20 bg-white shadow-md p-6 rounded-lg text-center border border-red-200">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Debes iniciar sesión
        </h2>
        <p className="text-gray-600 mb-6">
          Inicia sesión para poder planificar tu itinerario personalizado.
        </p>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => router.push("/login")}
        >
          Ir al login
        </button>
      </div>
    );
  }

  // Ya autenticado: mostrar formulario
  return (
    <section className="max-w-3xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6">Planifica tu viaje</h1>
      <FormPlanificador />
    </section>
  );
}
