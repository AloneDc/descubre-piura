"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import StatCard from "./components/StatCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Tipos explícitos
type UserRow = {
  name: string | null;
  phone: string | null;
  created_at: string;
};

type ItineraryRow = {
  created_at: string;
};

type WeeklyData = {
  week: string;
  count: number;
};

export default function AdminDashboard() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [stats, setStats] = useState({
    users: 0,
    places: 0,
    itineraries: 0,
    avgRating: 0,
    supportPending: 0,
    offers: 0,
    events: 0,
  });

  const [usersRecent, setUsersRecent] = useState<UserRow[]>([]);
  const [itineraryData, setItineraryData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return router.push("/login");

      const { data: admin } = await supabase
        .from("admins")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!admin || admin.role !== "admin") return router.push("/unauthorized");

      const [
        usersCount,
        placesCount,
        itinerariesCount,
        placeFeedback,
        itineraryFeedback,
        supportCount,
        offersCount,
        eventsCount,
        recentUsers,
        itinerariesPerWeek,
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase
          .from("places")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("itineraries")
          .select("*", { count: "exact", head: true }),
        supabase.from("place_feedback").select("rating"),
        supabase.from("itinerary_feedback").select("rating"),
        supabase
          .from("support_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "pendiente"),
        supabase
          .from("offers")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("district_events")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("users")
          .select("name, phone, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("itineraries").select("created_at"),
      ]);

      const ratings = [
        ...(placeFeedback.data || []),
        ...(itineraryFeedback.data || []),
      ];
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) /
            ratings.length
          : 0;

      // Generar últimas 8 semanas
      const weeks: WeeklyData[] = [];
      const now = new Date();

      for (let i = 7; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i * 7);
        const weekLabel = `Sem ${8 - i}`;
        weeks.push({ week: weekLabel, count: 0 });
      }

      // Contar itinerarios por semana
      (itinerariesPerWeek.data as ItineraryRow[]).forEach((item) => {
        const date = new Date(item.created_at);
        const weekIndex = getRelativeWeekIndex(date, now);
        if (weekIndex >= 0 && weekIndex < 8) {
          weeks[weekIndex].count += 1;
        }
      });

      setStats({
        users: usersCount.count || 0,
        places: placesCount.count || 0,
        itineraries: itinerariesCount.count || 0,
        avgRating: Number(avgRating.toFixed(1)),
        supportPending: supportCount.count || 0,
        offers: offersCount.count || 0,
        events: eventsCount.count || 0,
      });

      setUsersRecent(recentUsers.data as UserRow[]);
      setItineraryData(weeks);
      setLoading(false);
    })();
  }, [supabase, router]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Usuarios"
          value={stats.users.toString()}
          color="purple"
          icon="👥"
        />
        <StatCard
          title="Lugares activos"
          value={stats.places.toString()}
          color="teal"
          icon="📍"
        />
        <StatCard
          title="Itinerarios"
          value={stats.itineraries.toString()}
          color="blue"
          icon="🗺️"
        />
        <StatCard
          title="Feedback promedio"
          value={stats.avgRating.toString()}
          color="yellow"
          icon="⭐"
        />
        <StatCard
          title="Soporte pendiente"
          value={stats.supportPending.toString()}
          color="red"
          icon="📨"
        />
        <StatCard
          title="Ofertas activas"
          value={stats.offers.toString()}
          color="blue"
          icon="🏷️"
        />
        <StatCard
          title="Eventos"
          value={stats.events.toString()}
          color="teal"
          icon="🎉"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Actividad de Itinerarios
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={itineraryData}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#0d9488"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Últimos usuarios registrados
        </h2>
        <table className="w-full text-sm text-gray-700">
          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="py-2">Nombre</th>
              <th className="py-2">Teléfono</th>
              <th className="py-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {usersRecent.map((u, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2">{u.name || "Sin nombre"}</td>
                <td>{u.phone || "No disponible"}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Calcular qué semana relativa es (0 = más antigua, 7 = esta semana)
function getRelativeWeekIndex(itemDate: Date, now: Date): number {
  const diffInDays = Math.floor(
    (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.floor((7 * 7 - diffInDays) / 7);
}
