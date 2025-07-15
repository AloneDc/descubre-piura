// app/admin/admins/components/AdminForm.tsx

"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AdminForm({ onSuccess }: { onSuccess: () => void }) {
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("editor");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Paso 1: buscar en auth.users
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers(); // necesitas service_role para esto

    if (authError || !authUsers) {
      setError("Error al buscar usuarios.");
      setLoading(false);
      return;
    }

    const foundUser = authUsers.users.find((u) => u.email === email);

    if (!foundUser) {
      setError("Usuario no encontrado en Supabase Auth.");
      setLoading(false);
      return;
    }

    // Paso 2: insertar en admins
    const { error: insertError } = await supabase.from("admins").insert({
      id: foundUser.id,
      email: foundUser.email,
      role,
      name: foundUser.user_metadata?.name || "",
    });

    if (insertError) {
      setError("Error al registrar administrador.");
    } else {
      setSuccess("Administrador registrado exitosamente.");
      setEmail("");
      setRole("editor");
      onSuccess();
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border p-4 rounded mb-6 bg-gray-50"
    >
      <h2 className="font-semibold text-lg">Nuevo Administrador</h2>
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Rol</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "editor")}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
      >
        {loading ? "Registrando..." : "Registrar"}
      </button>
    </form>
  );
}
