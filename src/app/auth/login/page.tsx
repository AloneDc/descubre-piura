"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !user) {
      setErrorMsg(error?.message || "Error al iniciar sesión");
      setLoading(false);
      return;
    }

    // Verifica si es administrador
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .single();

    if (admin && !adminError) {
      router.push("/admin");
    } else {
      router.push("/perfil");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Iniciar sesión
        </h1>
        {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              name="email" // <-- AÑADIR ESTO
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              name="password" // <-- AÑADIR ESTO
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          ¿No tienes cuenta?{" "}
          <Link
            href="/auth/register"
            className="text-indigo-600 hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
