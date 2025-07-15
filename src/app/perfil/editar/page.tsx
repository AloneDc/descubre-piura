"use client";

import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function EditarPerfilPage() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    country: "",
    region: "",
  });

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("name, phone, country, region")
        .eq("id", user.id)
        .single();

      if (data) {
        setForm(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    const { error } = await supabase
      .from("users")
      .update(form)
      .eq("id", user?.id);

    if (error) {
      setErrorMsg("Error al actualizar el perfil.");
    } else {
      setSuccess(true);
    }
  };

  if (loading) return <p className="p-6">Cargando datos...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow p-6 rounded">
      <h1 className="text-2xl font-bold mb-4">Editar Perfil</h1>

      {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}
      {success && (
        <p className="text-green-600 mb-4">Perfil actualizado correctamente.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nombre"
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Teléfono"
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="text"
          name="country"
          value={form.country}
          onChange={handleChange}
          placeholder="País"
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="text"
          name="region"
          value={form.region}
          onChange={handleChange}
          placeholder="Región"
          className="w-full px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
