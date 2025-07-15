"use client";

import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserCircleIcon,
  PencilSquareIcon,
  MapPinIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapIcon,
  CalendarDaysIcon,
  HeartIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export default function PerfilPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<null | {
    name: string;
    phone: string;
    country: string;
    region: string;
  }>(null);

  const [loading, setLoading] = useState(true);

  const [stats] = useState({
    itinerarios: 0,
    favoritos: 0,
    logros: 0,
    actividad: [
      {
        tipo: "itinerario",
        texto: "Nuevo itinerario creado",
        fecha: "2025-06-28",
      },
      {
        tipo: "reseña",
        texto: "Reseña agregada",
        fecha: "2025-06-21",
      },
    ],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("name, phone, country, region")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [user, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-50">
        <p className="text-lg text-gray-600">Cargando tu perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-50">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md">
          <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acceso requerido</h2>
          <p className="text-gray-600 mb-4">Inicia sesión para ver tu perfil</p>
          <Link
            href="/auth/login"
            className="bg-cyan-600 text-white px-6 py-2 rounded-full font-medium hover:bg-cyan-700 transition"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <UserCircleIcon className="h-16 w-16 text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">
                ¡Hola, {profile?.name || "Usuario"}!
              </h1>
              <p className="text-cyan-100">
                Bienvenido a tu panel personal en Descubre Piura
              </p>
            </div>
          </div>
        </div>

        {/* Sección principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info personal y stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información personal */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Información personal
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={EnvelopeIcon}
                  label="Email"
                  value={user.email || "No disponible"}
                />

                <InfoItem
                  icon={PhoneIcon}
                  label="Teléfono"
                  value={profile?.phone || "No especificado"}
                />
                <InfoItem
                  icon={GlobeAltIcon}
                  label="País"
                  value={profile?.country || "No especificado"}
                />
                <InfoItem
                  icon={MapPinIcon}
                  label="Región"
                  value={profile?.region || "No especificado"}
                />
              </div>
            </div>

            {/* Estadísticas del usuario */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Tu actividad
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard
                  icon={MapIcon}
                  label="Itinerarios"
                  value={stats.itinerarios}
                />
                <StatCard
                  icon={HeartIcon}
                  label="Favoritos"
                  value={stats.favoritos}
                />
                <StatCard
                  icon={TrophyIcon}
                  label="Logros"
                  value={stats.logros}
                />
              </div>
            </div>
          </div>

          {/* Acciones y actividad */}
          <div className="space-y-6">
            {/* Acciones rápidas */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Acciones rápidas
              </h2>
              <ul className="space-y-3">
                <QuickAction
                  href="/perfil/editar"
                  icon={PencilSquareIcon}
                  label="Editar perfil"
                />
                <QuickAction
                  href="/perfil/itinerarios"
                  icon={MapIcon}
                  label="Mis itinerarios"
                />
                <QuickAction
                  href="/perfil/comentarios"
                  icon={StarIcon}
                  label="Mis reseñas"
                />
                <QuickAction
                  href="/perfil/soporte"
                  icon={ChatBubbleLeftRightIcon}
                  label="Soporte"
                />
              </ul>
            </div>

            {/* Actividad reciente */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Actividad reciente
              </h2>
              <ul className="space-y-3">
                {stats.actividad.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
                  >
                    <CalendarDaysIcon className="h-5 w-5 text-cyan-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.texto}
                      </p>
                      <p className="text-xs text-gray-500">{item.fecha}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cerrar sesión */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponentes
function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 text-center shadow-sm">
      <Icon className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
      <div className="text-xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: IconType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
    >
      <Icon className="h-5 w-5 text-cyan-600" />
      <span className="font-medium text-gray-800">{label}</span>
    </Link>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
      <Icon className="h-5 w-5 text-cyan-600" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
