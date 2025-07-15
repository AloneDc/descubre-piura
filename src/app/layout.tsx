// app/layout.tsx

import "./styles/globals.css";
import Script from "next/script";
import { SupabaseProvider } from "./providers";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Descubre Piura",
  description:
    "Explora lo mejor de Piura - eventos, noticias y planifica tu viaje",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
          strategy="beforeInteractive"
        />
      </head>

      <body className="min-h-screen bg-gradient-to-r from-sky-100 via-cyan-50 to-blue-100 text-gray-900">
        <SupabaseProvider>
          <Navbar />
          {/* Espacio para el navbar fijo */}
          <main className="pt-20 px-2">{children}</main>
        </SupabaseProvider>
      </body>
    </html>
  );
}
