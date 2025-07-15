// app/admin/components/Sidebar.tsx
import Link from "next/link";

export default function Sidebar() {
  const links = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Usuarios", href: "/admin/users", icon: "👥" },
    { label: "Lugares", href: "/admin/places", icon: "📍" },
    { label: "Itinerarios", href: "/admin/itineraries", icon: "🗺️" },
    { label: "Soporte", href: "/admin/support", icon: "💬" },
  ];

  return (
    <aside className="w-64 bg-white shadow flex flex-col">
      <div className="h-16 flex items-center justify-center text-2xl font-bold bg-teal-600 text-white">
        Admin Panel
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((lnk) => (
          <Link
            key={lnk.href}
            href={lnk.href}
            className="flex items-center p-2 rounded hover:bg-teal-100"
          >
            <span className="mr-3">{lnk.icon}</span>
            <span>{lnk.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
