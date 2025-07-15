"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const user = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    const newUser = data.user;
    if (newUser) {
      const { error: dbError } = await supabase.from("users").insert({
        id: newUser.id,
        name,
        phone,
        country,
        region,
      });

      if (dbError) {
        setErrorMsg("Error creando datos del usuario.");
        console.error(dbError);
        setLoading(false);
        return;
      }

      router.push("/perfil");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Crear cuenta
        </h1>
        {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="País"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Región"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-indigo-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
