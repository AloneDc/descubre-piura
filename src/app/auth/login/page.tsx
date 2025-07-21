"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const checkIfAdmin = async (userId: string) => {
    const { data, error } = await supabase
      .from("admins")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (error) console.error("Error validando admin:", error.message);
    return !!data && !error;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !user) {
      setErrorMsg("Correo o contraseña inválidos.");
      setLoading(false);
      return;
    }

    const isAdmin = await checkIfAdmin(user.id);
    router.push(isAdmin ? "/admin" : "/perfil");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-blue-800 text-center mb-8">
          Iniciar sesión
        </h1>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 border border-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-blue-700 mb-1"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${
                  errorMsg ? "border-red-400" : "border-blue-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {email && !errorMsg && (
                <CheckCircleIcon className="h-5 w-5 text-green-500 absolute right-3 top-2.5" />
              )}
              {errorMsg && (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500 absolute right-3 top-2.5" />
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-blue-700 mb-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${
                  errorMsg ? "border-red-400" : "border-blue-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {password && !errorMsg && (
                <CheckCircleIcon className="h-5 w-5 text-green-500 absolute right-3 top-2.5" />
              )}
              {errorMsg && (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500 absolute right-3 top-2.5" />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-blue-700">
          ¿No tienes cuenta?{" "}
          <Link
            href="/auth/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
