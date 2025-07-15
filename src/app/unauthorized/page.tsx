"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function UnauthorizedPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const { data: admin } = await supabase
        .from("admins")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (admin?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    };

    checkSessionAndRedirect();
  }, [router, supabase]);

  const handleLoginRedirect = () => {
    router.push("/");
  };

  return (
    <div className="max-w-xl mx-auto mt-20 text-center px-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">
        Acceso no autorizado
      </h1>
      <p className="text-gray-700 mb-6">
        No tienes permisos para acceder al panel de administración.
      </p>
      <button
        onClick={handleLoginRedirect}
        className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
      >
        salir
      </button>
    </div>
  );
}
