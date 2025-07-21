"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";

export default function RegisterPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    country: "",
    region: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ error?: string; success?: string }>(
    {}
  );

  const allowedCountries = ["Perú", "Chile", "Colombia", "México", "Argentina"];
  const nameRegex = /^[a-zA-ZÁÉÍÓÚÑñ ]{3,30}$/;
  const phoneRegex = /^[0-9]{7,15}$/;
  const locationRegex = /^[a-zA-ZÁÉÍÓÚÑñ ]{2,30}$/;

  const validate = () => {
    const { name, phone, country, region, email, password } = form;
    const newErrors: Record<string, string> = {};

    if (!nameRegex.test(name)) newErrors.name = "Nombre inválido.";
    if (!phoneRegex.test(phone)) newErrors.phone = "Teléfono inválido.";
    if (!allowedCountries.includes(country))
      newErrors.country = "País no permitido.";
    if (!locationRegex.test(region)) newErrors.region = "Región inválida.";
    if (!email.includes("@") || email.length < 6)
      newErrors.email = "Correo inválido.";
    if (password.length < 6) newErrors.password = "Contraseña muy corta.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setStatus({});

    const { email, password, name, phone, country, region } = form;
    const cleanedEmail = email.trim().toLowerCase();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: cleanedEmail,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/login`,
      },
    });

    if (signUpError) {
      setStatus({ error: signUpError.message });
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { error: insertError } = await supabase.from("users").upsert({
        id: userId,
        name,
        phone,
        country,
        region,
      });

      if (insertError) {
        setStatus({ error: "No se pudo guardar tu información." });
        setLoading(false);
        return;
      }
    }

    setStatus({ success: "✅ Revisa tu correo para validar tu cuenta." });
    setTimeout(() => router.refresh(), 2000);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white p-10 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-blue-800 text-center mb-8">
          Crear cuenta
        </h1>

        {status.error && (
          <p className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 border border-red-300">
            {status.error}
          </p>
        )}
        {status.success && (
          <p className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 border border-green-300">
            {status.success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { name: "name", label: "Nombre completo" },
            { name: "phone", label: "Teléfono" },
            { name: "country", label: "País" },
            { name: "region", label: "Región" },
            { name: "email", label: "Correo electrónico" },
            { name: "password", label: "Contraseña", type: "password" },
          ].map(({ name, label, type = "text" }) => (
            <div key={name}>
              <label
                htmlFor={name}
                className="block text-sm font-medium text-blue-700 mb-1"
              >
                {label}
              </label>
              <div className="relative">
                <input
                  type={type}
                  name={name}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-md border focus:outline-none ${
                    errors[name]
                      ? "border-red-400 focus:ring-2 focus:ring-red-300"
                      : "border-blue-300 focus:ring-2 focus:ring-blue-400"
                  }`}
                />
                {form[name as keyof typeof form] && !errors[name] && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 absolute right-3 top-2.5" />
                )}
                {errors[name] && (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500 absolute right-3 top-2.5" />
                )}
              </div>
              {errors[name] && (
                <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-blue-700">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
