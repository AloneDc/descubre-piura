"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  HomeIcon,
  CalendarIcon,
  SparklesIcon,
  NewspaperIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const current = window.scrollY;
      setIsVisible(current < lastScrollY || current < 50);
      lastScrollY = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={clsx(
        "fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-6xl z-50 transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-24"
      )}
    >
      <div className="bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500/80 backdrop-blur-md text-white rounded-full shadow-lg px-6 py-3 border border-cyan-100/30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SparklesIcon className="h-5 w-5" />
          <span className="text-lg font-semibold">Descubre Piura</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <NavLinks />
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none"
            aria-label="Abrir menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={clsx(
          "md:hidden bg-sky-600/90 backdrop-blur px-6 mt-2 rounded-xl shadow transition-all duration-300 overflow-hidden",
          menuOpen ? "max-h-60 py-4" : "max-h-0 py-0"
        )}
      >
        <NavLinks mobile />
      </div>
    </nav>
  );
}

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const linkClass = mobile
    ? "flex items-center gap-2 text-sky-100 py-2 px-3 rounded hover:bg-sky-500/70 transition"
    : "flex items-center gap-2 hover:text-sky-100 hover:drop-shadow-glow transition";

  return (
    <>
      <Link href="/" className={linkClass}>
        <HomeIcon className="h-5 w-5" /> Inicio
      </Link>
      <Link href="/planner" className={linkClass}>
        <CalendarIcon className="h-5 w-5" /> Planificar viaje
      </Link>
      <Link href="/events" className={linkClass}>
        <SparklesIcon className="h-5 w-5" /> Eventos
      </Link>
      <Link href="/noticias" className={linkClass}>
        <NewspaperIcon className="h-5 w-5" /> Noticias
      </Link>

      {user ? (
        <>
          <Link href="/perfil" className={linkClass}>
            <UserCircleIcon className="h-5 w-5" />
            {user.user_metadata?.name || "Mi perfil"}
          </Link>
          <button onClick={handleLogout} className={linkClass}>
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Cerrar sesión
          </button>
        </>
      ) : (
        <Link href="/auth/login" className={linkClass}>
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Iniciar sesión
        </Link>
      )}
    </>
  );
}
